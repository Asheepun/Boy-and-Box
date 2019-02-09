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

	GAME.world.add(buttons.clickableText({
		text: "Options",
		size: 20,
		pos: vec(GAME.width / 2 - 35, 160),
		action(GAME){
			GAME.world.clear("buttons", "birds");
			GAME.state = setupOptions;
		}
	}), "buttons", 10);

	//start contine newGame buttons
	if(Number(GAME.currentLevel) === 0){
		GAME.world.add(buttons.clickableText({
			text: "Start",
			size: 20,
			pos: vec(GAME.width / 2 - 24, 100),
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
				if(storageAvailable()){
					localStorage.currentLevel = 0;
					localStorage.deaths = 0;
				}
				GAME.currentLevel = 0;
				GAME.deaths = 0;
				GAME.fadeToState("setupLevel");
			}
		}), "buttons", 10);
	}

	//GAME.states.setupOptions = setupOptions;

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

const setupOptions = (GAME) => {
	//return button
	GAME.world.add(buttons.clickableText({
		pos: vec(GAME.width / 2 - 35, 160),
		size: 20,
		text: "Return",
		action(GAME){
			GAME.state = setupStartscreen;
			GAME.world.box.waitedForDowned = false;
			GAME.world.clear("settingsButtons");
			GAME.fullscreenBtn.hide();
		}
	}), "settingsButtons", 20);

	//sfx volume
	GAME.world.add(buttons.slider({
		pos: vec(GAME.width / 2 - 35, 55),
		startSlidePos: GAME.audio.sfxVolume / 2,
		action(GAME, value){
			GAME.audio.setVolume(value * 2, "sfx");
		},
	}), "settingsButtons", 20);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2 - 1, 45),
		size: 10,
		text: ["Sounds"],
	}), "settingsButtons", 20);

	//music volume
	GAME.world.add(buttons.slider({
		pos: vec(GAME.width / 2 - 35, 85),
		startSlidePos: GAME.audio.musicVolume / 2,
		action(GAME, value){
			GAME.audio.setVolume(value * 2, "music");
		},
	}), "settingsButtons", 20);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2 - 1, 75),
		size: 10,
		text: ["Music"],
	}), "settingsButtons", 20);

	if(!GAME.fullscreenBtn) GAME.fullscreenBtn = buttons.addFullscreenBtn(vec(GAME.width / 2 - 75, 120));
	else GAME.fullscreenBtn.show();
	GAME.fullscreenBtn.update(GAME);

	GAME.state = options;
	
}

const options = (GAME) => {
	GAME.transitionFade -= 0.01;
	if(GAME.transitionFade < 0) GAME.transitionFade = 0;
	GAME.world.update(GAME);
	GAME.fullscreenBtn.update(GAME);
}

function storageAvailable() {
    try {
		const x = "test";
        localStorage.setItem(x, x);
        localStorage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}

export default setupStartscreen;
