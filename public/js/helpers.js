import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as text				from "/js/lib/text.js";

const helperBird = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(8, 9),
	})(that);

	traits.addSpriteTrait({
		img: "helper_bird",
		imgSize: that.size.copy(),
	})(that);

	traits.addFrameTrait({
		delay: 6,
		frames: "helper_bird_frames",
		initState: "idle",
	})(that);

	traits.addMoveTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.004,
	})(that);

	traits.addBoxColTrait({})(that);

	traits.addCheckColTrait({
		singles: ["player"],
	})(that);

	that.target;

	that.playerCol = (player) => {
		if(player.onGround && that.target === undefined){
			that.target = v.sub(that.pos, vec(60, 60));
		}
	}

	that.flyToTarget = () => {
		if(that.target){
			that.velocity = v.pipe(
				v.sub(that.center, that.pos),
				v.normalize,
				v.reverse,
			);
			if(v.sub(that.target, that.pos).mag < 5)
				that.velocity = vec(0, 0);
		}
	}

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = 1;
		else that.facing.x = -1;
	}

	that.addMethods("flyToTarget", "animate");

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

