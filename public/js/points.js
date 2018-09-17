import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const point = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "point",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({
		velocity: vec(0, 0.15),
	})(that);

	traits.addCheckColTrait({
		singles: ["player"],
	})(that);

	traits.addPhysicsTrait({
		gravity: 0,
	})(that);

	that.initPos = that.pos.copy();
	that.hover = () => {
		if(that.pos.y >= that.initPos.y + 3 || that.pos.y <= that.initPos.y - 3)
			that.velocity.y *= -1;
	}

	that.open = ({ world: { pointTarget, remove }, width }) => {
		that.acceleration = v.add(that.acceleration, v.pipe(
			v.sub(that.center, pointTarget),
			v.normalize,
			v.reverse,
			x => v.mul(x, 0.06),
		));

		if(that.pos.x > width){
			remove(that);
		}
	}


	that.playerCol = () => {
		that.hit = true;
	}

	that.checkHit = ({ world: { remove, pointTarget } }) => {
		if(that.hit){
			that.acceleration = v.pipe(
				v.sub(that.center, pointTarget),
				v.normalize,
				x => v.mul(x, 0.7),
			)
			that.removeMethods("hover", "checkhit");
			that.addMethods("open");
		}
	}

	that.addMethods("hover", "checkHit");

	return that;
}

export default point;
