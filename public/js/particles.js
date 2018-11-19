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

export const dust = (pos, velocity) => {
	const that = particle({
		pos,
		velocity,
		size: vec(5, 5),
		img: "dust",
		imgSize: vec(5, 5),
	});

	traits.addColTrait({
		bounce: true,
	})(that);

	traits.addBoxColTrait({
		bounce: true,
	})(that);

	let shrinkage;
	that.shrink = ({ world: { remove } }) => {
		shrinkage = Math.random()*0.5
		that.size.x -= shrinkage;
		that.size.y -= shrinkage;

		if(that.size.x < 0 || that.size.y < 0){
			remove(that);
		}
	}

	that.spin = () => {
		that.rotation += Math.random()* 0.5;
	}

	that.addMethods("shrink", "spin");

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
	dustParticles[dustParticleIndex].size = vec(5, 5);
	dustParticles[dustParticleIndex].rotation = 0;
	console.log(dustParticleIndex);
	return dustParticles[dustParticleIndex];
}
