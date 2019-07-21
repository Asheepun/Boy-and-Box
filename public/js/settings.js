import * as buttons	   			from "/js/lib/button.js";
import traitHolder, * as traits from "/js/lib/traits.js"
import vec, * as v 				from "/js/lib/vector.js";

const setupSettings = (GAME) => {
	GAME.world.add(dimm(), "dimm", 20, true);

	//return button
	GAME.world.add(buttons.clickableText({
		pos: vec(GAME.width / 2, 160),
		size: 20,
		text: "Return",
		action(GAME){
			GAME.state = GAME.states.level;
			GAME.world.dimm.fadeOut = true;
			GAME.world.box.waitedForDowned = false;
			GAME.world.clear("settingsButtons");
			GAME.fullscreenBtn.hide();
		}
	}), "settingsButtons", 20);

	//sfx volume
	GAME.world.add(buttons.slider({
		pos: vec(GAME.width / 2 - 35, 55),
		startSlidePos: GAME.audio.sfxVolume / 2,
		action(GAME, value){
			GAME.audio.setVolume(value * 2, "sfx");
		},
	}), "settingsButtons", 20);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2 - 1, 45),
		size: 10,
		text: ["Sounds"],
	}), "settingsButtons", 20);

	//music volume
	GAME.world.add(buttons.slider({
		pos: vec(GAME.width / 2 - 35, 85),
		startSlidePos: GAME.audio.musicVolume / 2,
		action(GAME, value){
			GAME.audio.setVolume(value * 2, "music");
		},
	}), "settingsButtons", 20);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2 - 1, 75),
		size: 10,
		text: ["Music"],
	}), "settingsButtons", 20);

	if(!GAME.fullscreenBtn) GAME.fullscreenBtn = buttons.addFullscreenBtn(vec(GAME.width / 2 - 75, 120));
	else GAME.fullscreenBtn.show();

	GAME.state = settings;
}

const settings = (GAME) => {
	GAME.world.dimm.update(GAME);

	GAME.world.settingsButtons.forEach(b => b.update(GAME));

	GAME.fullscreenBtn.update(GAME);
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
