import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";

export const button = ({ pos, size, img, action }) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size,
	})(that);

	traits.addSpriteTrait({
		img,
		imgSize: that.size.copy(),
	})(that);

	that.action = action;

	that.downed = false;

	that.hoverSoundPlayed = true;

	that.checkPointer = (GAME) => {
		if(GAME.pointer.pos.x > that.pos.x
		&& GAME.pointer.pos.x < that.pos.x + that.size.x
		&& GAME.pointer.pos.y > that.pos.y
		&& GAME.pointer.pos.y < that.pos.y + that.size.y){
			that.alpha = 0.5;
			if(!that.hoverSoundPlayed){
				GAME.audio.play("menu_hover", {
					volume: 0.30,
				});
				that.hoverSoundPlayed = true;
			}
			if(GAME.pointer.downed){
				that.action(GAME);
				GAME.audio.play("menu_select", {
					volume: 0.25,
				});
			}
		}else {
			that.alpha = 1;
			that.hoverSoundPlayed = false;
		}
	}

	that.addMethods("checkPointer");

	return that;
}

export const clickableText = ({ pos, size, text, action }) => {
	const that = button({
		pos,
		size: vec(0, 0),
		action,
	});

	that.text = text;
	that.fontSize = size;

	that.size.x = that.text.length * that.fontSize / 2 + that.fontSize / 2;
	that.size.y = that.fontSize;

	that.draw = (ctx) => {
		ctx.globalAlpha = that.alpha;
		ctx.fillStyle = "white";
		ctx.font = that.fontSize + "px game",
		ctx.fillText(that.text, that.pos.x, that.pos.y + that.size.y - Math.floor(that.size.y / 6));
		ctx.globalAlpha = 1;
	}

	return that;
}

export const slider = ({ pos, startSlidePos, action }) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(70, 6),
	})(that);

	that.action = action;

	that.slidePos = startSlidePos * that.size.x;
	that.down = false;

	let lastSlidePos;
	that.checkPointer = (GAME) => {
		if(GAME.pointer.pos.x > that.pos.x
		&& GAME.pointer.pos.x < that.pos.x + that.size.x
		&& GAME.pointer.pos.y > that.pos.y
		&& GAME.pointer.pos.y < that.pos.y + that.size.y
		&& GAME.pointer.downed){
			that.down = true;
		}

		if(!GAME.pointer.down) that.down = false;

		if(that.down){
			that.slidePos = Math.floor(GAME.pointer.pos.x - that.pos.x);
		}

		if(that.slidePos < 0) that.slidePos = 0;
		if(that.slidePos > that.size.x) that.slidePos = that.size.x;

		if(that.slidePos !== lastSlidePos)
			that.action(GAME, Math.floor(that.slidePos * 100 / that.size.x) / 100);

		lastSlidePos = that.slidePos;
	}

	that.draw = (ctx, sprites) => {
		ctx.fillStyle = "white";
		ctx.fillRect(that.pos.x, that.pos.y + 2, that.size.x, 2);
		ctx.fillRect(that.pos.x + that.slidePos, that.pos.y, 2, that.size.y)
	}

	that.addMethods("checkPointer");

	return that;
}

export const addFullscreenBtn = (pos) => {
	const that = {
		pos,
	};

	const btn = document.createElement("p");
	btn.innerHTML  = "Fullscreen: off";

	document.body.appendChild(btn);

	let isFullscreen = false;

	let browser = false;

	if(document.body.webkitRequestFullscreen) browser = "webkit";
	if(document.body.mozRequestFullscreen) browser = "moz";
	if(document.body.msRequestFullscreen) browser = "ms";

	if(!(document.fullscreenEnabled
	|| (browser && document[browser + "FullscreenEnabled"]))){
		fullscreenBtn.style.display = "none";
	}

	that.playSound;

	that.playHoverSound;

	btn.addEventListener("mousedown", () => {

		that.playSound();
		if(!isFullscreen){
			if(!browser) document.body.requestFullscreen();
			else document.body[browser + "RequestFullscreen"]();

			isFullscreen = true;
			btn.innerHTML = "Fullscreen: on";
		}else{
			if(!browser) document.exitFullscreen();
			else document[browser + "ExitFullscreen"]();

			isFullscreen = false;
			btn.innerHTML = "Fullscreen: off";
		}

	});

	btn.addEventListener("mouseover", () => {
		that.playHoverSound();
	})

	that.update = (GAME) => {
		that.playSound = () => GAME.audio.play("menu_select", {
			volume: 0.25,
		});
		that.playHoverSound = () => {
			GAME.audio.play("menu_hover", {
				volume: 0.3,
			});
		}
		btn.style["font-size"] = 20 * GAME.c.scale + "px";
		btn.style.top =
			GAME.c.offsetTop + that.pos.y * GAME.c.scale + "px";
		btn.style.left =
			GAME.c.offsetLeft + that.pos.x * GAME.c.scale + "px";
	}

	that.hide = () => {
		document.body.removeChild(btn);
	}

	that.show = () => {
		document.body.appendChild(btn);
	}

	return that;
}

export default button;
