import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as text				from "/js/lib/text.js";
import { tiles, obstacle }		from "/js/generateLevel.js";
import box						from "/js/box.js";
import player					from "/js/player.js";
import point					from "/js/points.js";

const setupCredits = (GAME) => {

	GAME.world.clearAll();

	GAME.world.add(tiles(GAME.sprites["tiles/shadow"], "shadow"), "tiles", 1);

	GAME.world.add(player(vec(135, 120)), "player", 20, true);
	GAME.world.add(box(vec(135, 180)), "box", 19, true);
	GAME.world.add(obstacle(vec(-100, -100)), "obstacles", 0, true);
	GAME.world.add(obstacle(vec(-100, -100)), "buttons", 0, true);
	GAME.world.add(point(vec(-100, -100)), "points", 0);

	const velocity = vec(0, -0.2);

	const originY = GAME.height + 80

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY),
		velocity,
		size: 20,
		text: [
			"You won!",
		]
	}), "texts", 10);
	let deathText = [
		"And you only died " + GAME.deaths + " times!",
	];

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 30),
		velocity,
		size: 10,
		text: deathText,
	}), "texts", 10);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 230),
		velocity,
		size: 20,
		text: [
			"Credits"
		]
	}), "texts", 10);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 310),
		velocity,
		size: 10,
		text: [
			"Art, programming and music - Gustav Almstrom",
			"",
			"Sound effects - Fridolf Tofft Glans",
			"",
			"Best playtester - Norton Ehrnborn",
		]
	}), "texts", 10);

	/*
	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 450),
		velocity,
		size: 20,
		text: [
			"Tools",
		],
	}), "texts", 10);
	*/

	GAME.state = credits;
}

let bla = false;
const credits = (GAME) => {

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

	GAME.levelCleared = false;

	GAME.world.update(GAME);

	if(GAME.world.player.hitCounter > 2){
		GAME.deaths++;
	}

	if(bla) GAME.transitionPosX += 20;
	bla = true;
}

export default setupCredits;
