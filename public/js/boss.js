import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";
import * as particles			from "/js/particles.js";
import { bossDoor, doorButton }	from "/js/door.js";
import { thorn, thornImg  }		from "/js/thorn.js";
import generateVineImg			from "/js/generateVineImg.js";
import generateTileImg			from "/js/generateTileImg.js";
import * as reds				from "/js/reds.js";

const boss = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
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

		for(let y = 0; y < 4; y++){
			for(let x = 0; x < 10; x++){
				add(bossDoor(vec(that.pos.x + x * 15, that.pos.y + that.size.y + y * 15), y), "obstacles", 2);
			}
		}

		add(attackCountdownSprite(vec(that.pos.x - 20, that.pos.y - 10)), "attackCountdown", 10, true);

		that.attack(setupAttack, { add, sprites, JSON })

		that.removeMethods("setupStage");
	}

	that.checkStartTrigger = ({ world: { player } }) => {
		if(player.pos.x > 10 * 15 && player.pos.x < 12 * 15 && player.pos.y === 12 * 15 && player.onGround){
			that.start();
			that.removeMethods("checkStartTrigger");
		}
	}

	that.start = () => {
		that.waitCounter = 60 * 2;
	}

	that.currentAttack = 0;

	that.attacking = false;

	that.lives = 4;

	that.attackCounter = 0;

	that.waitCounter = 0;

	that.handleAttacking = ({ world, world: { add }, sprites, JSON }) => {
		that.waitCounter--;
		that.attackCounter--;
		
		if(that.waitCounter === 0){

			that.cleanUpAttack(world);

			that.attack(attacks[that.currentAttack], { add, sprites, JSON });

			that.attackCounter = attacks[that.currentAttack].duration;

			that.currentAttack++;
		}

		if(that.attackCounter === 0){
			that.cleanUpAttack(world);

			that.attack(failAttack, { add, sprites, JSON });
		}

	}

	that.checkDoorBtns = ({ world: { door_buttons } }) => {
		if(door_buttons) door_buttons.forEach(btn => {
			if(btn.partOfAttack && btn.hit && that.waitCounter < -180){
				that.attackCounter = -1;

				that.lives--;

				that.waitCounter = 60 * 2;
			}
		});
	}

	that.attack = (attack, { add, sprites, JSON }) => {
		attack.template.forEach((row, y) => strEach(row, (tile, x) => {
			let pos = vec(x * 15 + 30, y * 15);

			if(tile === ","){
				const o = obstacle(pos.copy());
				o.partOfAttack = true;
				add(o, "blockers", 0);
			}
			if(tile === "/"){
				const o = obstacle(pos.copy());
				o.partOfAttack = true;
				add(o, "obstacles", 0);
			}
			if(tile === "-"){
				const o = doorButton(pos.copy(), 4 - that.lives);
				o.partOfAttack = true;
				add(o, "door_buttons", 1);
			}

			
		}));

		const vineImg = generateVineImg(attack.template, sprites, vec(15 * 17, 15 * 18));

		add(attackSprite(vec(30, 0), vineImg), "attackSprites", 0);

		const obstacleImg = generateTileImg(attack.template, sprites, JSON.grass_tiles, vec(15 * 17, 15 * 18));


		add(attackSprite(vec(30, 0), obstacleImg), "attackSprites", 0);

	
	}

	that.cleanUpAttack = ({ clear, setRemoveIf, box }) => {

		setRemoveIf((x) => x.partOfAttack, "obstacles", "blockers", "door_buttons");

		clear("attackSprites");

		box.pos = vec(-100, -100)
	}

	that.isBoss = true;

	that.addMethods("setupStage", "checkStartTrigger", "handleAttacking", "checkDoorBtns");

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

	that.size.x = 15 * 17;
	that.size.y = 15 * 18;

	that.draw = (ctx) => {
		ctx.drawImage(img, 0, 0, that.size.x, that.size.y, that.pos.x, that.pos.y, that.size.x, that.size.y)
	}

	return that;
}

//x: 17 y: 18
const attacks = [
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,............,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,-,,,",
			",,.,,,,,,,,,,//,,",
			",,.,,,,,,,,,,//,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,//,,,,,,,",
			",,.,,,,,//,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 7 * 60,
	},
	{
		template: [
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,.,,",
			",,,,,,,,,,,,,,.,,",
			",,,,,,,,,,,,,,.,,",
			",,,,,,,,,,,,,,.,,",
			",,,,,,,,,,,,,,.,,",
			",,,,,,,,,,,,,,.,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,/////,,,,,,,,,",
			",,,/////,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
		duration: 7 * 60,
	},
];

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
