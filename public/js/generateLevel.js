import vec, * as v 				from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import box						from "/js/box.js";
import player					from "/js/player.js";
import point					from "/js/points.js";

const generateLevel = (template, { add }) => {
	let pos;
	const scl = 15;

	template.forEach((row, y) => {
		strEach(row, (tile, x) => {
			pos = vec(scl * x, scl * y);

			if(tile === "@") add(player(pos.copy()), "player", 4, true);
			if(tile === "#") add(obstacle(pos.copy()), "obstacles", 1);
			if(tile === "B") add(box(pos.copy()), "box", 1, true);
			if(tile === "P") add(point(pos.copy()), "points", 3);
			if(tile === "0") add(vec(pos.x + 15, pos.y), "pointTarget", 0, true);
			if(tile === "0" || tile === "O") add(shine(pos.copy()), "shine", 10);

		});
	});

}

const obstacle = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		color: "grey",
	})(that);

	return that;
}

const shadow = (pos) => {
	const that = obstacle(pos);

	that.color = "black";

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
