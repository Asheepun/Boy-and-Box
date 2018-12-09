import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const bird = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(6, 7),
	})(that);

	traits.addSpriteTrait({
		img: "blue_bird",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({})(that);

	traits.addColTrait({})(that);

	traits.addBoxColTrait({})(that);

	traits.addPhysicsTrait({
		gravity: 0.01,
	})(that);

	traits.addFrameTrait({
		delay: 4,
		frames: "blue_bird_frames",
	})(that);

	traits.addLandingTrait({})(that);

	that.recharge = 0;

	that.land = () => {
		that.recharge = 30 + Math.floor(Math.random()*30)
		that.velocity.x = 0;
	}

	that.jump = () => {
		that.recharge--;

		if(that.recharge <= 0 && that.onGround){
			if(Math.random() < 0.3) that.facing.x *= -1;

			that.velocity.x = -0.5 * that.facing.x;
			that.velocity.y = -0.7;
		}
	}

	that.checkToFly = ({ world: { player, remove, add }, levelCleared }) => {
		if((v.sub(that.center, player.center).mag < 50 || levelCleared) && !that.flying){
			that.flying = true;
			that.velocity.y = -2.5 - Math.random()*1;
			that.velocity.x = -2 - Math.random();
			that.gravity = 0.001;
			that.acceleration.y = -0.001;
			that.acceleration.x = -0.05;
			that.recharge = -1;
			that.size.x = 11;
			that.imgSize.x = 11;
			that.facing = -1;
			that.handleColX = that.handleColY = undefined;

			remove(that);
			add(that, "birds", 9);
			
			that.removeMethods("jump");
		}
	}

	that.animate = () => {
		if(that.recharge <= 10 && that.recharge >= 0)
			that.frameState = "charge_jump";
		else that.frameState = "still";
		if(that.flying) that.frameState = "flying";
	}

	that.handleOub = ({ world: { remove }, height, width }) => {
		if(that.pos.y < 0 || that.pos.y > height || that.pos.x > width || that.pos.x < -that.size.x){
			remove(that);
		}
	}

	that.addMethods("animate", "jump", "checkToFly", "handleOub");

	return that;
}

const addBirds = ({ world, world: { add }, width, height }) => {
	const amount = Math.floor(1 + Math.random() * 3);
	const noise = width / amount;

	for(let i = 0; i < amount; i++){
		const b = bird(vec(i * noise + Math.random() * noise, 0));
		
		b.velocity.y = 5;
		for(let i = 0; i < height / 5; i++){
			b.move({ world });
		}

		add(b, "birds", 4);
	}
}

export default addBirds;
