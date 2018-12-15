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
		oubArea: [0, 0, 32 * 15, 18 * 15 + that.size.y * 3],
	})(that);

	traits.addFrameTrait({
		frames: "red_frames",
		delay: 10,
	})(that);

	traits.addTalkTrait({
		texts: [
			["GRAAHH!"],
			["Come'ere bugger!"],
			["Twerp!"],
		],
		size: 10,
		Yoffset: 9,
		condition: ({ world: { player } }) =>
			v.sub(that.center, player.center).mag < 45,
	})(that);

	that.pos.y += 30 - that.size.y;

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
		if(that.velocity.y > 0) that.hit = true;
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

	that.hit = false;
	that.handleHit = ({ world: { remove } }) => {
		if(that.hit){
			remove(that);
		}
	}
	
	that.addMethods("handleVelocity", "bounce", "animate", "checkPlayerCol", "handleHit");

	return that;
}

export const jumper = (pos) => {
	const that = red(pos);

	that.pos.x += 2;
	that.velocity.x = 0;
	that.jumpVelocity = -2.25;
	that.gravity = 0.0045;

	that.texts.push(
		["Get back here!"],
		["Don't run away!"],
	);

	that.animate = ({ world: { player } }) => {
		if(player.center.x > that.center.x) that.facing.x = 1;
		else that.facing.x = -1;

		if(that.onGround) that.frameState = "still";
		else that.frameState = "jumping";
	}

	that.removeMethods("handleVelocity");

	return that;
}

export const spawner = (pos) => {
	const that = red(pos);

	that.img = "red_spawner";
	that.pos.x += 30 - that.size.x;
	that.spawn = pos.copy();

	that.originSize = that.size.copy();

	//that.rechargeTime = 5;

	that.handleHit = () => {
		if(that.hit){
			that.pos = that.spawn.copy();
			that.facing.x = -1;
			that.hit = false;
			that.size = vec(5, 5);
			that.pos.x += (that.originSize.x - 5) / 2;
			that.pos.y += that.originSize.y - 5;
		}
	}

	that.grow = () => {

		if(that.size.x < that.originSize.x){
			that.pos.x -= 0.75;
			that.pos.y -= 1.5;
			that.size.x += 1.5;
			that.size.y += 1.5;
		}else{
			that.size.x = that.originSize.x;
			that.size.y = that.originSize.y;
		}
	}

	that.addMethods("grow");

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

	traits.addTalkTrait({
		texts: [["WAIT!"]],
		Yoffset: 7,
		size: 9,
		condition: () => !transed,
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

	that.addMethods("transform");

	return that;
}
