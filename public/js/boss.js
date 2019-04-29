import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";
import * as particles			from "/js/particles.js";
import { bossDoor, doorButton }	from "/js/door.js";
import { thorn, thornImg  }		from "/js/thorn.js";
import generateVineImg			from "/js/generateVineImg.js";
import generateTileImg			from "/js/generateTileImg.js";
import * as reds				from "/js/reds.js";
import { optimizeObstacles }	from "/js/generateLevel.js";

const boss = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos: v.add(pos, vec(0, 0)),
		size: vec(150, 150),
	})(that);

	traits.addSpriteTrait({
		color: "red",
	})(that);

	traits.addMoveTrait({
		velocity: vec(0, 0),
	})(that);

	traits.addColTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.007,
	})(that);

	that.setupStage = ({ world: { add }, sprites, JSON }) => {

		for(let y = 0; y < that.lives; y++){
			for(let x = 0; x < 10; x++){
				add(bossDoor(vec(that.pos.x + x * 15, that.pos.y + that.size.y + y * 15), y), "obstacles", 2);
			}
		}

		add(attackCountdownSprite(vec(that.pos.x - 20, that.pos.y - 10)), "attackCountdown", 10, true);

		that.attack(setupAttack, { add, sprites, JSON })

		that.removeMethods("setupStage");
	}

	that.checkStartTrigger = ({ world: { player } }) => {
		if(player.pos.x > 10 * 14 && player.pos.x < 12 * 15 && player.pos.y === 12 * 15 && player.onGround){
			that.start();
			that.removeMethods("checkStartTrigger");
		}
	}

	that.start = () => {
		that.waitCounter = 60 * 1;
	}

	that.currentAttack = 0;

	that.attacking = false;

	that.lives = 4;

	that.attackCounter = 0;

	that.attackDelay = 1.5 * 60;

	that.waitCounter = 0;

	that.attacks = firstStageAttacks;

	that.handleAttacking = ({ world, world: { add }, sprites, JSON }) => {
		that.waitCounter--;
		that.attackCounter--;
		
		if(that.waitCounter === 0){

			that.cleanUpAttack(world);

			that.attack(that.attacks[that.currentAttack], { add, sprites, JSON });

			that.attackCounter = that.attacks[that.currentAttack].duration;

			that.currentAttack++;
		}

		if(that.attackCounter === 0){
			that.cleanUpAttack(world);

			that.attack(failAttack, { add, sprites, JSON });
		}

	}

	that.checkDoorBtns = ({ world: { door_buttons, blockers } }) => {
		if(door_buttons) door_buttons.forEach(btn => {
			if(btn.partOfAttack && btn.hit && that.waitCounter < -120){
				that.attackCounter = -1;

				that.lives--;

				that.waitCounter = that.attackDelay;
			}
		});
	}

	let obstacles = [];
	let vines = [];

	that.attack = (attack, { add, sprites, JSON }) => {

		obstacles.splice(0, obstacles.length);
		vines.splice(0, vines.length);

		attack.template.forEach((row, y) => strEach(row, (tile, x) => {
			let pos = vec(x * 15 + 30, y * 15);

			if(tile === ","){
				const o = obstacle(pos.copy());
				o.partOfAttack = true;
				vines.push(o);
			}
			if(tile === "/"){
				const o = obstacle(pos.copy());
				o.partOfAttack = true;
				obstacles.push(o)
			}
			if(tile === "-"){
				const o = doorButton(pos.copy(), 4 + that.stage * 4 - that.lives);
				o.partOfAttack = true;
				add(o, "door_buttons", 1);
			}

			if(tile === "1") add(reds.red(pos.copy()), "reds", 5);
			if(tile === "2") add(reds.jumper(pos.copy()), "reds", 5);
			if(tile === "3") add(reds.spawner(pos.copy()), "reds", 5);
			if(tile === "4") add(reds.giant(pos.copy()), "reds", 5);
			if(tile === "5") add(reds.smallJumper(pos.copy()), "reds", 5);
			if(tile === "6") add(reds.hunter(pos.copy()), "reds", 5);
			if(tile === "7") add(reds.redBird(pos.copy()), "reds", 5);
			
		}));

		obstacles = optimizeObstacles(obstacles);
		vines = optimizeObstacles(vines);

		obstacles.forEach(o => add(o, "obstacles", 0));
		vines.forEach(v => add(v, "blockers", 0));

		const vineImg = generateVineImg(attack.template, sprites, vec(15 * 17, 15 * 18));

		add(attackSprite(vec(30, 0), vineImg), "attackSprites", 0);

		const obstacleImg = generateTileImg(attack.template, sprites, JSON.grass_tiles, vec(15 * 17, 15 * 18));


		add(attackSprite(vec(30, 0), obstacleImg), "attackSprites", 0);

	}

	that.cleanUpAttack = ({ clear, setRemoveIf, box }) => {

		setRemoveIf((x) => x.partOfAttack, "obstacles", "blockers", "door_buttons");

		clear("reds", "attackSprites");

		box.pos = vec(-100, -100)
	}

	that.stage = 0;

	let setupWait = 1.5 * 60;

	that.handleSwitchStage = (GAME) => {
		if(that.lives === 0){
			if(that.stage === 0 && that.pos.y > GAME.height + 200){

				GAME.world.clear("door_buttons");

				GAME.world.add(traits.textEntity({
					pos: vec(that.center.x, 100),
					size: 20,
					text: ["1 UP"],
				}), "texts", 20);

				setupWait--;

				that.waitCounter = 60 * 2;

				if(setupWait === 0)
					that.setupSwitchToStageTwo(GAME);

			}
			if(that.stage === 1){

				if(!setupSwitchToStageThreeDone && that.pos.y > GAME.height + 200)
					that.setupSwitchToStageThree(GAME);

				if(GAME.world.attackSprites[3]){
					GAME.world.attackSprites[3].pos.y -= 1;
					GAME.world.attackSprites[3].fixCenter();
					console.log(GAME.world.attackSprites[3]);
				}
			}
		}
	}

	let setupSwitchToStageTwoDone = false;
	that.setupSwitchToStageTwo = ({ world: { add, clear } }) => {
		that.size.x -= 30;
		that.size.y -= 30;
		that.pos.x += 15;
		that.pos.y = 30;

		that.stage++;

		that.lives = 8;

		that.currentAttack = 0;

		that.waitCounter = 60 * 2;

		that.attackDelay = 60;

		that.attacks = secondStageAttacks;

		clear("texts");

		for(let y = 0; y < that.lives; y++){
			for(let x = 0; x < 10; x++){
				add(bossDoor(vec(that.pos.x + x * 15 - 15, that.pos.y + that.size.y + y * 15), y), "obstacles", 2);
				
			}
		}

		setupSwitchToStageTwoDone = true;
	}
	
	let setupSwitchToStageThreeDone = false;
	that.setupSwitchToStageThree = ({ world, world: { add, points, attackSprites }, sprites, JSON, height }) => {
		that.cleanUpAttack(world);
		that.attack(setupStageThreeAttack, { add, sprites, JSON });

		that.attack(lastAttack, { add, sprites, JSON });

		//console.log(attackSprites[2])

		that.gravity = 0;
		that.acceleration.y = 0;
		that.velocity.y = -10;

		points[0].initPos = vec(195, 60);
		points[0].pos = v.add(points[0].initPos, vec(0, 1));

		setupSwitchToStageThreeDone = true;
	}

	that.isBoss = true;

	that.addMethods("setupStage", "checkStartTrigger", "handleAttacking", "checkDoorBtns", "handleSwitchStage");
			//that.removeMethods("checkStartTrigger");

	return that;
}

