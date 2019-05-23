import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";

const screenShaker = () => {
	const that = traitHolder();

	that.context = vec(0, 0);

	that.dir;
	let counter = 0;
	that.shake = (dir, duration) => {
		that.dir = dir.copy();
		counter = duration;
	}

	that.handleContext = (GAME) => {
		counter--;
		if(counter >= 0){
			that.context = v.add(that.context, that.dir);
		}

		that.context = v.mul(that.context, 0.5);

		GAME.context = that.context.copy();
	}

	that.addMethods("handleContext");

	return that;
}

export default screenShaker;
