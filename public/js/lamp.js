import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const lamp = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "lamp",
		imgSize: that.size.copy(),
	})(that);

	that.spawnLight = ({ world: { add } }) => {

		add(light(v.sub(that.pos, vec(15 * 2, 15 * 2))), "lights", 9);
	
		that.removeMethods("spawnLight");
	}

	//that.addMethods("spawnLight");

	return that;
}

const light = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15 * 5, 15 * 5),
	})(that);

	traits.addSpriteTrait({
		img: "lamp_light",
		imgPos: vec(0, 0),
		imgSize: vec(5, 5),
	})(that);

	return that;
}

export default lamp;
