import vec, * as v from "/js/lib/vector.js";

const generateTileImg = (map, sprite, json) => {
	let pos;
	let side;

	let up;
	let down;
	let left;
	let right;

	const imgCanvas = document.createElement("canvas");
	const ctx = imgCanvas.getContext("2d");
	
	imgCanvas.width = 15 * 32;
	imgCanvas.height = 15 * 18;

	map.forEach((row, y) => strEach(row, (tile, x) => {
		pos = vec(x * 15, y * 15);

		if(tile === "#"){
			up = down = left = right = false;

			if(y > 0 && map[y-1][x] !== "#") 			   up = true;
			if(y < map.length-1 && map[y+1][x] !== "#")    down = true;
			if(x > 0 && map[y][x-1] !== "#") 			   left = true;
			if(x < map[y].length-1 && map[y][x+1] !== "#") right = true;

			side = "";

			if(up) side += "up"
			if(down) side += "down"
			if(left) side += "left"
			if(right) side += "right"
			
			if(!up && !down && !left && !right || (up && down && left && right)) side = "middle";

			//inside tiles
			if(y > 0 && x > 0 && map[y-1][x-1] !== "#" && map[y-1][x] === "#" && map[y][x-1] === "#")
				side = "insideupleft";
			if(y > 0 && x < map[y].length-1 && map[y-1][x+1] !== "#" && map[y-1][x] === "#" && map[y][x+1] === "#")
				side = "insideupright";
			if(y < map.length-1 && x > 0 && map[y+1][x-1] !== "#" && map[y+1][x] === "#" && map[y][x-1] === "#")
				side = "insidedownleft";
			if(y < map.length-1 && x < map[y].length-1 && map[y+1][x+1] !== "#" && map[y+1][x] === "#" && map[y][x+1] === "#")
				side = "insidedownright";

			ctx.drawImage(sprite, json[side][0][0], json[side][0][1], 15, 15, pos.x, pos.y, 15, 15);

		}

	}));

	return imgCanvas;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateTileImg;
