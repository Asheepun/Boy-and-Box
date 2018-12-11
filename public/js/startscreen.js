import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import addClouds from "/js/clouds.js";

const setupStartScreen = (GAME) => {
	addClouds(GAME);

	GAME.world.add(tiles(GAME.sprites["backgrounds/sky"]), "background", 0, true);

	GAME.state = startScreen;
}

const startScreen = (GAME, ctx) => {

	if(GAME.pointer.upped){
		GAME.transitionState("setupLevel");
	}

	GAME.world.update(GAME);

}

const tiles = (img) => {
	const that = traitHolder();

	that.img = img;

	that.draw = (ctx) => {
		ctx.drawImage(that.img, 0, 0, 15 * 32, 15 * 18);
	}

	return that;
}

export default setupStartScreen;
