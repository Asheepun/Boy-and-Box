import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";

export const red = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(23, 21),
	})(that);

	traits.addSpriteTrait({
		img: "red",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.0045,
	})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 32 * 15, 18 * 15 + that.size.y],
	})(that);

	traits.addFrameTrait({
		frames: "red_frames",
		delay: 10,
	})(that);

	that.checkPlayerCol = ({ world: { player }, sprites }) => {
		if(col.checkPixelCol(that, player, sprites)) player.hit = true;
	}

	that.handleColX = (obstacle) => {
		that.facing.x *= -1;
		if(that.velocity.x > 0) that.pos.x = obstacle.pos.x - that.size.x;
		else that.pos.x = obstacle.pos.x + obstacle.size.x;
	}

	that.handleOubX = () => {
		that.facing.x *= -1;
		if(that.velocity.x > 0) that.pos.x = 32 * 15 - that.size.x;
		else that.pos.x = 0;
	}

	that.handleOubY = ({ world: { remove } }) => {
		if(that.velocity.y > 0) remove(that);
		else that.pos.y = 0;
	}

	let rechargeCounter = 0;
	that.rechargeTime = 10;
	that.jumping = false;

	that.bounce = () => {
		rechargeCounter--;
	
		if(that.onGround){
			if(rechargeCounter === 0){
				that.jumping = true;
				that.jump();
			}

			if(rechargeCounter < 0) rechargeCounter = that.rechargeTime;
		}
	}

	that.jumpVelocity = -1.1//-1.2;

	that.jump = () => {
		that.velocity.y = that.jumpVelocity;
	}

	that.handleVelocity = () => {
		if(!that.onGround) that.velocity.x = that.facing.x * 0.5;
		else that.velocity.x = 0;
	}


	that.animate = () => {
		if(that.onGround) that.frameState = "still";
		else that.frameState = "jumping";
	}

	that.addMethods("handleVelocity", "bounce", "animate", "checkPlayerCol");

	return that;
}

export const jumper = (pos) => {
	const that = red(pos);

	that.pos.x += 2;
	that.velocity.x = 0;
	that.jumpVelocity = -2.25;
	that.gravity = 0.0045;
	//that.gravity = 0.01;

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = 1;
		else that.facing.x = -1;

		if(that.onGround) that.frameState = "still";
		else that.frameState = "jumping";
	}

	that.removeMethods("handleVelocity");

	return that;
}

