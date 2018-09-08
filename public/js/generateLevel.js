import vec, * as v 				from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import box						from "/js/box.js";
import player					from "/js/player.js";

const generateLevel = (template, { add }) => {
	let pos;
	const scl = 15;

	template.forEach((row, y) => {
		strEach(row, (tile, x) => {
			pos = vec(scl * x, scl * y);

			if(tile === "#") add(obstacle(pos.copy()), "obstacles", 1);
			if(tile === "B") add(box(pos.copy()), "box", 4, true);

		});
	});
}

const obstacle = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		color: "grey",
	});//(that);

	return that;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateLevel;
