import vec, * as v from "/js/lib/vector.js";

const generateWallsImg = (map, sprites) => {
	let pos;

	let up;
	let down;
	let left;
	let right;

	let coverable = false;

	let sprite;

	const imgCanvas = document.createElement("canvas");
	const ctx = imgCanvas.getContext("2d");

	imgCanvas.width = 15 * 32;
	imgCanvas.height = 15 * 18;

	map.forEach((row, y) => strEach(row, (tile, x) => {
		pos = vec(x * 15, y * 15);

		up = down = left = right = ".";
		coverable = false;

		if(y > 0) up = map[y-1][x];
		if(y < map.length-1) down = map[y+1][x];
		if(x > 0) left = map[y][x-1];
		if(x < map[y].length-1) right = map[y][x+1];

		if(tile === "1"
		|| tile === "2"
		|| tile === "3"
		|| tile === "P"
		|| tile === "B"
		|| tile === "b"
		|| tile === "0"
		|| tile === "O"
		|| tile === "t"
		|| tile === "T"
		|| tile === "#") coverable = true;

		if(tile === ","
		|| coverable
		&& (up === ","
		|| down === ","
		|| left === ","
		|| right === ",")){
			ctx.drawImage(sprites["tiles/grass_wall_tiles"], pos.x, pos.y, 15, 15);
		}

	}));

	return imgCanvas;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateWallsImg;
