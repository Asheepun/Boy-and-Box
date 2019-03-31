import vec, * as v from "/js/lib/vector.js";

const generateVineImg = (map, sprites, size = vec(15 * 32, 15 * 18)) => {

	const imgCanvas = document.createElement("canvas");
	imgCanvas.width = size.x;
	imgCanvas.height = size.y;
	const ctx = imgCanvas.getContext("2d");

	map.forEach((row, y) => strEach(row, (tile, x) => {
		if(tile === ","
		||(tile !== "."
		&& tile !== "#"
		&& tile !== "¤"
		&& tile !== "%"
		&& tile !== "&")
		&& (y !== map.length - 1 && map[y+1][x] === ","
		|| y !== 0 && map[y-1][x] === ",")){
			ctx.drawImage(sprites.box_blocker_flower, x * 15, y * 15, 15, 15);
		}
	}));

	return imgCanvas;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateVineImg;