const obstacle = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	return that;
}

const attackSprite = (pos, img) => {
	const that = obstacle(pos);

	that.img = img;

	that.size.x = 15 * 17;
	that.size.y = 15 * 18;

	that.draw = (ctx) => {
		ctx.drawImage(that.img, 0, 0, that.size.x, that.size.y, that.pos.x, that.pos.y, that.size.x, that.size.y)
	}

	return that;
}

//x: 17 y: 18
const firstStageAttacks = [
	//1
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,-,,,",
			",,,,,,,,..,,,//,,",//
			",,,,,,,,..,,,//,,",//
			",,,,,,,,,,,,,,,,,",
			",,,,..,,,,,,,,,,,",
			",,,,..,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,//,,,,,,,",
			",,,,,,,,//,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 4 * 60,
	},
	//2
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,7,,,,,",
			",,,,,,,,,,,.,,,,,",
			",,,,,,,,7,,.,,,,,",
			",,,,,,,,.,,,,,,,,",
			",,,,,,,,.,,,,//,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,-,,,,,,,,,,,,,,",
			",//,,,,,,,,,,,,,,",
			",//,..,,,,,,,,,,,",
			",,,,..,,,,,,,,,,,",
		],
		duration: 3 * 60,
	},
	//3
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",6,,,,,,,,,,,,-,,",
			",,,,,,,......//,,",
			",//....//..,,//,,",
			",//,,,,//,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,//,",
			",//,,,//,,,.,,//,",
			",//,,,//,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 6 * 60,
	},
	//4
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,-,,,,,,,,,,,,,,",
			",//,,,,,......,,,",
			",//,,,,,,,,,,.,,,",
			",,,,,,,,,,,,,.,,,",
			",,,,,,7,,,,7,.,,,",
			",,,,,,,,,,,,,.,,,",
			",,............,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,//,",
			",,.,,,,..,,,,,//,",
			",,,,,,,..,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 11 * 60,
	}
];
/*
firstStageAttacks.splice(0, firstStageAttacks.length);
for(let i = 0; i < 4; i++){
	firstStageAttacks.push({
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,-,,,,,,,,,",
			",,,,,,///////,,,,",
			",,,,,,///////,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 10 * 60,
	})
}
*/

