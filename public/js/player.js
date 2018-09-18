import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as particles			from "/js/particles.js";

const player = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(12, 15),
	})(that);

	traits.addSpriteTrait({
		img: "boy",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.025,
	})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 15 * 32, 15 * 18 + 60],
	})(that);

	traits.addFrameTrait({
		delay: 6,
		frames: "boy_frames",
	})(that);

	that.jump = ({ world: { add } }) => {
		if(that.onGround){
			that.velocity.y = -5;
			for(let i = 0; i < 5; i++){
				add(particles.dust(
					vec(that.pos.x + Math.random()*(that.size.x-5), that.pos.y + that.size.y - 5),
					vec(Math.random()*2-1, Math.random()*0.5),
				), "particles", 5);
			}
		}
	}

	that.stopJump = () => {
		if(that.velocity.y < 0 || that.acceleration.y < 0){
			that.velocity.y = 0;
		}
	}

	that.maxFallVelocity = 4;
	that.maxSpeed = 2.1;

	that.dir = 0;

	that.handleVelocity = () => {
		if(that.velocity.y > that.maxFallVelocity)
			that.velocity.y = that.maxFallVelocity;

		that.acceleration.x = that.dir * 0.3;

		if(that.velocity.x > that.maxSpeed) that.velocity.x = that.maxSpeed;
		if(that.velocity.x < -that.maxSpeed) that.velocity.x = -that.maxSpeed;
		if(that.dir === 0) that.velocity.x *= 0.7;

	}

	that.handleOubX = (GAME) => {
		if(that.velocity.x < 0) that.pos.x = 0;
		if(that.velocity.x > 0){
			if(GAME.levelCleared){
				that.pos.x = 0;
				GAME.playerSpawn = that.pos.copy();
				GAME.currentLevel++;
				GAME.state = GAME.states.setupLevel;
			}else
				that.pos.x = GAME.width - that.size.x;

		}
		that.velocity.x = 0;
		that.acceleration.x = 0;
	}

	that.landed = false;
	that.animate = ({ keys, world: { add } }) => {
		if(that.velocity.x > 0) that.facing.x = 1;
		if(that.velocity.x < 0) that.facing.x = -1;

		if(keys.a.down || keys.d.down) that.frameState = "moving";
		else that.frameState = "still";

		if(Math.round(that.velocity.y) > 0) that.frameState = "falling";

		if(that.onGround && !that.landed){
			that.landed = true;
		}
		if(!that.onGround) that.landed = false;
	}

	let counter = 0;
	that.handleDust = ({ world: { add }, }) => {
		if(counter <= 36) counter++;
		if(that.frameState === "moving" && that.onGround && counter >= 12){
			counter -= 12;
			for(let i = 0; i < Math.random()*3; i++){
				if(that.facing.x === 1) add(particles.dust(
					vec(that.pos.x + Math.random()*3, that.pos.y + that.size.y-5),
					vec(-Math.random() * 0.5, Math.random() * 0.5),
				), "particles", 5);
				else add(particles.dust(
					vec(that.pos.x + that.size.x-5 - Math.random()*3, that.pos.y + that.size.y-5),
					vec(Math.random() * 0.5, Math.random() * 0.5),
				), "particles", 5);
			}
		}
	}

	that.addMethods("handleVelocity", "animate", "handleDust");

	return that;
}

export default player;
