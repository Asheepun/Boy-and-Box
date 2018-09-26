import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const flower = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(5, 16),
	})(that);

	that.rotation = 0;

	that.draw = (ctx, sprites) => {
		ctx.save();
		ctx.translate(that.center.x, that.center.y);
		ctx.rotate(that.rotation);
		
		ctx.drawImage(sprites["flower_1"], -that.size.x/2, -that.size.y/2, that.size.x, that.size.y/2)

		ctx.restore();
	}


	that.rotateVelocity = 0.005;
	that.rotate = () => {
		that.rotation += that.rotateVelocity;

		if(that.rotation > 0.2 || that.rotation < -0.1) that.rotateVelocity *= -1;
	}

	that.addMethods("rotate");

	return that;
}

export default flower;
