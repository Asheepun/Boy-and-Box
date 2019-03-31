import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as colission			from "/js/lib/colission.js";

export const thorn = (pos, template) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	let x = that.pos.x / 15;
	let y = that.pos.y / 15;

	if(template[y][x-1] === "/"){
		that.hitBox = vec(7, 13);
		that.hitBoxOffset = vec(0, 1);
	}
	if(template[y][x+1] === "/"){
		that.hitBox = vec(7, 13);
		that.hitBoxOffset = vec(8, 1);
	}
	if(y !== 0 &&template[y-1][x] === "/"){
		that.hitBox = vec(13, 7);
		that.hitBoxOffset = vec(1, 0);
	}
	if(y !== template.length-1 && template[y+1][x] === "/"){
		that.hitBox = vec(17, 6);
		that.hitBoxOffset = vec(-1, 9);
	}

	that.checkPlayer = ({ world: { player } }) => {
		if(colission.checkHitBoxCol(that, player)){
			player.hit = true;
		}
	}

	that.addMethods("checkPlayer");

	return that;
}

export const thornImg = (template) => {
	const that = traitHolder();

	that.img;

	that.img1 = document.createElement("canvas");
	that.ctx1 = that.img1.getContext("2d");
	that.img1.width = 32 * 15;
	that.img1.height = 18 * 15;

	that.img2 = document.createElement("canvas");
	that.ctx2 = that.img2.getContext("2d");
	that.img2.width = 32 * 15;
	that.img2.height = 18 * 15;
	
	that.initImg = ({ sprites }) => {

		let imgPos = vec(0, 16)
		let img;
		template.forEach((row, y) => strEach(row, (tile, x) => {

			if((y * 32 + x - (y % 2 === 0 ? 1 : 0)) % 2 === 0) img = "thorn_tiles_2";
			else img = "thorn_tiles";

			if(tile === "x"
			|| (tile === "-"
			|| tile === "_"
			|| tile === "|"
			|| tile === "I"
			|| tile === "6"
			|| tile === "7")
			&& (template[y][x-1] === "x"
			|| template[y][x+1] === "x")){
				//that.ctx.fillStyle = "red";
				//that.ctx.fillRect(x * 15, y * 15, 15, 15);
				if(template[y][x-1] === "/"){
					imgPos = vec(32, 16);
				}
				if(template[y][x+1] === "/"){
					imgPos = vec(0, 16);
				}
				if(y !== 0 &&template[y-1][x] === "/"){
					imgPos = vec(16, 32);
				}
				if(y !== template.length-1 && template[y+1][x] === "/"){
					imgPos = vec(16, 0);
				}
				that.ctx1.drawImage(sprites["tiles/" + img], imgPos.x, imgPos.y, 15, 15, x * 15, y * 15, 15, 15);
				if(img === "thorn_tiles") img = "thorn_tiles_2";
				else img = "thorn_tiles";
				that.ctx2.drawImage(sprites["tiles/" + img], imgPos.x, imgPos.y, 15, 15, x * 15, y * 15, 15, 15);
			}
		}));

		that.removeMethods("initImg");
	}

	let counter = 0;
	that.animate = () => {
		counter++;
		if(counter % 30 === 0){
			if(that.img === that.img2) that.img = that.img1;
			else that.img = that.img2;
		}
	}

	that.img = that.img1;

	that.draw = (ctx) => {
		ctx.drawImage(that.img, 0, 0);
	}

	that.addMethods("initImg", "animate");

	return that;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}
