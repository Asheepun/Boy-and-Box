import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as loaders 	 		from "/js/lib/assets.js";
import createCanvas 	 		from "/js/lib/canvas.js";
import gameWorld 		 		from "/js/lib/gameWorld.js";
import keys						from "/js/lib/keys.js";
import generateLevel			from "/js/generateLevel.js";
import player					from "/js/player.js";

Promise.all([
	createCanvas(15 * 32, 15 * 18),
	loaders.loadSprites(
		"boy",
		"box",
		"background",
		"level_1/tiles",
		"dust",
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
	};

	GAME.keys = keys(
		"a",
		"d",
		"w",
		" ",
	);


	const level1 = [
		"................................",
		"................................",
		"................................",
		"................................",
		"..........................######",
		".........................#######",
		".........................#######",
		".............B...........#######",
		".........................#######",
		".........................#######",
		".1.................#############",
		"...............#################",
		"...............#################",
		"...............#################",
		"###...........##################",
		"###......#######################",
		"####...#########################",
		"################################",
	];

	const level2 = [
		"................................",
		"................................",
		"................................",
		"................................",
		".1..............................",
		"##...........B..................",
		"..............................2.",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
		"................................",
	];

	const levels = [level1, level2];
	GAME.currentLevel = 0;

	GAME.playerSpawn = vec(0, 145),


	GAME.states.setupLevel = () => {

		GAME.world.clearAll();

		GAME.world.add(player(GAME.playerSpawn), "player", 5, true);
	
		generateLevel(levels[GAME.currentLevel], GAME.world);

		GAME.state = GAME.states.level;

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

		ctx.save();
		ctx.scale(c.scale, c.scale);
		ctx.drawImage(GAME.sprites.background, 0, 0, GAME.width, GAME.height);
		//ctx.drawImage(GAME.sprites["level_1/tiles"], 0, 0, GAME.width, GAME.height);

		GAME.world.draw(ctx, GAME.sprites);

		ctx.restore();

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
