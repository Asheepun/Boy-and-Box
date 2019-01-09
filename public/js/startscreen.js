import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as buttons				from "/js/lib/button.js";
import * as objects				from "/js/generateLevel.js";
import addBirds 				from "/js/bird.js";

const setupStartscreen = (GAME) => {

	GAME.world.add(objects.tiles(GAME.sprites["backgrounds/startscreen"]), "background", 0, true);

	GAME.world.add(obstacle(vec(0, 50), vec(GAME.width, GAME.height)), "obstacles", 0);
	GAME.world.add(obstacle(vec(0, 0), vec(10, 50)), "obstacles", 0);
	GAME.world.add(obstacle(vec(GAME.width - 10, 0), vec(10, 50)), "obstacles", 0);

	//for interactions
	GAME.world.add(obstacle(vec(0, 0), vec(0, 0)), "box", 0, true)
	GAME.world.add(obstacle(vec(-100, 0), vec(0, 0)), "player", 0, true)
	
	addBirds(GAME);

	//buttons
	if(parseInt(GAME.currentLevel) === 0){
		GAME.world.add(buttons.clickableText({
			text: "Start",
			size: 20,
			pos: vec(GAME.width / 2 - 35, 100),
			action(GAME){
				GAME.fadeToState("setupLevel");
			}
		}), "buttons", 10);
	}else{
		GAME.world.add(buttons.clickableText({
			text: "Continue",
			size: 20,
			pos: vec(GAME.width / 2 - 40, 100),
			action(GAME){
				GAME.fadeToState("setupLevel");
			}
		}), "buttons", 10);
		GAME.world.add(buttons.clickableText({
			text: "New game",
			size: 20,
			pos: vec(GAME.width / 2 - 40, 130),
			action(GAME){
				localStorage.currentLevel = 0;
				GAME.currentLevel = 0;
				GAME.fadeToState("setupLevel");
			}
		}), "buttons", 10);
	}

	GAME.fullscreenBtn = buttons.addFullscreenBtn(vec(GAME.width / 2 - 86, 200));
	GAME.fullscreenBtn.hide();

	GAME.state = startscreen;
}

const startscreen = (GAME) => {

	GAME.world.update(GAME);
	
}

const obstacle = (pos, size) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size,
	})(that);

	return that;
}

export default setupStartscreen;
