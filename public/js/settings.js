import * as buttons	   			from "/js/lib/button.js";
import traitHolder, * as traits from "/js/lib/traits.js"
import vec, * as v 				from "/js/lib/vector.js";

const setupSettings = (GAME) => {
	GAME.world.add(dimm(), "dimm", 20, true);

	//return button
	GAME.world.add(buttons.clickableText({
		pos: vec(GAME.width / 2 - 35, 160),
		size: 20,
		text: "Return",
		action(GAME){
			GAME.state = GAME.states.level;
			GAME.world.dimm.fadeOut = true;
			GAME.world.clear("settingsButtons");
		}
	}), "settingsButtons", 20);

	GAME.state = settings;
}

const settings = (GAME) => {
	GAME.world.dimm.update(GAME);

	GAME.world.settingsButtons.forEach(b => b.update(GAME));
}

export default setupSettings;

const dimm = () => {
	const that = {};

	that.alpha = 0;

	that.fadeOut = false;

	that.update = ({ world: { remove } }) => {
		if(that.fadeOut) that.alpha -= 0.02;
		else if(that.alpha < 0.7) that.alpha += 0.03;

		if(that.alpha <= 0) remove(that);
	}

	that.draw = (ctx, sprites) => {
		ctx.globalAlpha = that.alpha;
		ctx.drawImage(sprites.transition, 15, 15, 1, 1, 0, 0, 15 * 32, 15 * 18);
		ctx.globalAlpha = 1;
	}

	return that;
}
