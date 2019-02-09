import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";

const thorn = (pos, template) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "tiles/thorn_tiles",
	})(that);

	let x = that.pos.x / 15;
	let y = that.pos.y / 15;

	if((y * 32 + x - (y % 2 === 0 ? 1 : 0)) % 2 === 0) that.img = "tiles/thorn_tiles_2";
	
	if(template[y][x-1] === "/") that.imgPos = vec(32, 16);
	if(template[y][x+1] === "/") that.imgPos = vec(0, 16);
	if(template[y-1][x] === "/") that.imgPos = vec(16, 32);
	if(template[y+1][x] === "/") that.imgPos = vec(16, 0);

	let counter = 0;
	that.animate = () => {
		counter++;

		if(counter % 30 === 0){
			if(that.img === "tiles/thorn_tiles") that.img = "tiles/thorn_tiles_2";
			else that.img = "tiles/thorn_tiles";
		}
	}

	that.addMethods("animate");

	return that;
}

export default thorn;
