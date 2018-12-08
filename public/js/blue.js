import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v 				from "/js/lib/vector.js";
import * as text				from "/js/lib/text.js";

export const blue = (pos, texts) => {
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

	traits.addBoxColTrait({})(that);

	traits.addColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 32 * 15 + that.size.x, 18 * 15 + that.size.y * 2]
	})(that);

	traits.addFrameTrait({
		delay: 20,
		frames: "blue_frames",
	})(that);

	that.texts = texts

	that.talking = false;

	that.checkPlayer = ({ world: { player }, levelCleared }) => {
		if(v.sub(that.center, player.center).mag < 25 && !that.waiting)
			that.talking = true;
		else that.talking = false;
	}


	that.currentText = 0;
	let lastCurrentText;

	that.talk = ({ world: { add, remove } }) => {
		if(that.talking ){
			if(that.text === undefined){
				that.text = textEntity({
					pos: vec(that.center.x, that.pos.y - 7),
					text: that.texts[that.currentText],
					size: 9,
				});
				add(that.text, "texts", 9);

				if(that.texts.length > 1){
					lastCurrentText = that.currentText;
					while(that.currentText === lastCurrentText){
						that.currentText = Math.floor(Math.random()*that.texts.length);
					}
				}
			}else that.text.pos = vec(that.center.x, that.pos.y - 7);
		}
		if(!that.talking && that.text !== undefined){
			remove(that.text);
			that.text = undefined; 
		
		}
	}

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = 1;
		else that.facing.x = -1;
	}

	that.addMethods("checkPlayer", "talk", "animate");
	
	return that;
}

export const bouncer = (pos, texts) => {
	const that = blue(pos, texts);

	that.jump = () => {
		that.acceleration.y = 0;
		that.velocity.y = -1.4;
	}
	
	that.recharge = 0;
	that.jumping = false;
	that.jumpSaveCounter = 0;

	let count = 0;
	that.bounce = ({ width }) => {
		that.recharge--;

		if(that.jumpSaveCounter > 0 && !that.waiting){
			if(that.recharge === 0){
				that.jump();
				that.jumping = true;
			}

			if(that.recharge < 0) that.recharge = 10;
		}
	}

	that.handleJumpSaveCounter = () => {
		that.jumpSaveCounter--;

		if(that.onGround) that.jumpSaveCounter = 10;

	}

	that.waiting = false;
	that.handleVelocity = ({ width, levelCleared }) => {
		if(that.onGround && that.pos.x > width - 15 - that.size.x && !levelCleared) that.waiting = true;

		if(levelCleared) that.waiting = false;

		if(that.onGround || that.waiting) that.jumping = false;

		if(that.jumping) that.velocity.x = 15 / 32;
		else that.velocity.x = 0;
	}


	that.animate = ({ world: { player } }) => {
		if(that.onGround) that.frameState = "charging";
		else that.frameState = "jumping";
		if(that.waiting || that.talking) that.frameState = "still";

		that.facing.x = 1;
		
	}

	that.handleOubX = ({ world: { remove } }) => {
		if(that.velocity.x < 0) that.pos.x = 0;
		else remove(that);
	}

	that.handleOubY = () => {
		if(that.velocity.y > 0) that.hit = true;
		else that.pos.y = 0;
	}

	that.addMethods("handleVelocity", "handleJumpSaveCounter", "bounce", "checkOub");

	return that;
}

export const blueDoc = (pos) => {
	const that = blue(pos, [
		["He's not doing", "so well."]
	]);

	that.img = "blue_doc";

	that.removeMethods("animate");

	return that;
}

export const blueLock = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "blue_lock",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addColTrait({})(that)

	traits.addPhysicsTrait({
		gravity: 0.01,
	})(that);

	that.checkBlues = ({ world: { blues, remove } }) => {
		blues.forEach((blue) => {
			if(Math.floor(blue.pos.x + blue.size.x) >= that.pos.x - 2
			&& blue.pos.y >= that.pos.y
			&& blue.pos.y < that.pos.y + that.size.y
			&& blue.onGround){
				remove(that);
			}
		});
	}

	that.addMethods("checkBlues");
	
	return that;
}

const textEntity = ({ pos, size, text }) => {
	const that = traitHolder();

	that.pos = pos;
	that.size = size;
	that.text = text;

	let offsetX;
	
	//pre render text
	/*
	const img = document.createElement("canvas");
	const ctx = img.getContext("2d");
	let longestRow = 0;
	for(let i = 0; i < text.length; i++){
		if(text[i].length > longestRow) longestRow = text[i].length;
	}
	img.width = Math.floor(longestRow * (size / 2));
	img.height = size;
	ctx.fillStyle = "white";
	ctx.font = size + "px game";
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;    
	ctx.imageSmoothingEnabled = false;
	for(let i = 0; i < text.length; i++){
		ctx.fillText(that.text[i], 0, size);
	}
	*/

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
