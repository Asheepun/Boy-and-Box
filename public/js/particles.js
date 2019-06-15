import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v		 		from "/js/lib/vector.js";

const particle = ({ pos, size, img, imgSize, velocity }) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size,
	})(that);

	traits.addSpriteTrait({
		img,
		imgSize,
		canRotate: true,
	})(that);

	traits.addMoveTrait({
		velocity,
	})(that);

	return that;
}

export const dust = (pos, velocity, haveCol = true) => {
	const that = particle({
		pos,
		velocity,
		size: vec(5, 5),
		img: "dust",
		imgSize: vec(5, 5),
	});

	if(haveCol){
		traits.addColTrait({
			bounce: true,
		})(that);

		traits.addBoxColTrait({
			bounce: true,
		})(that);
	}

	let shrinkage;
	that.shrink = ({ world: { remove } }) => {
		shrinkage = Math.random()*0.5
		that.size.x -= shrinkage;
		that.size.y -= shrinkage;

		if(that.size.x <= 0 || that.size.y <= 0){
			remove(that);
		}
	}

	that.spin = () => {
		that.rotation += Math.random()* 0.5;
	}

	that.addMethods("shrink", "spin");

	return that;
}

export const confetti = ({ pos, img, velocity, gravity }) => {
	const that = particle({
		pos,
		velocity,
		img,
		size: vec(4, 4),
		imgSize: vec(4, 4),
	});

	traits.addPhysicsTrait({
		gravity,
	})(that);

	that.pointRotation = () => {
		that.rotation += Math.random() * 0.3 - 0.3;
	}

	that.addMethods("pointRotation")

	return that;
}

export const debri = (pos, velocity) => {
	const that = particle({
		pos,
		velocity,
		img: "tiles/lab_tiles",
		size: vec(8 + Math.random() * 4, 8 + Math.random() * 4),
		imgPos: vec(16, 16),
	});

	//that.rotation = Math.random() * 10;
	that.alpha = 0.9;

	traits.addPhysicsTrait({
		gravity: 0.03,
	})(that);

	that.fade = ({ world: { remove } }) => {
		that.size.x -= 0.2;
		that.size.y -= 0.2;
		that.drawSize = that.size.copy();
		if(that.size.x <= 0) remove(that);
		//that.alpha -= 0.05;
		if(that.alpha < 0) that.alpha = 0;
	}

	that.addMethods("fade");

	return that;
}

export const oneUp = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(32, 32),
	})(that);

	traits.addSpriteTrait({
		img: "1up",
		alpha: 1,
	})(that);

	traits.addMoveTrait({
		velocity: vec(0, -0.7),
	})(that);

	return that;
}

export const bossHalf = (pos, velocity, imgPos) => {
	const that = particle({
		pos,
		velocity,
		size: vec(120, 60),
		img: "boss",
	});

	that.imgPos = imgPos;

	traits.addPhysicsTrait({
		gravity: 0.004,
	})(that);

	that.reduceXVel = () => {
		that.velocity.x *= 0.97;
	}

	that.setupSprayer = ({ world: { add, remove }, height, width }) => {
		 if(that.pos.y > height){
			add(bossPieceSprayer(vec(width - 120 - 15, height + 20), ({  }) => {
				console.log("DONE!!");
			}), "bossPieceSprayer", 0, true);
			remove(that);
		}
	}

	that.addMethods("reduceXVel", "setupSprayer");

	return that;
}

const bossPieceSprayer = (pos, func) => {
	const that = traitHolder();

	that.pos = pos.copy();

	that.func = func;

	that.lifeCounter = 60 * 3;

	that.handleLifeCounter = (GAME) => {
		that.lifeCounter--;
		if(that.lifeCounter === 0){
			that.func(GAME);
			GAME.world.remove(that);
		}
	}

	let counter = 0;
	that.spray = ({ world: { add } }) => {
		counter++;
		if(counter % 2 === 0){
			add(bossPiece(vec(that.pos.x + 10 + Math.random() * 100, that.pos.y), vec(Math.random() * 0.2 - 0.4, -3 * Math.random() - 6)), "particles", 4);
		}
	}

	that.addMethods("spray", "handleLifeCounter");

	return that;
}

export const bossPiece = (pos, velocity) => {
	const that = particle({
		pos,
		size: vec(5 + Math.random() * 15, 5 + Math.random() * 15),
		velocity,
		img: "boss_piece",
		imgSize: vec(5, 5)
	});

	that.rotation = Math.random() * 10;

	if(Math.random() < 0.5){
		that.imgPos.x += 7;
	}

	traits.addPhysicsTrait({
		gravity: 0.01,
	})(that);

	return that;
}

const dustParticles = [];

for(let i = 0; i < 100; i++){
	dustParticles.push(dust(vec(0, 0), vec(0, 0)));
}

let dustParticleIndex = 0;

export const getDustParticle = (pos, velocity) => {
	dustParticleIndex++;
	if(dustParticleIndex >= dustParticles.length) dustParticleIndex = 0;
	dustParticles[dustParticleIndex].pos = pos;
	dustParticles[dustParticleIndex].velocity = velocity;
	dustParticles[dustParticleIndex].acceleration = vec(0, 0);
	dustParticles[dustParticleIndex].size = vec(5, 5);
	dustParticles[dustParticleIndex].rotation = 0;
	return dustParticles[dustParticleIndex];
}
