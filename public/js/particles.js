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
