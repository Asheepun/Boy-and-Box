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
			fullscreenBtn.style.display = "none";
		}
	}), "settingsButtons", 20);

	//volume control
	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2-35, 100),
		size: 20,
		text: ["Volume:"],
	}), "settingsButtons", 20);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2 + 20, 100),
		size: 20,
		text: [GAME => Math.floor(GAME.audio.volume * 100) + "%"],
	}), "settingsButtons", 20);

	GAME.world.add(buttons.clickableText({
		pos: vec(GAME.width / 2 + 60, 83),
		size: 20,
		text: "-",
		action(GAME){
			//fix dumbass floating point
			GAME.audio.volume = Math.floor(GAME.audio.volume * 100);
			GAME.audio.volume -= 10;
			GAME.audio.volume = GAME.audio.volume / 100;
			if(GAME.audio.volume < 0) GAME.audio.volume = 0;
		}
	}), "settingsButtons", 20);

	GAME.world.add(buttons.clickableText({
		pos: vec(GAME.width / 2 + 80, 83),
		size: 20,
		text: "+",
		action(GAME){
			//fix dumbass floating point
			GAME.audio.volume = Math.floor(GAME.audio.volume * 100);
			GAME.audio.volume += 10;
			GAME.audio.volume = GAME.audio.volume / 100;
			if(GAME.audio.volume > 2) GAME.audio.volume = 2;
		}
	}), "settingsButtons", 20);

	//fixing fullscreenBtn scale
	fullscreenBtn.style["font-size"] = 20 * GAME.c.scale + "px";
	fullscreenBtn.style.top =
		GAME.c.offsetTop + 120 * GAME.c.scale + "px";
	fullscreenBtn.style.left =
		GAME.c.offsetLeft + (GAME.width / 2 - 75) * GAME.c.scale + "px";
	//making fs button visible if fullscreen is possible
	if(document.fullscreenEnabled
	|| (browser && document[browser + "FullscreenEnabled"]))
		fullscreenBtn.style.display = "block";

	GAME.state = settings;
}

const settings = (GAME) => {
	GAME.world.dimm.update(GAME);

	GAME.world.settingsButtons.forEach(b => b.update(GAME));

	//fixing fullscreenBtn scale
	fullscreenBtn.style["font-size"] = 20 * GAME.c.scale + "px";
	fullscreenBtn.style.top =
		GAME.c.offsetTop + 120 * GAME.c.scale + "px";
	fullscreenBtn.style.left =
		GAME.c.offsetLeft + (GAME.width / 2 - 75) * GAME.c.scale + "px";
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

//fullscreenBtn
const fullscreenBtn = document.createElement("p");
fullscreenBtn.innerHTML = "Fullscreen: off";
fullscreenBtn.style.display = "none";
document.body.appendChild(fullscreenBtn);

let isFullscreen = false;

let browser = false;

if(document.body.webkitRequestFullscreen) browser = "webkit";
if(document.body.mozRequestFullscreen) browser = "moz";
if(document.body.msRequestFullscreen) browser = "ms";

fullscreenBtn.addEventListener("click", () => {

	if(!isFullscreen){
		if(!browser) document.body.requestFullscreen();
		else document.body[browser + "RequestFullscreen"]();

		isFullscreen = true;
		fullscreenBtn.innerHTML = "Fullscreen: on";
	}else{
		if(!browser) document.exitFullscreen();
		else document[browser + "ExitFullscreen"]();

		isFullscreen = false;
		fullscreenBtn.innerHTML = "Fullscreen: off";
	}

});
