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
		gravity: 0.024//0.025,
	})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 15 * 32, 15 * 18 + 20],
	})(that);

	traits.addLandingTrait({
		velocity: 1,
	})(that);

	traits.addFrameTrait({
		delay: 6,
		frames: "boy_frames",
	})(that);

	that.handleColX = (obstacle) => {
		//fix issue when moving from box to ground
		if(that.pos.y + that.size.y <= obstacle.pos.y + 3){
			that.pos.y = obstacle.pos.y - that.size.y;
		}else{
		
		if(that.velocity.x > 0){
			that.pos.x = obstacle.pos.x - that.size.x;
			that.onRightWall = true;
		}
		else{
			that.pos.x = obstacle.pos.x + obstacle.size.x;
			that.onLeftWall = true;
		}
		that.velocity.x = 0;
		that.acceleration.x = 0;
		}
	}

	that.jumpSaveCounter = 0;

	that.jump = ({ world: { add, obstacles }, audio: { play } }) => {
		if(that.jumpSaveCounter > 0 && !that.checkObstaclesAbove(obstacles) && that.pos.y > 0){
			play("boy_jump1", {});
			that.velocity.y = -4//5;
			that.acceleration.y = 0//0.025; //what it would be if onGround
			for(let i = 0; i < 5; i++){
				add(particles.dust(
					vec(that.pos.x + Math.random()*(that.size.x-5), that.pos.y + that.size.y - 5),
					vec(Math.random()*2-1, Math.random()*0.5),
				), "particles", 5);
			}
			that.jumpSaveCounter = 0;
		}
	}

	that.handleJumpSaveCounter = (GAME) => {
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
		that.landCounter = 10;
		play("boy_land", {});
	}

	let obs;
	that.checkObstaclesAbove = (obstacles) => {
		for(let i = 0; i < obstacles.length; i++){
			obs = obstacles[i];

			if(that.pos.x + that.size.x > obs.pos.x
			&& that.pos.x < obs.pos.x + obs.size.x
			&& Math.floor(that.pos.y) === obs.pos.y + obs.size.y) return obs;
		}
		return false;
	}

	that.maxFallVelocity = 3.5;
	that.maxSpeed = 2;

	that.Xresistance = 0.69;

	that.dir = 0;

	that.handleVelocity = () => {
		if(that.velocity.y > that.maxFallVelocity)
			that.velocity.y = that.maxFallVelocity;

		that.acceleration.x = that.dir * 0.3;

		if(that.velocity.x > that.maxSpeed) that.velocity.x = that.maxSpeed;
		if(that.velocity.x < -that.maxSpeed) that.velocity.x = -that.maxSpeed;
		if(that.dir === 0) that.velocity.x *= that.Xresistance;

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
				add(particles.dust(
					vec(that.center.x - 2.5 - that.facing.x * ((that.size.x - 5) / 2), that.pos.y + that.size.y - 5),
					vec(-Math.random() * 0.5 * that.facing.x, Math.random()*0.5),
				), "particles", 5);
			}
		}
	}

	that.checkLevelCleared = ({ levelCleared, width }) => {
		if(levelCleared) that.oubArea[2] = width + that.size.x;
	}

	let hitCounter = 0;
	that.handleHit = ({ transitionState, world: { add, remove } }) => {
		if(that.hit) hitCounter++;
		else hitCounter = 0;
		if(hitCounter > 2){
			transitionState("setupLevel");
		}
	}

	that.handleOubX = (GAME) => {
		if(that.velocity.x < 0) that.pos.x = 0;
		if(that.velocity.x > 0){
			if(GAME.levelCleared && !that.hit){
				GAME.currentLevel++;
				GAME.transitionState("setupLevel", 5);
				if(GAME.saveProgress) localStorage.currentLevel = GAME.currentLevel;
			}else
				that.pos.x = GAME.width - that.size.x;

		}
		that.velocity.x = 0;
		that.acceleration.x = 0;
	}

	that.handleOubY = ({ transitionState }) => {
		if(that.velocity.y < 0){
			that.onRoof = true;
			that.pos.y = 0;
		}
		if(that.velocity.y > 0) that.hit = true;

		that.velocity.y = 0;
		that.acceleration.y = 0;
	}

	that.addMethods("handleVelocity", "animate", "handleDust", "checkLevelCleared", "handleHit", "handleJumpSaveCounter");

	return that;
}

export default player;
