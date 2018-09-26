import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v from "/js/lib/vector.js";

const blue = (pos) => {
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
		gravity: 0.004,
	})(that);

	traits.addColTrait({})(that);

	that.originSize = that.size.copy();

	let changeAmount = 0.1;

	that.bounce = () => {
		if(that.onGround){
			that.pos.x -= changeAmount / 2;
			that.size.x += changeAmount;
			that.size.y -= changeAmount;
			that.pos.y += changeAmount;
			if(that.size.x > that.originSize.x + 1) that.velocity.y = -1;
		}else if(that.size.x > that.originSize.x - 1){
			that.size.x -= changeAmount;
			that.size.y += changeAmount;
			that.pos.x += changeAmount / 2;
		}
	}

	that.addMethods("bounce");

	return that;
}

export default blue;
