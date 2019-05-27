import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";

const screenShaker = () => {
	const that = traitHolder();

	that.context = vec(0, 0);

	that.dir;
	that.coefficient = 1;
	that.callback = () => {};
	let counter = 0;
	that.shake = (dir, coefficient, duration, callback = () => {}) => {
		that.dir = dir.copy();
		that.coefficient = coefficient;
		counter = duration;
		that.callback = callback;
	}

	that.handleContext = (GAME) => {
		counter--;
		if(counter >= 0){
			that.context = v.add(that.context, that.dir);
		}

		that.context = v.mul(that.context, that.coefficient);


		if(Math.round(that.context.x) === 0
		&& Math.round(that.context.y) === 0
		&& (that.context.x !== 0
		|| that.context.y !== 0)){
			that.context = v.floor(that.context);
			that.callback(GAME);
		}

		GAME.context = that.context.copy();
	}

	that.addMethods("handleContext");

	return that;
}

export default screenShaker;
