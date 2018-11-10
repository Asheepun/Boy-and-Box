import vec, * as v 				from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import box						from "/js/box.js";
import player					from "/js/player.js";
import point					from "/js/points.js";
import * as blues				from "/js/blue.js";
import lamp						from "/js/lamp.js";
import generateTileImg 			from "/js/generateTileImg.js";
import generateShadowImg 		from "/js/generateShadowImg.js";
import addClouds				from "/js/clouds.js";
import addBirds 				from "/js/bird.js";

const generateLevel = ({ template, time, background, texts }, { world, world: { add }, sprites, JSON, width, height }) => {
	let pos;
	const scl = 15;

	let textCounter = 0;

	add(tiles(generateTileImg(template, sprites, JSON["grass_tiles"])), "tiles", 8, true);

	add(tiles(sprites["backgrounds/" + background]), "background", 0, true);

	if(background === "sky") addClouds({ world, width });
	
	addBirds({ world, width, height });

	template.forEach((row, y) => strEach(row, (tile, x) => {
			pos = vec(scl * x, scl * y);

			if(tile === "@") add(player(pos.copy()), "player", 4, true);
			if(tile === "#" || tile === "¤") add(obstacle(pos.copy()), "obstacles", 1);
			if(tile === "B") add(box(pos.copy()), "box", 1, true);
			if(tile === "P") add(point(pos.copy()), "points", 3);
			if(tile === "0") add(vec(pos.x + 15, pos.y), "pointTarget", 0, true);
			if(tile === "0" || tile === "O") add(shine(pos.copy()), "shine", 10);

			if(tile === "b"){
				add(blues.bouncer(pos.copy(), texts[textCounter]), "blues", 3)
				textCounter++;
			}
			if(tile === "t"){
				add(blues.blue(pos.copy(), texts[textCounter]), "blues", 3);
				textCounter++;
			}
			if(tile === "d") add(blues.blueDoc(pos.copy()), "blues", 3)

			if(tile === "£") add(lamp(pos), "lamps", 6);

			if(tile === "µ") add(bookShelf(pos), "furniture", 1);

	}));

	for(let i = 0; i < world.obstacles.length; i++){
		const o1 = world.obstacles[i];

		for(let j = 0; j < world.obstacles.length; j++){
			const o2 = world.obstacles[j];

			if(o1.pos.x + o1.size.x === o2.pos.x && o1.pos.y === o2.pos.y){
				o1.size.x += o2.size.x;
				world.obstacles.splice(j, 1);
				j--;
			}
		}
	}

}

const obstacle = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	return that;
}

const tiles = (img) => {
	const that = traitHolder();

	that.img = img;

	that.draw = (ctx) => {
		ctx.drawImage(that.img, 0, 0, 15 * 32, 15 * 18);
	}

	return that;
}

const tileObject = (pos, img) => {
	const that = obstacle(pos);

	that.img = img;

	that.draw = (ctx, sprites) => {
		ctx.drawImage(sprites[that.img], that.pos.x, that.pos.y, that.size.x, that.size.y);
	}

	return that;
}

const bookShelf = (pos) => {
	const that = tileObject(pos, "bookshelf");

	that.size = vec(30, 45);

	return that;
}

const shine = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "shine",
		imgSize: that.size.copy(),
		alpha: 0,
	})(that);

	traits.addMoveTrait({
		velocity: vec(0.1, 0),
	})(that);

	that.checkLevelCleared = ({ levelCleared }) => {
		if(levelCleared && that.alpha < 1) that.alpha += 0.2;
	}

	that.initPos = that.pos.copy();
	that.hover = ({ levelCleared }) => {
		if(that.pos.x < that.initPos.x + 0.1 || that.pos.x > that.initPos.x + 6) that.velocity.x *= -1;
		if(!levelCleared) that.pos.x = that.initPos.x;
	}

	that.addMethods("checkLevelCleared", "hover");

	return that;
}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateLevel;
