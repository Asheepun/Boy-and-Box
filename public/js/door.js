import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import { blueLock }				from "/js/blue.js";

export const door = (pos, index) => {
	const that = blueLock(pos);

	that.gravity = 0.005;

	//that.img = "door";

	that.doorIndex = index;

	that.checkBackground = ({ world: { background: { imgName } } }) => {
		if(imgName === "planks") that.img = "door";
		if(imgName === "sky") that.img = "door_sky";

		that.removeMethods("checkBackground");
	}

	that.removeMethods("checkBlues");

	that.addMethods("checkBackground");

	return that;
}

export const doorButton = (pos, index) => {
	const that = traitHolder();

	that.buttonIndex = index;

	traits.addEntityTrait({
		pos: v.add(pos, vec(1, 3)),
		size: vec(13, 12),//big enough for red birds speed
	})(that);


	traits.addSpriteTrait({
		img: "door_button",
	})(that);

	traits.addCheckColTrait({
		singles: ["player"],
		sets: ["reds"],
	})(that);

	that.touched = false;
	that.hit = false;
	that.touching = false;

	that.playerCol = (player) => {
		if(player.velocity.y > 3) that.touched = true;
		if(that.touched && player.onGround) that.hit = true;
		that.touching = true;
	}

	that.redsCol = (red) => {
		if(red.velocity.y > 1) that.touched = true;
		if(that.touched && red.onGround) that.hit = true;
		that.touching = true;
	}

	that.handleHit = ({ world: { obstacles } }) => {
		if(that.hit){
			const doors = obstacles.filter(o => o.doorIndex === that.buttonIndex);
			if(doors.length > 0){
				const lowestDoor = doors.sort((x, y) => x - y)[doors.length-1];

				obstacles[obstacles.indexOf(lowestDoor)].hit = true;
			}

		}
	}

	that.animate = () => {
		if(that.hit && that.imgPos.x < 13 * 4 + 3){
			that.imgPos.x += 14;
		}

		if(that.touching && that.hit) that.imgPos.y = -1;
		else that.imgPos.y = 0;

		that.touching = false;
	}

	that.addMethods("handleHit", "animate");

	return that;
}
