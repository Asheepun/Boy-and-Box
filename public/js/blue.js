import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v from "/js/lib/vector.js";

export const bouncer = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(12, 12),
	})(that);

	traits.addSpriteTrait({
		img: "blue",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.007,
	})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addFrameTrait({
		delay: 20,
		frames: "blue_frames",
	})(that);

	that.facing.x = -1;

	that.jump = () => {
		that.velocity.y = -1.4;
	}
	
	that.recharge = 0;

	that.bounce = () => {
		that.recharge--;

		if(that.onGround && !that.waiting){
			if(that.recharge === 0) that.jump();

			if(that.recharge < 0) that.recharge = 10;
		}
	}

	that.waiting = false;
	that.handleVelocity = ({ width, levelCleared }) => {
		if(that.onGround && that.pos.x >= width - 40 && !levelCleared) that.waiting = true;

		if(levelCleared) that.waiting = false;

		if(that.onGround || that.waiting) that.velocity.x = 0;
		else that.velocity.x = 0.7;
	}

	that.animate = () => {
		if(that.onGround) that.frameState = "charging";
		else that.frameState = "jumping";
		if(that.waiting) that.frameState = "still";
		
	}

	that.addMethods("bounce", "handleVelocity", "animate");

	return that;
}
