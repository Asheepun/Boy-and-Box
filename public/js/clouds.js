import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const cloud = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(60, 20),
	})(that);

	traits.addSpriteTrait({
		img: "cloud",
		imgSize: vec(60, 20),
		alpha: 0.9,
	})(that);

	traits.addMoveTrait({
		velocity: vec(0.5 + Math.random()*0.1, 0)
	})(that);

	that.checkOub = ({ width }) => {
		if(that.pos.x > width){
			that.pos.x = -60;
			that.pos.y = Math.random()*10;
			that.velocity.x = Math.random()*0.1 + 0.5;
		}
	}

	that.addMethods("checkOub");

	return that;
}

const addClouds = ({ world: { add }, width }) => {
	const changeFactor = (width - 60) / 4;
	for(let i = 0; i < 4; i++){
		add(cloud(vec(i * changeFactor + Math.random()*(changeFactor / 2), Math.random()*10)), "clouds", 9);
	
	}
}

export default addClouds;
