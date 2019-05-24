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
import * as cpö					from "/js/lib/colission.js";

const boss = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos: v.add(pos, vec(0, 0)),
		size: vec(120, 120),
	})(that);

	traits.addSpriteTrait({
		img: "boss",
	})(that);

	traits.addMoveTrait({
		velocity: vec(0, 0),
	})(that);

	traits.addColTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.007,
	})(that);

	traits.addFrameTrait({
		delay: 6,
		frames: "boss_frames",
	})(that);

	that.setupStage = ({ world, world: { add }, sprites, JSON }) => {

		for(let y = 0; y < that.lives; y++){
			for(let x = 0; x < 10; x++){
				add(bossDoor(vec(that.pos.x + x * 15 - 15, that.pos.y + that.size.y + y * 15), y), "obstacles", 2);
			}
		}

		add(attackCountdownSprite(vec(that.pos.x - 35, that.pos.y - 10)), "attackCountdown", 10, true);

		that.attack(setupAttack, { world, sprites, JSON })

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

	that.handleAttacking = ({ world, world: { add, screenShaker }, sprites, JSON, context }) => {
		that.waitCounter--;
		that.attackCounter--;

		if(that.waitCounter === /*(that.stage === 0 ? 20 : 10)*/ 15 && that.lives > 0){
			that.runAnimation("attack", JSON);
			//context.y = Math.pow(0.9, 1 / 15) * 15;
		}

		if(that.waitCounter === 15 && that.lives > 0){
			screenShaker.shake(vec(0, -20), 0.3, 15, () => {
				screenShaker.shake(vec(0, 10), 0.7, 2);
			});
		}
		
		if(that.waitCounter === 0 && that.lives > 0){

			that.cleanUpAttack(world);

			that.attack(that.attacks[that.currentAttack], { world, sprites, JSON });

			that.attackCounter = that.attacks[that.currentAttack].duration;

			that.currentAttack++;
		}

		if(that.attackCounter === 0 && that.lives > 0){
			that.cleanUpAttack(world);

			that.attack(failAttack, { world, sprites, JSON });
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

	that.attack = (attack, { world, world: { add, player }, sprites, JSON }) => {

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

		add(attackSprite(vec(30, 0), vineImg, true, (that.currentAttack === 0 && that.stage === 0) ? true : false, false), "attackSprites", 0);

		const obstacleImg = generateTileImg(attack.template, sprites, JSON.grass_tiles, vec(15 * 17, 15 * 18));

		add(attackSprite(vec(30, 0), obstacleImg, false, false, true), "attackSprites", 0);

		//staying obstacle
		const sO = obstacles.find(o => v.sub(o.pos, player.pos).mag < 30);

		if(sO){
			const sOImg = generateTileImg(attack.template, sprites, JSON.grass_tiles, vec(15 * 17, 15 * 18));

			const sOCtx = sOImg.getContext("2d");
			sOCtx.clearRect(0, 0, sO.pos.x - 30, 15 * 18);
			sOCtx.clearRect(0, 0, 15 * 17, sO.pos.y);
			sOCtx.clearRect(0, sO.pos.y + sO.size.y, 15 * 17, 15 * 18);
			sOCtx.clearRect(sO.pos.x + sO.size.x, 0, 15 * 17, 15 * 18);
			
			world.clear("stayingAttackObstacleSprite");
			add(attackSprite(vec(30, 0), sOImg, false, false, false), "stayingAttackObstacleSprite", 1, true);
		}

	}

	that.cleanUpAttack = ({ reds, obstacles, clear, setRemoveIf, box, player, add, attackSprites }) => {

		if(reds) reds.forEach(red => {
			for(let i = 0; i < 3 + Math.random()*2; i++){
				add(particles.dust(v.add(red.center, vec(-2.5, -2.5)), vec(Math.random()-0.5, Math.random()-0.5), false), "particles", 8);
			}
		});
		let pos;
		let velocity;
		if(obstacles) obstacles.forEach(obstacle => {
			if(obstacle.partOfAttack && v.sub(obstacle.pos, player.pos).mag > 35){
				for(let x = 0; x < obstacle.size.x / 15; x++){
					for(let y = 0; y < obstacle.size.y / 15; y++){
						pos = v.add(obstacle.pos.copy(), vec(Math.random() * (obstacle.size.x - 10), Math.random() * (obstacle.size.y - 10)));
						velocity = vec(Math.random(), Math.random());
						if(pos.x + 4 < obstacle.center.x) velocity.x *= -1;
						if(pos.y + 4 < obstacle.center.y) velocity.y *= -1;
						add(particles.debri(pos, velocity), "particles", 7);
					}
				}
			}
		});

		setRemoveIf((x) => x.partOfAttack, "obstacles", "blockers", "door_buttons");

		attackSprites.forEach(x => x.remove())

		clear("reds", /*"attackSprites"*/);

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

			}
		}
	}

	let setupSwitchToStageTwoDone = false;
	that.setupSwitchToStageTwo = ({ world: { add, clear } }) => {
		//that.size.x -= 30;
		//that.size.y -= 30;
		//that.pos.x += 15;
		that.pos.y = 30;

		that.stage++;

		that.lives = 8;

		that.currentAttack = 0;

		that.waitCounter = 60 * 2;

		that.attackDelay = 1 * 60;

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
		that.attack(setupStageThreeAttack, { world, sprites, JSON });

		add(lastAttackEnemy(vec(30, height + 30 * 1.5)), "enemies", 7);


		that.gravity = 0;
		that.acceleration.y = 0;
		that.velocity.y = -10;

		points[0].initPos = vec(195, 60);
		points[0].pos = v.add(points[0].initPos, vec(0, 1));

		setupSwitchToStageThreeDone = true;
	}

	that.isBoss = true;

	that.checkPlayer = ({ world: { player } }) => {
		if(col.checkHitBoxCol(that, player)){
			player.hit = true;
		}
	}

	that.addMethods("setupStage", "checkStartTrigger", "handleAttacking", "checkDoorBtns", "handleSwitchStage", "checkPlayer");
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

const attackSprite = (pos, img, willFadeOut = true, willFallIn = false, willFadeIn = false) => {
	const that = obstacle(pos);

	that.img = img;

	that.size.x = 15 * 17;
	that.size.y = 15 * 18;

	const startImgs = [];
	const startImgCtxs = [];
	for(let i = 0; i < 6; i++){
		startImgs[i] = document.createElement("canvas");
		startImgs[i].width = that.size.x;
		startImgs[i].height = that.size.y;
		startImgCtxs[i] = startImgs[i].getContext("2d");
		startImgCtxs[i].drawImage(that.img, 0, 0);
	}

	for(let x = 0; x < that.size.x / 15; x++){
		for(let y = 0; y < that.size.y / 15; y++){
			startImgCtxs[0].clearRect(x * 15 - 5, 0, 10, that.size.y);
			startImgCtxs[0].clearRect(0, y * 15 - 5, that.size.x, 10);

			startImgCtxs[1].clearRect(x * 15 - 2, 0, 4, that.size.y);
			startImgCtxs[1].clearRect(0, y * 15 - 2, that.size.x, 4);

			startImgCtxs[2].clearRect(x * 15 + 7, 0, 8, that.size.y);
			startImgCtxs[2].clearRect(0, y * 15 + 7, that.size.x, 8);

			startImgCtxs[3].clearRect(x * 15 + 7, 0, 8, that.size.y);
			startImgCtxs[3].clearRect(0, y * 15, that.size.x, 7);

			startImgCtxs[4].clearRect(x * 15, 0, 7, that.size.y);
			startImgCtxs[4].clearRect(0, y * 15 + 7, that.size.x, 8);
		}
	}

	that.fadeOut = false;

	that.alpha = 1;

	that.drawSize = that.size.copy();
	that.imgPos = vec(0, 0);
	that.imgSize = that.size.copy();

	that.remove = () => {
		that.fadeOut = true;
	};

	let fadeAmount = 10;

	let fadeCounter = 12;
	that.fade = ({ world: { remove } }) => {
		if(that.fadeOut){
			that.currentImg = startImgs[1];
			if(fadeCounter <= 8) that.currentImg = startImgs[0];
			fadeCounter--;
			if(fadeCounter === 0 || !willFadeOut) remove(that);
		}
		if(willFallIn && that.imgSize.y < that.size.y){
			that.drawSize.y += 15;
			that.imgSize.y += 15;
		}
	}
	if(willFallIn || willFadeIn){
		that.drawSize.y = 0;
		that.imgSize.y = 0;
	}

	let frameCount = 0;
	that.currentImg = that.img;
	that.draw = (ctx) => {

		frameCount++;
		ctx.globalAlpha = that.alpha;
		ctx.drawImage(that.currentImg,
			that.imgPos.x, that.imgPos.y, that.imgSize.x, that.imgSize.y,
			that.pos.x, that.pos.y, that.drawSize.x, that.drawSize.y
		);
		if(willFadeIn){
			ctx.drawImage(startImgs[3],
				0, 0, that.size.x, that.size.y,
				that.pos.x, that.pos.y, that.size.x, that.size.y,
			);
			if(frameCount >= 4) ctx.drawImage(startImgs[4],
				0, 0, that.size.x, that.size.y,
				that.pos.x, that.pos.y, that.size.x, that.size.y,
			);
			if(frameCount >= 8) ctx.drawImage(startImgs[5],
				0, 0, that.size.x, that.size.y,
				that.pos.x, that.pos.y, that.size.x, that.size.y,
			);
			if(frameCount >= 12){
				that.imgSize.x = that.drawSize.x = that.size.x;
				that.imgSize.y = that.drawSize.y = that.size.y;
			}
		}
		ctx.globalAlpha = 1;
	}

	that.addMethods("fade")

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
			",,.,,,,..,,,,,,,,",
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
		duration: 5 * 60,
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
		duration: 5 * 60,
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
		",,,.,,,,,,,,,,,,,",
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

const lastAttackEnemy = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(17 * 15, 100 * 15),
	})(that);

	traits.addSpriteTrait({
		color: "red",
	})(that);

	traits.addMoveTrait({
		velocity: vec(0, -0.5),
	})(that);

	that.checkOver = ({ world: { points } }) => {
		if(points[0].hit){
			that.velocity.y = 2.5;
		}
	}

	that.checkPlayer = ({ world: { player } }) => {
		if(col.checkHitBoxCol(that, player)){
			player.hit = true;
		}
	}

	that.addMethods("checkOver", "checkPlayer");

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
