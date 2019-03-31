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

	that.setupStage = ({ world: { add } }) => {

		for(let y = 0; y < 4; y++){
			for(let x = 0; x < 10; x++){
				add(bossDoor(vec(that.pos.x + x * 15, that.pos.y + that.size.y + y * 15), y), "obstacles", 2);
			}
		}

		that.removeMethods("setupStage");
	}

	that.currentAttack = 0;

	that.attacking = true;

	that.lives = 4;

	that.attackCounter = () => {

	}

	that.handleAttacking = ({ world: { add }, sprites, JSON }) => {
		if(that.attacking){

			attacks[that.currentAttack].template.forEach((row, y) => strEach(row, (tile, x) => {
				let pos = vec(x * 15 + 30, y * 15);

				if(tile === ","){
					add(obstacle(pos.copy()), "blockers", 0);
				}
				if(tile === "/"){
					add(obstacle(pos.copy()), "obstacles", 0);
				}
				if(tile === "-"){
					add(doorButton(pos.copy(), 4-that.lives), "door_buttons", 1);
				}

				
			}));

			const vineImg = generateVineImg(attacks[that.currentAttack].template, sprites, vec(15 * 17, 15 * 18));

			add(attackSprite(vec(30, 0), vineImg), "attackSprites", 0);

			const obstacleImg = generateTileImg(attacks[that.currentAttack].template, sprites, JSON.grass_tiles, vec(15 * 17, 15 * 18));


			add(attackSprite(vec(30, 0), obstacleImg), "attackSprites", 0);

			that.attacking = false;
		}
	}

	that.isBoss = true;

	that.addMethods("setupStage", "attackCounter", "handleAttacking");

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
			",,.,,,,,,,,,,,,,,",
			",,.,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
			",,,,,,,,,,,,,,,,,",
		],
	},
];

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default boss;
