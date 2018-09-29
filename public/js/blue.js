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

	traits.addCheckColTrait({
		singles: ["player"],
	})(that);

	that.playerCol = () => {
		that.talking = true;
	}

	that.bounce = () => {
	}

	that.originSize = that.size.copy();

	let changeAmount = 0.1;

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = -1;
		else that.facing.x = 1;

		if(that.size.x >= that.originSize.x + 1 || that.size.x <= that.originSize.x - 1)
			changeAmount *= -1;

		that.size.x += changeAmount;
		that.size.y -= changeAmount;
		that.pos.x -= changeAmount / 2;
		that.pos.y += changeAmount;
	}

	that.addMethods("animate");

	return that;
}

export default blue;
