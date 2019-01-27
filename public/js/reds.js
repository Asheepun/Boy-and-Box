import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";
import * as particles			from "/js/particles.js";

export const red = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(23, 21),
		hitBox: vec(17, 18),
		hitBoxOffset: vec(4, 2),
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
		sound: "red" + Math.floor(Math.random() * 3),
		soundSpec: {
			volume: 0.25 + Math.random() * 0.1,
		},
		size: 10,
		Yoffset: 9,
		condition: ({ world: { player } }) =>
			v.sub(that.center, player.center).mag < 45,
	})(that);

	that.facing.x = -1;

	that.checkPlayerCol = ({ world: { player }, sprites }) => {
		if(col.checkHitBoxCol(that, player)){
			player.hit = true;
		}
	}

	that.bounceX = true;
	that.handleColX = (obstacle) => {
		if(that.bounceX) that.facing.x *= -1;
		if(that.velocity.x > 0) that.pos.x = obstacle.pos.x - that.size.x;
		else that.pos.x = obstacle.pos.x + obstacle.size.x;
	}

	that.handleOubX = () => {
		if(that.bounceX) that.facing.x *= -1;
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

	that.speed = 0.5;

	that.handleVelocity = () => {
		if(!that.onGround) that.velocity.x = that.facing.x * that.speed;
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
		["Get over here!"],
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

export const smallJumper = (pos) => {
	const that = jumper(pos);

	that.jumpVelocity = -1.05;

	return that;
}

export const spawner = (pos) => {
	const that = red(pos);

	that.img = "red_spawner";
	that.pos.x += 30 - that.size.x;
	that.spawn = pos.copy();
	that.velocity.y = 5;

	that.originSize = that.size.copy();

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

export const giant = (pos) => {
	const that = jumper(pos);

	traits.addLandingTrait({
		velocity: 5,
	})(that);

	that.texts = [
		[
			"GRAAH!",
		],
		[
			"Bugger!",
		],
		[
			"Twerp!",
		],
		[
			"Chicken little!",
		],
	]

	that.jumpVelocity = -3.55//2.75;

	that.velocity.y = -1;

	that.size.x = 23 * 6;
	that.size.y = 21 * 6;

	that.hitBox.x = that.size.x - 8 * 6;
	that.hitBox.y = that.size.y - 2 * 6;

	that.hitBoxOffset.x = 4 * 6;
	that.hitBoxOffset.y = 2 * 6;

	that.img = "red_giant";
	that.imgSize = that.size.copy();

	that.frames = "red_giant_frames";

	that.rechargeTime = 20;

	that.textSize = 20;

	let posX;
	that.land = ({ context, world: { add }, audio: { play } }) => {
		context.y = 15;
		play("giant_land", {
			volume: 0.5 + Math.random() * 0.1,
		});

		for(let i = 0; i < 7 + Math.random() * 4; i++){
			posX = that.pos.x + Math.random() * that.size.x;
			add(particles.getDustParticle(
				vec(posX, that.pos.y + that.size.y - 5),
				vec((posX > that.center.x) ? Math.random() + 0.5 : -Math.random() - 0.5, Math.random()),
			), "particles", 5);
		}
	}

	that.handleBoxCol = ({ world: { box } }) => {
		if(that.pos.x + that.hitBoxOffset.x + that.hitBox.x + 4 >= box.pos.x//+4 for fix with stupid collission issue
		&& that.pos.x + that.hitBoxOffset.x <= box.pos.x + box.size.x
		&& that.pos.y + that.size.y >= box.pos.y
		&& that.pos.y + that.size.y <= box.pos.y + that.velocity.y + 3
		&& that.velocity.y >= 0){
			that.pos.y = box.pos.y - that.size.y;
			that.fixCenter();
			that.onGround = true;
			that.velocity.y = 0;
			that.acceleration.y = 0;
		}
	}

    that.handleColY = (obstacle) => {
		if(col.checkCol({
			pos: v.add(that.pos, that.hitBoxOffset),
			size: vec(that.hitBox.x, that.size.y)
		}, obstacle)){
			if(that.velocity.y > 0){
				that.onGround = true;
				that.pos.y = obstacle.pos.y - that.size.y;
			}else{
				that.onRoof = true;
				that.pos.y = obstacle.pos.y + obstacle.size.y;
			}
			that.velocity.y = 0;
			that.acceleration.y = 0;
		}
    }

	that.handleColX = undefined;

	that.textCondition = ({ world: { player } }) =>
		v.sub(that.center, player.center).mag < 120;

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

export const hunter = (pos) => {
	const that = red(pos);

	that.img = "red_hunter";

	that.bounceX = false;

	that.rechargeTime = 5;

	that.speed = 1;

	that.hunt = ({ world: { player } }) => {
		console.log(that.velocity.x)
		if(that.pos.x > player.center.x) that.facing.x = -1;
		if(that.pos.x + that.size.x < player.center.x) that.facing.x = 1;
	}

	that.addMethods("hunt");

	return that;
}
