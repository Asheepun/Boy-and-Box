import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as text				from "/js/lib/text.js";

export const wasdText = (pos) => {
	const that = traitHolder();

	that.pos = pos;

	that.alpha = 1;

	that.fadeOut = false;

	that.checkStatus = ({ keys }) => {
		console.log(keys.a)
		if(keys.a.down || keys.d.down || keys.w.down){
			that.fadeOut = true;
		}
	}

	that.fade = ({ world: { remove } }) => {
		if(!that.fadeOut && that.alpha < 0.9){
			that.alpha += 0.015;
			that.pos.x += 0.2;
		}
		else if(that.fadeOut){
			that.alpha -= 0.015;
			that.pos.x += 0.2;
			if(that.alpha <= 0) remove(that);
		}
	}

	that.draw = (ctx, sprites) => {

		ctx.globalAlpha = that.alpha;

		text.white13("W", that.pos.x, that.pos.y, ctx);
		text.white13("A  D", that.pos.x - 11, that.pos.y + 12, ctx);

		ctx.globalAlpha = 1;

	}

	that.addMethods("checkStatus", "fade");

	return that;
}

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
		text.white13("to move the box.", that.pos.x + 20, that.pos.y + 20, ctx);

		ctx.globalAlpha = 1;

	}

	that.addMethods("checkStatus", "fade");

	return that;
}