const secondStageAttacks = [
	//1
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",//,,,,,,,,,,,,,,",
			",//,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,-,,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 3 * 60,
	},
	//2
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,-,,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,..,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 4 * 60,
	},
	//3
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,7,,,,,,,",
			",,,,,7,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,..,,,,,,,,,,",
			",,,,,..,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,-,,,,,,,,,,,,,",
			",,//,,,,,,,,,,,,,",
			",,//,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 4 * 60,
	},
	//4
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,77777777,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,..........,,,",
			",,,,,,,,,,,,,,,-,",
			",,//,,,,,,,,,,//,",
			",,//,,,,,,,,,,//,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		
		],
		duration: 3.5 * 60,
	},
	//5
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,-,,,",
			",,,,,,,,,,,,,//,,",
			",,,,,,,,,..,,//,,",
			",,,,,,,,,..,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,..,,,,,,,,,,,",
			",,,,..,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,..,,,,,,,",
			",,,,,,,,..,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,//,",
			",,,,,,,,,,,,,,//,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 4.5 * 60,
	},
	//6
	{
		template: [
			",,,,,,,,,,,,...,,",
			",,,,,,,,,,,,...,,",
			",,,,,,,,,,,,...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,-,,//...,,",
			",,,,,,,//,//...,,",
			",,,,,,,//,//...,,",
			",,,,,,,,,,//...,,",
			",,,,,,,,,,//...,,",
		],
		duration: 8 * 60,
	},
	//7
	{
		template: [
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,-,,,,,,,,,,,,,,",
			".//,,,,,,,,,,,,,,",
			".//,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,,,,,,,,,,,",
			".,,,,,,//,,,,,,,,",
			",,,,,,,//,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 4 * 60,
	},
	//8
	{
		template: [
			",,,,,,7,,,,,,,,,,,",
			",,,,,,.,,,,,,,,,,,",
			",,,,,,.,,,,,,,,,,,",
			",,,,,,,,,,,.,,,,,,",
			",,,,,,,,,,,7,,,,,,",
			",,,,,,,,,,,.,,,,,,",
			",//,,,,,,,,.,,,,,,",
			",//,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,-,,",
			",,,,,,,,,,,,,,,//,",
			",,,,,,,,,,,,,,,//,",
			",,,,,,,,,,,,,.,,,,",
			",,,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,//,,,,",
			",,,,,,,,,,,,//,,,,",
		],
		duration: 4 * 60,
	},
];

const setupStageThreeAttack = {
	template: [
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,.,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,.,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,//,",
		",,,,,,,,,,,,,,//,",
		",,,,,,,.,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
	],
};

const setupAttack = {
	template: [
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		"........//.......",
		"........//.......",
		".................",
		".................",
		".................",
	]
};

const lastAttack = {
	template: [
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		".................",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
		"/////////////////",
	]
}

const failAttack = {
	template: [
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
		",,,,,,,,,,,,,,,,,",
	],
};

const lastAttackEnemy = () => {
	const that = traitHolder();

	that.img = document.createElement("canvas");

	k

	that.draw = () => {
	
	}

	return that;
}

const attackCountdownSprite = (pos) => {
	const that = traitHolder();

	that.pos = pos;

	that.draw = (ctx, sprites, { world: { boss } }) => {

		if(boss.attackCounter > 0){
			ctx.fillStyle = "white";
			ctx.font = "20px game";
			ctx.fillText(Math.floor(boss.attackCounter / 60) + 1, that.pos.x, that.pos.y);
		}

	}

	return that;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default boss;
