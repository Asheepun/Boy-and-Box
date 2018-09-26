import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as loaders 	 		from "/js/lib/assets.js";
import createCanvas 	 		from "/js/lib/canvas.js";
import gameWorld 		 		from "/js/lib/gameWorld.js";
import keys						from "/js/lib/keys.js";
import generateLevel			from "/js/generateLevel.js";
import addClouds				from "/js/clouds.js";
import player					from "/js/player.js";
import blue						from "/js/blue.js";

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
	),
	loaders.loadJSON(
		"grass_tiles",
		"boy_frames",
	),
]).then(([ { c, ctx, width, height, pointer }, sprites, JSON ]) => {
	
	const GAME = {
		c,
		ctx,
		width,
		height,
		pointer,
		sprites,
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
		"...............................0",
		"...............................O",
		"..........................######",
		".........................#######",
		".........................#######",
		".............B.......P...#######",
		".........................#######",
		".........................#######",
		".@.................#############",
		"...............#################",
		"...............#################",
		"...............#################",
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
		"............#####..............O",
		"###.......#########.....B.....##",
		"###.......#########...........##",
		"##........#########...........##",
		"##.........########...........##",
		"##..........#######..........###",
		"###.........#####............###",
		"###..........##..............###",
		"###..........................###",
		"####.........................###",
		"####.........................###",
		"######......###.............####",
		"#################...........####",
	];

	const levels = [level1, level2];
	GAME.currentLevel = 0;
	GAME.tiles;

	GAME.states.setupLevel = () => {

		GAME.world.clearAll();
	
		generateLevel(levels[GAME.currentLevel], GAME.world);

		addClouds(GAME);

		GAME.world.add(blue(vec(150, 100)), "blues", 2);

		GAME.levelCleared = false;

		GAME.fade = 1;

		GAME.state = GAME.states.level;

		GAME.tiles = "level_" + (GAME.currentLevel + 1) + "/tiles";

	}

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

		if(GAME.world.points.length <= 0) GAME.levelCleared = true;

		ctx.save();
		ctx.scale(c.scale, c.scale);
		ctx.translate(GAME.context.x, GAME.context.y);
		ctx.drawImage(GAME.sprites.background, 0, 0, GAME.width, GAME.height);

		GAME.world.draw(ctx, GAME.sprites);
		ctx.drawImage(GAME.sprites[GAME.tiles], 0, 0, GAME.width, GAME.height);
		ctx.globalAlpha = GAME.fade;
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, GAME.width, GAME.height);
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
