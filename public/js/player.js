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
		oubArea: [0, 0, 15 * 32, 15 * 18 + 20],
	})(that);

	traits.addLandingTrait({})(that);

	traits.addFrameTrait({
		delay: 6,
		frames: "boy_frames",
	})(that);

	that.jumpSaveCounter = 0;

	that.jump = ({ world: { add }, audio: { play } }) => {
		if(that.jumpSaveCounter > 0){
			play("boy_jump");
			that.velocity.y = -5;
			that.acceleration.y = 0.025; //what it would be if onGround
			for(let i = 0; i < 5; i++){
				add(particles.getDustParticle(
					vec(that.pos.x + Math.random()*(that.size.x-5), that.pos.y + that.size.y - 5),
					vec(Math.random()*2-1, Math.random()*0.5),
				), "particles", 5);
			}
			that.jumpSaveCounter = 0;
		}
	}

	that.handleJumpSaveCounter = () => {
		that.jumpSaveCounter--;

		if(that.onGround) that.jumpSaveCounter = 10;

	}

	that.stopJump = () => {
		if(that.velocity.y < 0 || that.acceleration.y < 0){
			that.velocity.y = 0;
		}
	}

	that.landCounter = 0;

	that.land = ({ audio: { play } }) => {
		that.landed = true;
		that.landCounter = 10;
		play("boy_land");
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

	that.animate = ({ keys, world: { add }, audio: { play } }) => {
		if(that.velocity.x > 0) that.facing.x = 1;
		if(that.velocity.x < 0) that.facing.x = -1;

		if(keys.a.down || keys.d.down) that.frameState = "moving";
		else that.frameState = "still";

		that.landCounter--;
		if(that.landCounter > 0) that.frameState = "landing";
		if(Math.round(that.velocity.y) > 0) that.frameState = "falling";

	}

	let counter = 0;
	that.handleDust = ({ world: { add }, }) => {
		if(counter <= 36) counter++;
		if(that.frameState === "moving" && that.onGround && counter >= 12){
			counter -= 12;
			for(let i = 0; i < Math.random()*3; i++){
				add(particles.getDustParticle(
					vec(that.center.x - 2.5 - that.facing.x * ((that.size.x - 5) / 2), that.pos.y + that.size.y - 5),
					vec(-Math.random() * 0.5 * that.facing.x, Math.random()*0.5),
				), "particles", 5);
			}
		}
	}

	that.checkLevelCleared = ({ levelCleared, width }) => {
		if(levelCleared) that.oubArea[2] = width + that.size.x;
	}

	that.handleHit = ({ transitionState }) => {
		if(that.hit) transitionState("setupLevel")
	}

	that.handleOubX = (GAME) => {
		if(that.velocity.x < 0) that.pos.x = 0;
		if(that.velocity.x > 0){
			if(GAME.levelCleared && !that.hit){
				GAME.currentLevel++;
				GAME.transitionState("setupLevel");
			}else
				that.pos.x = GAME.width - that.size.x;

		}
		that.velocity.x = 0;
		that.acceleration.x = 0;
	}

	that.handleOubY = () => {
		if(that.velocity.y < 0) that.pos.y = 0;
		if(that.velocity.y > 0) that.hit = true;

		that.velocity.y = 0;
		that.acceleration.y = 0;
	}

	that.addMethods("handleVelocity", "animate", "handleDust", "checkLevelCleared", "handleHit", "handleJumpSaveCounter");

	return that;
}

export default player;
