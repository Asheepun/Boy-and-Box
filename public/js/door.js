import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import { blueLock }				from "/js/blue.js";

export const door = (pos, index) => {
	const that = blueLock(pos);

	that.img = "door";
	let counter = 0;

	that.doorIndex = index;

	that.checkButtonPressed = () => {

	}

	that.removeMethods("checkBlues");
	that.addMethods("checkButtonPressed");

	return that;
}

export const doorButton = (pos, index) => {
	const that = traitHolder();

	that.buttonIndex = index;

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
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

	that.playerCol = (player) => {
		if(player.velocity.y > 3) that.touched = true;
		if(that.touched && player.onGround) that.hit = true;
	}

	that.redsCol = (red) => {
		if(red.velocity.y > 1) that.touched = true;
		if(that.touched && red.onGround) that.hit = true;
	}

	that.handleHit = ({ world: { obstacles } }) => {
		if(that.hit){
			obstacles.forEach(obstacle => {
				if(that.buttonIndex === obstacle.doorIndex){
					obstacle.hit = true;
				}
			});
		}
	}

	that.addMethods("handleHit");

	return that;
}
