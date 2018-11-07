import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v 				from "/js/lib/vector.js";
import * as text				from "/js/lib/text.js";

export const bouncer = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(12, 12),
	})(that);

	traits.addSpriteTrait({
		img: "blue",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.007,
	})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 32 * 15 + that.size.x, 18 * 15 + that.size.y * 2]
	})(that);

	traits.addFrameTrait({
		delay: 20,
		frames: "blue_frames",
	})(that);

	that.jump = () => {
		that.velocity.y = -1.4;
	}
	
	that.recharge = 0;

	that.bounce = () => {
		that.recharge--;

		if(that.onGround && !that.waiting && !that.talking){
			if(that.recharge === 0) that.jump();

			if(that.recharge < 0) that.recharge = 10;
		}
	}

	that.waiting = false;
	that.handleVelocity = ({ width, levelCleared }) => {
		if(that.onGround && that.pos.x >= width - 40 && !levelCleared) that.waiting = true;

		if(levelCleared) that.waiting = false;

		if(that.onGround || that.waiting || that.talking) that.velocity.x = 0;
		else that.velocity.x = 0.7;
	}

	that.talking = false;

	that.checkPlayer = ({ world: { player }, levelCleared }) => {
		if(v.sub(that.center, player.center).mag < 25 && !that.waiting && that.pos.y > player.pos.y)
			that.talking = true;
		else that.talking = false;
	}

	that.texts = [
		["I can't jump", "this high!"],
		["Will you help me", "get back to my", "village?"],
	];

	that.currentText = 0;
	let lastCurrentText;

	that.talk = ({ world: { add, remove } }) => {
		if(that.talking && that.text === undefined && that.onGround){
			that.text = textEntity({
				pos: vec(that.center.x, that.pos.y - 7),
				text: that.texts[that.currentText],
				size: 9,
			});
			add(that.text, "texts", 9);

			lastCurrentText = that.currentText;
			while(that.currentText === lastCurrentText){
				that.currentText = Math.floor(Math.random()*that.texts.length);
			}
		}
		if(!that.talking && that.text !== undefined){
			remove(that.text);
			that.text = undefined; 
		
		}
	}

	that.animate = ({ world: { player } }) => {
		if(that.onGround) that.frameState = "charging";
		else that.frameState = "jumping";
		if(that.waiting || that.talking) that.frameState = "still";

		if(that.talking && player.center.x < that.center.x && that.onGround)
			that.facing.x = -1;
		else that.facing.x = 1;
		
	}

	that.handleHit = ({ transitionState }) => {
		if(that.hit) transitionState("setupLevel")
	}

	that.handleOubX = ({ world: { remove } }) => {
		if(that.velocity.x < 0) that.pos.x = 0;
		else remove(that);
	}

	that.handleOubY = () => {
		if(that.velocity.y > 0) that.hit = true;
		else that.pos.y = 0;
	}

	that.addMethods("bounce", "checkPlayer", "handleVelocity", "animate", "talk", "checkOub", "handleHit");

	return that;
}

const textEntity = ({ pos, size, text }) => {
	const that = traitHolder();

	that.pos = pos;
	that.size = size;
	that.text = text;

	let offsetX;

	that.draw = (ctx) => {
		ctx.globalAlpha = 1;
		ctx.fillStyle = "white";
		ctx.font = size + "px game";
		for(let i = 0; i < that.text.length; i++){
			offsetX = (that.text[i].length / 2) * (that.size / 2);
			ctx.fillText(that.text[i], that.pos.x - offsetX, that.pos.y - (size + 2) * (that.text.length-1 - i));
		}
		ctx.globalAlpha = 1;
	}


	return that;
}
