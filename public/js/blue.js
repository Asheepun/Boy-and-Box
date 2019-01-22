import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v 				from "/js/lib/vector.js";
import * as text				from "/js/lib/text.js";
import * as particles			from "/js/particles.js";

export const blue = (pos, texts) => {
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

	traits.addBoxColTrait({})(that);

	traits.addColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 32 * 15 + that.size.x, 18 * 15 + that.size.y * 2]
	})(that);

	traits.addFrameTrait({
		delay: 20,
		frames: "blue_frames",
	})(that);

	traits.addTalkTrait({
		texts,
		Yoffset: 7,
		size: 9,
		condition: ({ world: { player } }) =>
			v.sub(that.center, player.center).mag < 25,
		sound: "blue",
		soundSpec: {
			volume: 0.09 + Math.random() * 0.02,
		},
	})(that);

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = 1;
		else that.facing.x = -1;
	}

	that.addMethods("animate");
	
	return that;
}

export const bouncer = (pos, texts) => {
	const that = blue(pos, texts);

	that.jump = () => {
		that.acceleration.y = 0;
		that.velocity.y = -1.4;
	}
	
	that.recharge = 0;
	that.jumping = false;
	that.jumpSaveCounter = 0;

	let count = 0;
	that.bounce = ({ width }) => {
		that.recharge--;

		if(that.jumpSaveCounter > 0 && !that.waiting){
			if(that.recharge === 0){
				that.jump();
				that.jumping = true;
			}

			if(that.recharge < 0) that.recharge = 10;
		}
	}

	that.handleJumpSaveCounter = () => {
		that.jumpSaveCounter--;

		if(that.onGround) that.jumpSaveCounter = 10;

	}

	that.openingLock = false;
	that.waiting = false;
	that.handleVelocity = ({ width, levelCleared }) => {
		if(that.onGround && that.pos.x > width - 15 - that.size.x && !levelCleared) that.waiting = true;

		if(levelCleared) that.waiting = false;

		if(that.onGround || that.waiting) that.jumping = false;

		if(that.jumping
		&& !that.openingLock) that.velocity.x = 15 / 32;
		else that.velocity.x = 0;
	}


	that.animate = ({ world: { player } }) => {
		if(that.onGround) that.frameState = "charging";
		else that.frameState = "jumping";
		if(that.waiting || that.talking) that.frameState = "still";

		that.facing.x = 1;
		
	}

	that.handleOubX = ({ world: { remove } }) => {
		if(that.velocity.x < 0) that.pos.x = 0;
		else remove(that);
	}

	that.handleOubY = () => {
		if(that.velocity.y > 0) that.hit = true;
		else that.pos.y = 0;
	}

	let o;
	that.checkLocks = ({ world: { obstacles } }) => {
		for(let i = 0; i < obstacles.length; i++){
			o = obstacles[i];
			if(o.isBlueLock
			&& Math.floor(that.pos.x) + that.size.x === o.pos.x
			&& that.pos.y >= o.pos.y - o.size.y - 1
			&& that.pos.y < o.pos.y + o.size.y){
				that.openingLock = true;
				if(that.onGround) o.hit = true;
				break;
			}else that.openingLock = false;
		}
		obstacles.forEach(o => {
		});
	}

	that.addMethods("checkLocks", "handleVelocity", "handleJumpSaveCounter", "bounce", "checkOub");

	return that;
}

export const blueDoc = (pos) => {
	const that = blue(pos, [
		["He's not doing", "so well."]
	]);

	that.img = "blue_doc";

	that.removeMethods("animate");

	return that;
}

export const blueDeathcounter = (pos) => {
	const that = blue(pos, [
		["Hello"],
	]);

	that.checkDeaths = ({ deaths }) => {
		that.texts = [[
			"You only died",
			deaths + " times!",
		]];

		if(deaths === 1)
			that.texts = [[
				"You only died once!",
			]];

		if(deaths === 0)
			that.texts = [[
				"Flawless Victory!",
			]];

	}

	that.addMethods("checkDeaths");

	return that;
}

export const blueLock = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "blue_lock",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addColTrait({})(that)

	traits.addPhysicsTrait({
		gravity: 0.01,
	})(that);

	that.isBlueLock = true;

	that.checkBlues = ({ world: { blues, remove, add } }) => {
		blues.forEach((blue) => {
			if(Math.floor(blue.pos.x + blue.size.x) >= that.pos.x - 2
			&& blue.pos.y >= that.pos.y
			&& blue.pos.y < that.pos.y + that.size.y
			&& blue.onGround){
				that.hit = true;
			}
		});
	}

	let playedSound = false;
	that.checkHit = ({ world: { remove }, audio: { play } }) => {
		if(that.hit){
			if(!playedSound){
				playedSound = true;
				play("blue_lock_dissappear", {
					volume: 0.15,
				});
			}
			that.alpha -= 0.145;
			if(that.alpha <= 0) remove(that);
		}
	}

	that.addMethods("checkBlues", "checkHit");
	
	return that;
}
