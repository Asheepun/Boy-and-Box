import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";
import * as particles			from "/js/particles.js";
import { bossDoor }				from "/js/door.js";
import { thorn, thornImg  }		from "/js/thorn.js";
import generateVineImg			from "/js/generateVineImg.js";
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

	that.attackCounter = () => {

	}

	let attackTemplateCounter = 0;

	that.handleAttacking = ({ world: { add } }) => {
		if(that.attacking){

			strEach(attacks[that.currentAttack].template[attackTemplateCounter], (tile, x) => {
				let pos = vec(x * 15 + 30, attackTemplateCounter * 15);

				if(tile === ","){
					add(obstacle(pos.copy()), "blockers", 0);
				}
			});

			attackTemplateCounter++;
			if(attackTemplateCounter === 18){
				attackTemplateCounter = 0;
				that.attacking = false;
			}
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

const sliceSprite = (pos, img) => {
	const that = obstacle(pos);

	that.size.x = 15 * 10;

	traits.addSpriteTrait({
		img,
	})(that);

	return that;
}

const attacks = [
	{
		template: [
			".................",
			".................",
			".......,...,.....",
			".......,...,.....",
			".................",
			".....,.......,...",
			".....,.......,...",
			".....,.......,...",
			".....,,,,,,,,,...",
			".................",
			".................",
			".................",
			".................",
			".................",
			".................",
			".................",
			".................",
			".................",
		],
	},
];

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default boss;
