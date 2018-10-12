import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const flower = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(5, 16),
	})(that);

	traits.addCheckColTrait({
		singles: ["player"],
	})(that);

	that.rotation = 0;

	that.draw = (ctx, sprites) => {
		ctx.save();
		ctx.translate(that.center.x, that.center.y);
		ctx.rotate(that.rotation);
		
		ctx.drawImage(sprites["flower_1"], -that.size.x/2, -that.size.y/2, that.size.x, that.size.y/2)

		ctx.restore();
	}


	that.rotateVelocity = 0.002;
	that.rotate = () => {
		that.rotation += that.rotateVelocity;

		if(that.rotation > 0.2 || that.rotation < -0.1) that.rotateVelocity *= -1;
	}

	that.playerCol = () => {
		that.hit = true;
	}

	that.hit = false;

	that.handleHit = () => {
		if(that.hit){
			that.hit = false;
			if(that.rotateVelocity > 0) that.rotateVelocity = 0.05;
			else that.rotateVelocity = -0.05;
		}else if(that.rotateVelocity > 0) that.rotateVelocity = 0.002;
		else that.rotateVelocity = -0.002;
	}

	that.addMethods("rotate", "handleHit");

	return that;
}

export default flower;
