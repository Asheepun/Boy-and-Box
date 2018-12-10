import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const flower = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(5, 8),
	})(that);

	traits.addSpriteTrait({
		img: "red_flower",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addColTrait({})(that);

	that.handleColY = (obstacle) => {
		that.pos.y = obstacle.pos.y - that.size.y;
	}

	return that;
}

const addFlowers = (template, world) => {
	template.forEach((row, y) => strEach(row, (tile, x) => {
		if(tile === "T"
		|| tile === "1"
		|| tile === "2"
		|| tile === "3"
		|| tile === "4"
		|| tile === "5"){
			const f = flower(vec(x * 15 + Math.random() * (tile === "T" ? 10 : 25), y * 15))
			
			f.velocity.y = 15;
			for(let i = 0; i < 30; i++){
				f.move({world});
			}

			f.pos.y += 1 + Math.random() * 2;

			f.removeMethods("move");

			world.add(f, "flowers", 2);
		}
	}));
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default addFlowers;
