import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as particles			from "/js/particles.js";

const point = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos: v.add(pos, vec(2, 2)),
		size: vec(11, 11),
	})(that);

	traits.addSpriteTrait({
		img: "point",
		imgSize: that.size.copy(),
	})(that);

	traits.addMoveTrait({
		velocity: vec(0, 0.15),
	})(that);

	traits.addPhysicsTrait({
		gravity: 0,
	})(that);

	that.initPos = that.pos.copy();
	that.hover = () => {
		if(that.pos.y >= that.initPos.y + 3 || that.pos.y <= that.initPos.y - 3)
			that.velocity.y *= -1;
	}

	let spawner = 0;

	that.open = ({ world: { pointTarget, remove, add }, width, context, audio: { play } }) => {
		that.acceleration = v.add(that.acceleration, v.pipe(
			v.sub(that.center, pointTarget),
			v.normalize,
			v.reverse,
			x => v.mul(x, 0.06),
		));

		spawner++;
		if(spawner % 3 === 0){
			const p = particles.dust(that.center.copy(), vec(Math.random()-0.5, Math.random()-0.5))
			p.handleColX = p.handleColY = undefined;
			add(p, "particles", 5);
		}

		if(that.pos.x > width){
			remove(that);
			for(let i = 0; i < 7 + Math.random() * 3; i++){
				add(particles.dust(vec(width-5, that.pos.y + Math.random()*that.size.y), vec(-Math.random()*2-1, Math.random()*2-1)), "particles", 5);
			}
			context.x += 5 * 2;

			play("level_cleared", {
				volume: 0.5,
			});
		}
	}

	that.checkPlayer = ({ world: { player } }) => {
		if(v.sub(that.center, player.center).mag < that.size.x / 2 + player.size.x / 2 - 1)
			that.hit = true;
	}

	that.checkHit = ({ world: { pointTarget, remove, add }, audio: { play } }) => {
		if(that.hit){
			remove(that);
			add(that, "points", 9);
			play("pickup_point", {
				volume: 0.5,
			});
			//play("point_pickup_jingle", {
				//volume: 0.2,
			//});
			that.acceleration = v.pipe(
				v.sub(that.center, pointTarget),
				v.normalize,
				x => v.mul(x, 0.7),
			);
			that.removeMethods("hover", "checkhit");
			that.addMethods("open");
		}
	}

	that.addMethods("hover", "checkPlayer", "checkHit");

	return that;
}

export default point;
