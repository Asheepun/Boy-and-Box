import button	   				from "/js/lib/button.js";
import traitHolder, * as traits from "/js/lib/traits.js"
import vec, * as v 				from "/js/lib/vector.js";

const setupSettings = (GAME) => {
	GAME.world.add(dimm(), "dimm", 20, true);

	GAME.state = settings;
}

const settings = (GAME) => {
	if(GAME.pointer.upped){
		GAME.world.clear("dimm");

		GAME.state = GAME.states.level;
		return;
	}

	GAME.world.dimm.update(GAME);
}

export default setupSettings;

const dimm = () => {
	const that = {};

	that.alpha = 0;

	that.update = () => {
		if(that.alpha < 0.5) that.alpha += 0.03;
	}

	that.draw = (ctx, sprites) => {
		ctx.globalAlpha = that.alpha;
		ctx.drawImage(sprites.transition, 15, 15, 1, 1, 0, 0, 15 * 32, 15 * 18);
		ctx.globalAlpha = 1;
	}

	return that;
}
