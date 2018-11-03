import vec, * as v from "/js/lib/vector.js";

const generateShadowImg = (template, sprites) => {
	const img = document.createElement("canvas");
	const ctx = img.getContext("2d");
	img.width = 32 * 15;
	img.height = 18 * 15;

	const lightSources = [];

	//find lightsoruces
	template.forEach((row, y) => strEach(row, (tile, x) => {
		if(tile === "L") lightSources.push(vec(x * 15 + 7.5, y * 15 + 7.5));
	}));

	console.log(lightSources)

	let pos;
	let center;
	let tempCenter;
	let dir;
	let dist;
	let hitObstacles;
	let leastHitObstacles;

	//set shadows
	template.forEach((row, y) => strEach(row, (tile, x) => {
		pos = vec(x * 15, y * 15);
		center = v.add(pos, vec(7.5, 7.5));

		ctx.globalAlpha = 0.5;

		leastHitObstacles = 0;
		lightSources.forEach((lightSource, n) => {
			hitObstacles = 0;
			tempCenter = center.copy();
			dir = v.pipe(
				v.sub(lightSource, tempCenter),
				v.normalize,
				x => v.mul(x, 7),
			);

			dist = Math.floor(v.sub(lightSource, tempCenter).mag / 7);

			hitObstacles = 0;
			for(let i = 0; i < dist; i++){
				tempCenter = v.add(tempCenter, dir);

				let newTile = template[Math.floor(tempCenter.y / 15)][Math.floor(tempCenter.x / 15)];
				if(newTile === "#" || newTile === "¤"){
					hitObstacles++;
					if(n === 0) leastHitObstacles = hitObstacles;
					if(hitObstacles > 5) break;
				}
			}

			if(hitObstacles < leastHitObstacles)
				leastHitObstacles = hitObstacles

		});

		ctx.globalAlpha =  leastHitObstacles * 0.05;
		
		if(tile === "L") ctx.globalAlpha = 0;

		ctx.drawImage(sprites["tiles/shadow"], pos.x, pos.y, 15, 15);
		ctx.globalAlpha = 1;
	}));

	return img;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateShadowImg;
