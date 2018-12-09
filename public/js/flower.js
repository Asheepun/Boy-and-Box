import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const flower = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(5, 16),
	})(that);

	traits.addSpriteTrait({
		size: "red_flower",
		imgSize: size.copy(),
	})(that);

	return that;
}

const addFlowers = (template, world) => {
	template.forEach((row, y) => strEach(row, (tile, x) => {
		if(tile === "1"
		|| tile === "2"
		|| tile === "3"
		|| tile === "4"
		|| tile === "5")
			world.add(flower(vec(x * 15, y * 15)));
	}));
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default addFlowers;
