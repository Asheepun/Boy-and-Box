import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as text				from "/js/lib/text.js";
import * as loaders 	 		from "/js/lib/assets.js";
import createCanvas 	 		from "/js/lib/canvas.js";
import gameWorld 		 		from "/js/lib/gameWorld.js";
import keys						from "/js/lib/keys.js";
import button					from "/js/lib/button.js";
import generateLevel			from "/js/generateLevel.js";
import addClouds				from "/js/clouds.js";
import player					from "/js/player.js";
import * as helpers				from "/js/helpers.js";
import addBirds 				from "/js/bird.js";
import levels					from "/js/levels.js";
import setupSettings			from "/js/settings.js";

Promise.all([
	createCanvas(15 * 32, 15 * 18),
	loaders.loadSprites(
		"boy",
		"boy_hit",
		"box",
		"backgrounds/sky",
		"backgrounds/planks",
		"tiles/grass_tiles",
		"tiles/grass_wall_tiles",
		"tiles/plank_tiles",
		"tiles/grass",
		"tiles/shadow",
		"dust",
		"cloud",
		"point",
		"shine",
		"blue",
		"blue_doc",
		"blue_bird",
		"sick_blue",
		"blue_lock",
		"blue_trans",
		"red",
		"red_spawner",
		"red_flower",
		"red_spawner_flower",
		"red_giant",
		"transition",
		"shadow",
		"lamp",
		"lamp_light",
		"bookshelf",
		"settings_button",
	),
	loaders.loadAudio(
		1,
		"boy_jump1",
		"boy_jump2",
		"boy_land",
		"pickup_point",
		"level_cleared",
		"the-beginning",
		"east-village",
		"enemies",
	),
	loaders.loadJSON(
		"boy_frames",
		"blue_frames",
		"blue_bird_frames",
		"sick_blue_frames",
		"blue_trans_frames",
		"red_frames",
		"red_spawner_flower_frames",
		"red_giant_frames",
		"grass_tiles",
	),
]).then(([ { c, ctx, width, height, pointer }, sprites, audio, JSON ]) => {
	
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
		},
		state: undefined,
		context: vec(0, 0),
		currentLevel: 0,
		volume: 1,
		saveProgress: true,
	};

	//if(GAME.saveProgress && localStorage.currentLevel)
		//GAME.currentLevel = localStorage.currentLevel;
	
	//start music
	if(GAME.levels[GAME.currentLevel].music)
		GAME.audio.loop(GAME.levels[GAME.currentLevel].music, {});

	GAME.keys = keys(
		"a",
		"d",
		"w",
		" ",
	);

	GAME.states.setupLevel = () => {

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

		if(GAME.currentLevel === 0) GAME.world.add(helpers.boxText(vec(170, 50)), "text", 3);

		GAME.levelCleared = false;

		boxOriginPos = GAME.world.box.pos.copy();

		//handle music
		if(GAME.levels[GAME.currentLevel-1].music !== GAME.levels[GAME.currentLevel].music){
			if(GAME.levels[GAME.currentLevel-1].music)
				GAME.audio.stopLoop(GAME.levels[GAME.currentLevel-1].music);

			if(GAME.levels[GAME.currentLevel].music)
				GAME.audio.loop(GAME.levels[GAME.currentLevel].music, {});
		}

		GAME.state = GAME.states.level;

	}

	let boxTextFade = 0;
	let fadeInText = false;
	let boxOriginPos;

	GAME.states.level = () => {

		if(GAME.keys.a.down)
			GAME.world.player.dir = -1;
		if(GAME.keys.d.down) 
			GAME.world.player.dir = 1;
		if(GAME.keys.a.down && GAME.keys.d.down || !GAME.keys.a.down && !GAME.keys.d.down)
			GAME.world.player.dir = 0;
		if(GAME.keys.w.down || GAME.keys[" "].down){
			GAME.world.player.jump(GAME);
		}
		if(!GAME.keys.w.down && !GAME.keys[" "].down) GAME.world.player.stopJump();

		GAME.world.update(GAME);

		GAME.transitionPosX += 20;

		if(GAME.world.points.length <= 0){
			if(!GAME.levelCleared) GAME.audio.play("level_cleared", {
				volume: 0.5,
			});
			GAME.levelCleared = true;
		}

		//handleScreenShake
		GAME.context = v.mul(GAME.context, 0.5);
		
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
			GAME.transitionPosX = 0;
		}
	}

	GAME.transitionState = (state, delay = 0) => {
		nextState = state;
		transitionDelayCounter = delay;
		GAME.transitionPosX = - 32 * 15 * 1.5;
		GAME.state = GAME.states.transitionState;
	}

	GAME.transitionToNextLevel = (GAME) => {
		GAME.currentLevel++;
		if(GAME.saveProgress)
			localStorage.currentLevel = GAME.currentLevel;
		GAME.transitionState("setupLevel", 5);
	}

	GAME.state = GAME.states.setupLevel;

	const timeScl = (1/60)*1000;
	let lastTime = 0;
	let accTime = 0;

	let firstLevelFade = 1;

	const loop = (time = 0) => {
		accTime += time - lastTime;
		lastTime = time;
		while(accTime > timeScl){
			GAME.state(GAME);

			GAME.keys.update();
			GAME.pointer.update();

			accTime -= timeScl;
		}

		ctx.save();
		ctx.scale(c.scale, c.scale);
		ctx.translate(GAME.context.x, GAME.context.y);

		GAME.world.draw(ctx, GAME.sprites, GAME);

		ctx.drawImage(GAME.sprites.transition, GAME.transitionPosX, 0, 32 * 15 * 1.5, 18 * 15);

		if(firstLevelFade > 0){
			ctx.globalAlpha = firstLevelFade;
			ctx.drawImage(GAME.sprites.transition, 0, 0, 1, 1, 0, 0, GAME.c.width, GAME.c.height);
			firstLevelFade -= 0.015;
			ctx.globalAlpha = 1;
		}

		ctx.restore();

		requestAnimationFrame(loop);
	}
	
	loop();

});
