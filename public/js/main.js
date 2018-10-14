import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as text				from "/js/lib/text.js";
import * as loaders 	 		from "/js/lib/assets.js";
import createCanvas 	 		from "/js/lib/canvas.js";
import gameWorld 		 		from "/js/lib/gameWorld.js";
import keys						from "/js/lib/keys.js";
import generateLevel			from "/js/generateLevel.js";
import addClouds				from "/js/clouds.js";
import player					from "/js/player.js";
import blue						from "/js/blue.js";
import flower					from "/js/flower.js";
import * as helpers				from "/js/helpers.js";
import addBirds 				from "/js/bird.js";

Promise.all([
	createCanvas(15 * 32, 15 * 18),
	loaders.loadSprites(
		"boy",
		"box",
		"background",
		"level_1/tiles",
		"level_2/tiles",
		"dust",
		"cloud",
		"point",
		"shine",
		"blue",
		"blue_bird",
		"helper_bird",
		"flower_1",
	),
	loaders.loadAudio(
		1,
		"boy_jump",
		"bj2",
		"boy_land",
		"pickup_point",
		"level_cleared",
	),
	loaders.loadJSON(
		"grass_tiles",
		"boy_frames",
		"blue_bird_frames",
		"helper_bird_frames",
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
		world: gameWorld(),
		states: [
		
		],
		state: undefined,
		context: vec(0, 0),
		freeze: 0,
	};

	GAME.keys = keys(
		"a",
		"d",
		"w",
		" ",
	);

	const level1 = [
		"...............................O",
		"...............................O",
		"...........................P...0",
		"...............................O",
		"..............................##",
		".........................#######",
		".........................#######",
		".............B...........#######",
		".........................#######",
		".........................#######",
		".@.................#############",
		"...............#################",
		"...............#################",
		"##.............#################",
		"###...........##################",
		"###......#######################",
		"####...#########################",
		"################################",
	];

	const level2 = [
		"...............................O",
		"...............................O",
		"..............P................O",
		"@..............................0",
		"...............................O",
		"#...........#####.............##",
		"###.......#########....B....####",
		"###.......#########.........####",
		"##........#########.........####",
		"##.........########..........###",
		"##..........#######..........###",
		"###.........#####.............##",
		"###..........##...............##",
		"###...........................##",
		"####..........................##",
		"####.........................###",
		"######......###..............###",
		"#################...........####",
	];

	const level3 = [
		"..............................##",
		"...............................#",
		"...................P...........#",
		"@..............................#",
		"##............................##",
		"####.............#####......####",
		"####....B......#################",
		"####.........###################",
		"###...........#########....#####",
		"###.............#####........###",
		"##.............................O",
		"##.............................O",
		"##............................P0",
		"#..............................O",
		"#..............................O",
		"#........##...................##",
		"##......#####................###",
		"##......#####................###",
	]

	const levels = [level1, level2, level3];
	GAME.currentLevel = 0;
	GAME.tiles;

	GAME.states.setupLevel = () => {

		GAME.world.clearAll();
	
		generateLevel(levels[GAME.currentLevel], GAME.world);

		addClouds(GAME);
		
		addBirds(GAME);

		if(GAME.currentLevel === 0) GAME.world.add(helpers.boxText(vec(125, 50)), "text", 3);

		GAME.levelCleared = false;

		GAME.fade = 1;

		GAME.tiles = "level_" + (GAME.currentLevel + 1) + "/tiles";

		boxOriginPos = GAME.world.box.pos.copy();

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
		if(GAME.keys.w.down || GAME.keys[" "].down) GAME.world.player.jump(GAME);
		if(!GAME.keys.w.down && !GAME.keys[" "].down) GAME.world.player.stopJump();

		GAME.world.update(GAME);

		GAME.fade -= 0.02;
		if(GAME.fade < 0) GAME.fade = 0;

		if(GAME.world.points.length <= 0){
			if(!GAME.levelCleared) GAME.audio.play("level_cleared");
			GAME.levelCleared = true;
		}

		ctx.save();
		ctx.scale(c.scale, c.scale);
		ctx.translate(GAME.context.x, GAME.context.y);
		ctx.drawImage(GAME.sprites.background, 0, 0, GAME.width, GAME.height);

		GAME.world.draw(ctx, GAME.sprites);
		//ctx.drawImage(GAME.sprites[GAME.tiles], 0, 0, GAME.width, GAME.height);

		ctx.globalAlpha = GAME.fade;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, GAME.width, GAME.height);
		ctx.globalAlpha = 0.1;

		ctx.fillStyle = "black";
		//ctx.fillRect(0, 0, GAME.width, GAME.height);

		ctx.globalAlpha = 1;

		//handleScreenShake
		GAME.context = v.mul(GAME.context, 0.5);

		ctx.restore();

	}

	let afterFadeState;
	GAME.states.fadeOutState = () => {
		GAME.fade += 0.05;
		if(GAME.fade > 0.5) GAME.fade += 0.05;
		if(GAME.fade > 1){
			GAME.fade = 1;
			GAME.state = GAME.states[afterFadeState];
		}
		ctx.globalAlpha = GAME.fade;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, GAME.c.width, GAME.c.height);
		ctx.globalAlpha = 1;
	}

	GAME.fadeOut = (state) => {
		afterFadeState = state;
		GAME.state = GAME.states.fadeOutState;
	}

	GAME.state = GAME.states.setupLevel;

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

			accTime -= timeScl;
		}
		requestAnimationFrame(loop);
	}
	
	loop();

});
