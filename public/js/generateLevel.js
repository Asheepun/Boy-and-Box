import vec, * as v 				from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import box						from "/js/box.js";
import player					from "/js/player.js";
import point					from "/js/points.js";
import * as blues				from "/js/blue.js";
import generateTileImg 			from "/js/generateTileImg.js";

const generateLevel = (template, { world, world: { add }, sprites, JSON }) => {
	let pos;
	const scl = 15;

	add(tiles(generateTileImg(template, sprites["tiles/grass_tiles"], JSON["grass_tiles"])), "tiles", 8, true);

	template.forEach((row, y) => {
		strEach(row, (tile, x) => {
			pos = vec(scl * x, scl * y);

			if(tile === "@") add(player(pos.copy()), "player", 4, true);
			if(tile === "#") add(obstacle(pos.copy()), "obstacles", 1);
			if(tile === "B") add(box(pos.copy()), "box", 1, true);
			if(tile === "P") add(point(pos.copy()), "points", 3);
			if(tile === "0") add(vec(pos.x + 15, pos.y), "pointTarget", 0, true);
			if(tile === "0" || tile === "O") add(shine(pos.copy()), "shine", 10);

			if(tile === "b") add(blues.bouncer(pos.copy()), "blues", 3)

		});
	});

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
