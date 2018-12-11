import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";

const button = ({ pos, size, img, sound, action }) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size,
	})(that);

	traits.addSpriteTrait({
		img,
		imgSize: that.size.copy(),
	})(that);

	that.sound = sound;
	that.action = action;

	that.downed = false;

	that.checkPointer = (GAME) => {
		if(GAME.pointer.pos.x > that.pos.x
		&& GAME.pointer.pos.x < that.pos.x + that.size.x
		&& GAME.pointer.pos.y > that.pos.y
		&& GAME.pointer.pos.y < that.pos.y + that.size.y){
			that.alpha = 0.7;
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

export default button;
