import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";

export const red = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(23, 21),
	})(that);

	traits.addSpriteTrait({
		img: "red",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.0045,
	})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addOubTrait({
		oubArea: [0, 0, 32 * 15, 18 * 15 + that.size.y],
	})(that);

	traits.addFrameTrait({
		frames: "red_frames",
		delay: 10,
	})(that);

	that.facing.x = -1;

	that.checkPlayerCol = ({ world: { player }, sprites }) => {
		if(col.checkPixelCol(that, player, sprites)) player.hit = true;
	}

	that.handleColX = (obstacle) => {
		that.facing.x *= -1;
		if(that.velocity.x > 0) that.pos.x = obstacle.pos.x - that.size.x;
		else that.pos.x = obstacle.pos.x + obstacle.size.x;
	}

	that.handleOubX = () => {
		that.facing.x *= -1;
		if(that.velocity.x > 0) that.pos.x = 32 * 15 - that.size.x;
		else that.pos.x = 0;
	}

	that.handleOubY = ({ world: { remove } }) => {
		if(that.velocity.y > 0) remove(that);
		else that.pos.y = 0;
	}

	let rechargeCounter = 0;
	that.rechargeTime = 10;
	that.jumping = false;

	that.bounce = () => {
		rechargeCounter--;
	
		if(that.onGround){
			if(rechargeCounter === 0){
				that.jumping = true;
				that.jump();
			}

			if(rechargeCounter < 0) rechargeCounter = that.rechargeTime;
		}
	}

	that.jumpVelocity = -1.1//-1.2;

	that.jump = () => {
		that.velocity.y = that.jumpVelocity;
	}

	that.handleVelocity = () => {
		if(!that.onGround) that.velocity.x = that.facing.x * 0.5;
		else that.velocity.x = 0;
	}


	that.animate = () => {
		if(that.onGround) that.frameState = "still";
		else that.frameState = "jumping";
	}

	that.addMethods("handleVelocity", "bounce", "animate", "checkPlayerCol");

	return that;
}

export const jumper = (pos) => {
	const that = red(pos);

	that.pos.x += 2;
	that.velocity.x = 0;
	that.jumpVelocity = -2.25;
	that.gravity = 0.0045;
	//that.gravity = 0.01;

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = 1;
		else that.facing.x = -1;

		if(that.onGround) that.frameState = "still";
		else that.frameState = "jumping";
	}

	that.removeMethods("handleVelocity");

	return that;
}

let transed = false;

export const blueTrans = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos: v.add(pos, vec(2, 3)),
		size: vec(12, 12),
	})(that);

	traits.addSpriteTrait({
		img: "blue_trans",
		imgSize: that.size.copy(),
	})(that);

	traits.addFrameTrait({
		frames: "blue_trans_frames",
		delay: 15,
	})(that);

	that.transformed = false;
	that.transform = ({ sprites, world: { remove, add } }) => {
		if(transed){
			remove(that);
			add(red(vec(that.pos.x - 6, that.pos.y - 12)), "reds", 5);
		}

		if(that.imgPos.x === sprites[that.img].width - 12)
			that.transformed = true;

		if(that.transformed){
			if(that.methods["handleFrames"])that.removeMethods("handleFrames");
			that.facing.x = -1;
			that.img = "red";
			that.imgPos = vec(0, 0);
			that.imgSize = vec(23, 21);
			that.size.x += 1;
			that.size.y += 1;
			that.pos.x -= 0.5;
			that.pos.y -= 1;
			if(that.size.x >= 23){
				remove(that);
				remove(that.text);
				add(red(vec(that.pos.x-1, that.pos.y)), "reds", 5);
				transed = true;
			}
		}
	}

	that.text = textEntity({
		pos: vec(that.center.x, that.pos.y - 7),
		text: ["WAIT!"],
		size: 9,
	});

	that.addText = ({ world: { add } }) => {
		if(transed) return;
		add(that.text, "texts", 5);

		that.removeMethods("addText");
	}

	that.addMethods("transform", "addText");

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
