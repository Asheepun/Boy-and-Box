import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as text				from "/js/lib/text.js";
import * as loaders 	 		from "/js/lib/assets.js";
import createCanvas 	 		from "/js/lib/canvas.js";
import gameWorld 		 		from "/js/lib/gameWorld.js";
import keys						from "/js/lib/keys.js";
import button, * as buttons		from "/js/lib/button.js";
import generateLevel			from "/js/generateLevel.js";
import addClouds				from "/js/clouds.js";
import player					from "/js/player.js";
import * as helpers				from "/js/helpers.js";
import addBirds 				from "/js/bird.js";
import levels					from "/js/levels.js";
import setupSettings			from "/js/settings.js";
import setupStartscreen 		from "/js/startscreen.js";
import setupCredits				from "/js/credits.js";
import * as progUtils			from "/js/progress.js";
import screenShaker				from "/js/screenShaker.js";

Promise.all([
	createCanvas(15 * 32, 15 * 18),
	loaders.loadSprites(
		"boy",
		"boy_hit",
		"box",
		"backgrounds/sky",
		"backgrounds/planks",
		"backgrounds/lab",
		"backgrounds/startscreen",
		"tiles/grass_tiles",
		"tiles/grass_wall_tiles",
		"tiles/plank_tiles",
		"tiles/lab_tiles",
		"tiles/plank_tiles_infected",
		"tiles/grass_tiles_infected",
		"tiles/lab_tiles_infected",
		"tiles/grass",
		"tiles/grass_infected",
		"tiles/shadow",
		"thorn",
		"shadows/60",
		"shadows/100",
		"shadows/120",
		"shadows/160",
		"shadows/200",
		"dust",
		"cloud",
		"point",
		"shine",
		"blue",
		"blue_doc",
		"blue_bird",
		"blue_bird_infected",
		"sick_blue",
		"blue_lock",
		"blue_trans",
		"blue_biologist",
		"red",
		"red_spawner",
		"red_giant",
		"red_hunter",
		"red_bird",
		"red_flower",
		//"red_goo",
		"tiles/thorn_tiles",
		"tiles/thorn_tiles_2",
		//"thorn_2",
		"red_spawner_flower",
		"box_blocker_flower",
		"transition",
		"shadow",
		"lamp",
		"lamp_light",
		"bookshelf",
		"door",
		"door_sky",
		"door_button",
		"settings_button",
		"blue_particle",
		"lab_shelf",
		"lab_table",
		"boss",
		"boss_piece",
		"last_enemy",
		"1up",
	),
	loaders.loadAudio(
		1,
		1,
		//sfx
		"boy_jump",
		"boy_land",
		"pickup_point",
		"level_cleared",
		"blue",
		"red0",
		"red1",
		"red2",
		"giant",
		"giant_land",
		"menu_hover",
		"menu_select",
		"blue_lock_dissappear",
		//music
		"the-beginning",
		"west-village",
		"east-village",
		"enemies-west",
		"enemies-east",
	),
	loaders.loadJSON(
		"boy_frames",
		"blue_frames",
		"blue_bird_frames",
		"sick_blue_frames",
		"blue_trans_frames",
		"red_frames",
		"red_bird_frames",
		"red_spawner_flower_frames",
		"red_giant_frames",
		"jumping_point_frames",
		"boss_frames",
		"grass_tiles",
	),
]).then(([ { c, ctx, width, height, pointer }, sprites, audio, JSON ]) => {

	document.getElementById("loading").style.display = "none";
	
	const GAME = {
		c,
		ctx,
		width,
		height,
		pointer,
		sprites,
		audio,
		JSON,
		levels,
		world: gameWorld(),
		states: {
			setupSettings,
			setupStartscreen,
			setupCredits,
		},
		state: undefined,
		context: vec(0, 0),
		currentLevel: 0,
		volume: 1,
		deaths: 0,
		progress: {},
		getProgress: progUtils.getProgress,
		saveProgress: progUtils.saveProgress,
	};

	GAME.state = GAME.states.setupStartscreen;

	GAME.audio.setVolume(0);

	//localStorage.currentLevel = GAME.currentLevel;
	
	const prog = GAME.getProgress();

	GAME.currentLevel = prog.currentLevel;
	GAME.deaths = prog.deaths;

	GAME.keys = keys(
		{
			tag: "w",
			code: 87,
		},
		{
			tag: "a",
			code: 65,
		},
		{
			tag: "d",
			code: 68,
		},
		{
			tag: "space",
			code: 32,
		},
		{
			tag: "r",
			code: 82,
		}
	);

	let musicHasStarted = false;

	GAME.states.setupLevel = () => {

		if(GAME.currentLevel === GAME.levels.length){
			GAME.state = GAME.states.setupCredits;
			return;
		}

		GAME.world.clearAll();
	
		//handle Level
		generateLevel(GAME.levels[GAME.currentLevel], GAME);

		GAME.world.add(button({
			pos: vec(GAME.width - 15 + 3, 3),
			size: vec(9, 9),
			img: "settings_button",
			action(GAME){
				GAME.state = GAME.states.setupSettings;
			}
		}), "buttons", 15);

		if(GAME.currentLevel === 0){
			GAME.world.add(helpers.boxText(vec(170, 50)), "text", 3);
			//GAME.world.add(helpers.boxHelper(vec(205, 50)), "particles", 1);
		}

		GAME.world.add(screenShaker(), "screenShaker", 0, true);

		GAME.levelCleared = false;

		//handle music
		if(!musicHasStarted && GAME.levels[GAME.currentLevel].music){
			musicHasStarted = true;
			GAME.audio.loop(GAME.levels[GAME.currentLevel].music, {
				type: "music",
			});
		}else if(GAME.currentLevel !== 0
		&& GAME.levels[GAME.currentLevel-1].music !== GAME.levels[GAME.currentLevel].music
		&& GAME.levels[GAME.currentLevel].music
		&& GAME.audio.loops[GAME.levels[GAME.currentLevel].music] === undefined){
			GAME.audio.loop(GAME.levels[GAME.currentLevel].music, {
				type: "music",
			});
		}

		//save progress
		GAME.progress.currentLevel = GAME.currentLevel;
		GAME.progress.deaths = GAME.deaths;
		GAME.saveProgress(GAME.progress);

		GAME.state = GAME.states.level;

	}

	if(!GAME.state) GAME.state = GAME.states.setupLevel;

	let restartCounter = 0;

	GAME.states.level = () => {


		if(GAME.keys.r.down) GAME.world.player.hit = true;

		if(GAME.keys.a.down)
			GAME.world.player.dir = -1;
		if(GAME.keys.d.down) 
			GAME.world.player.dir = 1;
		if(GAME.keys.a.down && GAME.keys.d.down || !GAME.keys.a.down && !GAME.keys.d.down)
			GAME.world.player.dir = 0;
		if(GAME.keys.w.down || GAME.keys.space.down){
			GAME.world.player.jump(GAME);
		}
		if(!GAME.keys.w.down && !GAME.keys.space.down) GAME.world.player.stopJump();

		GAME.world.update(GAME);

		if(GAME.world.player.hitCounter > 2){
			GAME.deaths++;
		}

		GAME.transitionPosX += 20;
		GAME.transitionFade -= 0.01;
		if(GAME.transitionFade < 0) GAME.transitionFade = 0;

		if(GAME.world.points.length <= 0){
			GAME.levelCleared = true;
		}

		//handleScreenShake
		//GAME.context = v.mul(GAME.context, 0.5);
		
	}

	let nextState;
	let transitionDelayCounter;
	GAME.states.transitionState = (GAME) => {
		GAME.transitionPosX += 20;
		GAME.context = vec(0, 0);
		if(GAME.transitionPosX === -20) GAME.state = GAME.states.transitionDelay;
	}

	GAME.states.transitionDelay = (GAME) => {
		transitionDelayCounter--;
		if(transitionDelayCounter <= 0){
			GAME.state = GAME.states[nextState];
			GAME.transitionPosX = -20;
		}
	}

	GAME.transitionState = (state, delay = 0) => {
		nextState = state;
		transitionDelayCounter = delay;
		GAME.transitionPosX = - 32 * 15 * 1.5;
		GAME.state = GAME.states.transitionState;
	}

	GAME.transitionFade = 0;

	GAME.states.fade = (GAME) => {
		GAME.transitionFade += 0.02;
		if(GAME.transitionFade > 1){
			GAME.transitionFade = 1;
			GAME.state = GAME.states[nextState];
		}
	}

	GAME.fadeToState = (state) => {
		nextState = state;
		GAME.transitionFade = 0;
		GAME.state = GAME.states.fade;
	}

	let delay;
	GAME.transitionToNextLevel = (GAME) => {
		delay = 5;
		GAME.currentLevel++;
		if(GAME.currentLevel === GAME.levels.length){
			delay = 60 * 3;
		}
		if(GAME.levels[GAME.currentLevel-1].music
		&& GAME.levels[GAME.currentLevel-1].music !== GAME.levels[GAME.currentLevel].music){
			GAME.audio.fadeOutLoop(GAME.levels[GAME.currentLevel-1].music, 0.005);
			delay = 180;
		}
		GAME.transitionState("setupLevel", delay);
	}

	//GAME.state = GAME.states.setupLevel;

	const timeScl = (1/60)*1000;
	let lastTime = 0;
	let accTime = 0;

	const loop = (time = 0) => {
		accTime += time - lastTime;
		lastTime = time;
		while(accTime > timeScl){
			GAME.state(GAME);

			GAME.keys.update();
			GAME.pointer.update();
			GAME.audio.updateLoops();

			accTime -= timeScl;
		}

		ctx.save();
		ctx.scale(c.scale, c.scale);
		ctx.translate(GAME.context.x, GAME.context.y);

		GAME.world.draw(ctx, GAME.sprites, GAME);

		//transition
		ctx.drawImage(GAME.sprites.transition, GAME.transitionPosX, 0, 32 * 15 * 1.5, 18 * 15);

		//fade
		ctx.globalAlpha = GAME.transitionFade;
		ctx.drawImage(GAME.sprites.transition, 1, 0, 32, 18, 0, 0, GAME.width, GAME.height);
		ctx.globalAlpha = 1;

		ctx.restore();

		requestAnimationFrame(loop);
	}
	
	loop();

});

/*
const loadingDots = document.createElement("h1");

document.getElementById("loading").appendChild(loadingDots);

let loaded = false;

const loadLoop = () => {
	loadingDots.innerHTML += ".";
	if(loadingDots.innerHTML.length > 3) loadingDots.innerHTML = ".";
	if(!loaded) setTimeout(loadLoop, 2000);
}

loadLoop();
*/

function storageAvailable(type) {
    try {
        const x = '__storage_test__';
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
