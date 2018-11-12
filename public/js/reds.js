import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

export const red = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(22, 25),
	})(that);

	traits.addSpriteTrait({
		img: "red",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 15 * 32, 15 * 18 + that.size.y],
	})(that);

	traits.addPhysicsTrait({
		gravity: 0.0030,
	})(that);

	traits.addFrameTrait({
		frames: "red_frames",
		delay: 10,
	})(that);

	that.handleColX = (obstacle) => {
		that.facing.x *= -1;
		if(that.velocity.x > 0) that.pos.x = obstacle.pos.x - that.size.x;
		else that.pos.x = obstacle.pos.x + obstacle.size.x;
	}

	that.handleOubY = ({ world: { remove } }) => {
		if(that.velocity.y > 0) remove(that);
		else that.pos.y = 0;
	}

	let rechargeCounter = 0;
	that.jumping = false;

	that.bounce = () => {
		rechargeCounter--;
	
		if(that.onGround){
			if(rechargeCounter === 0){
				that.jumping = true;
				that.jump();
			}

			if(rechargeCounter < 0) rechargeCounter = 8;
		}
	}

	that.jump = () => {
		that.velocity.y = -1.1;
	}

	that.handleVelocity = () => {
		if(that.onGround) that.jumping = false;

		if(that.jumping) that.velocity.x = that.facing.x * 0.8;
		else that.velocity.x = 0;
	}

	that.animate = () => {
		if(that.onGround) that.frameState = "still";
		else that.frameState = "jumping";
	}

	that.addMethods("handleVelocity", "bounce", "animate");

	return that;
}
