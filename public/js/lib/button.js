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

	that.checkPointer = (GAME) => {
		if(GAME.pointer.pos.x > that.pos.x
		&& GAME.pointer.pos.x < that.pos.x + that.size.x
		&& GAME.pointer.pos.y > that.pos.y
		&& GAME.pointer.pos.y < that.pos.y + that.size.y){
			that.alpha = 0.5;
			if(GAME.pointer.downed) that.downed = true;
			if(GAME.pointer.upped && that.downed) that.action(GAME);
		}else {
			that.alpha = 1;
			that.downed = false;
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

export default button;
