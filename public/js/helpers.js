import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as text				from "/js/lib/text.js";

export const boxText = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(0, 0),
	})(that);

	that.alpha = 0;

	let boxOriginPos;

	let fadeIn = false;
	let fadeOut = false;

	that.checkStatus = ({ world: { box, player } }) => {
		if(!boxOriginPos) boxOriginPos = box.pos.copy();
		if(player.onGround && player.pos.y < box.pos.y && !fadeOut){
			fadeIn = true;
		}

		if(box.pos.x !== boxOriginPos.x
		|| box.pos.y  !== boxOriginPos.y){
			fadeIn = false;
			fadeOut = true;
		}

		boxOriginPos = box.pos.copy();
	}

	that.pos.x -= (0.9 / 0.015) * 0.2

	that.pulsing = true;

	that.fade = ({ world: { remove } }) => {
		if(fadeIn && that.alpha < 0.9){
			that.alpha += 0.015;
			that.pos.x += 0.2;
		}
		else if(fadeOut){
			that.alpha -= 0.015;
			that.pos.x += 0.2;
			if(that.alpha <= 0) remove(that);
		}
	}

	that.pulse = () => {
		if(that.pulsing){
		
		}
	}

	that.draw = (ctx, sprites) => {

		ctx.globalAlpha = that.alpha;

		text.white13("Click with your mouse", that.pos.x, that.pos.y, ctx);
		text.white13("to teleport the box.", that.pos.x + 5, that.pos.y + 20, ctx);

		ctx.globalAlpha = 1;

	}

	that.addMethods("checkStatus", "fade");

	return that;
}

export const boxHelper = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(75, 30),
	})(that);

	traits.addSpriteTrait({
		img: "box_helper",
		alpha: 0,
	})(that);

	let count = 0;
	that.animate = () => {
		if(fadeIn) count++;
		if(count % 6 === 0 && count !== 0){
			that.imgPos.y += 30;
			if(that.imgPos.y >= 33 * 30) that.imgPos.y = 0;
		}
	}

	let boxOriginPos;
	let fadeIn = false;
	let fadeOut = false;

	that.checkStatus = ({ world: { player, box } }) => {
		if(!boxOriginPos) boxOriginPos = box.pos.copy();
		if(player.onGround && player.pos.y < box.pos.y && !fadeOut){
			fadeIn = true;
		}

		if(box.pos.x !== boxOriginPos.x
		|| box.pos.y  !== boxOriginPos.y){
			fadeIn = false;
			fadeOut = true;
		}

		boxOriginPos = box.pos.copy();
	}

	that.fade = ({ world: { remove } }) => {
		if(fadeIn && that.alpha < 0.5){
			that.alpha += 0.015 * (0.5 / 0.9);
			that.pos.x += 0.2 * (0.5 / 0.9);
		}
		else if(fadeOut){
			that.alpha -= 0.015 * (0.5 / 0.9);
			that.pos.x += 0.2 * (0.5 / 0.9);
			if(that.alpha <= 0) remove(that);
		}
	}

	that.addMethods("checkStatus", "fade", "animate");

	return that;
}
