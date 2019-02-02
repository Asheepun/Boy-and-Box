import vec, * as v from "/js/lib/vector.js";

const generateVineImg = (map, sprites) => {
	const imgCanvas = document.createElement("canvas");
	imgCanvas.width = 15 * 32;
	imgCanvas.height = 15 * 18;
	const ctx = imgCanvas.getContext("2d");

	map.forEach((row, y) => strEach(row, (tile, x) => {
		if(tile === ","
		||(tile !== "."
		&& tile !== "#"
		&& tile !== "¤"
		&& tile !== "%"
		&& tile !== "&")
		&& (map[y+1][x] === ","
		|| map[y-1][x] === ",")){
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