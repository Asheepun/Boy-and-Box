import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as colission			from "/js/lib/colission.js";

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
	
	if(template[y][x-1] === "/"){
		that.imgPos = vec(32, 16);
		that.hitBox = vec(7, 13);
		that.hitBoxOffset = vec(0, 1);
	}
	if(template[y][x+1] === "/"){
		that.imgPos = vec(0, 16);
		that.hitBox = vec(7, 13);
		that.hitBoxOffset = vec(8, 1);
	}
	if(y !== 0 &&template[y-1][x] === "/"){
		that.imgPos = vec(16, 32);
		that.hitBox = vec(13, 7);
		that.hitBoxOffset = vec(1, 0);
	}
	if(y !== template.length-1 && template[y+1][x] === "/"){
		that.imgPos = vec(16, 0);
		that.hitBox = vec(13, 7);
		that.hitBoxOffset = vec(1, 8);
	}

	that.checkPlayer = ({ world: { player } }) => {
		if(colission.checkHitBoxCol(that, player)){
			player.hit = true;
		}
	}

	let counter = 0;
	that.animate = () => {
		counter++;

		if(counter % 30 === 0){
			if(that.img === "tiles/thorn_tiles") that.img = "tiles/thorn_tiles_2";
			else that.img = "tiles/thorn_tiles";
		}
	}

	that.addMethods("checkPlayer", "animate");

	return that;
}

export default thorn;
