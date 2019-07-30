import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as text				from "/js/lib/text.js";
import { tiles, obstacle }		from "/js/generateLevel.js";
import box						from "/js/box.js";
import player					from "/js/player.js";
import point					from "/js/points.js";

const setupCredits = (GAME) => {

	GAME.progress.deaths = GAME.deaths;
	GAME.progress.currentLevel = GAME.currentLevel;
	GAME.saveProgress(GAME.progress);

	GAME.world.clearAll();

	GAME.world.add(tiles(GAME.sprites["tiles/shadow"], "shadow"), "tiles", 1);

	GAME.world.add(player(vec(135, 120)), "player", 20, true);
	GAME.world.add(box(vec(135, 180)), "box", 19, true);
	GAME.world.add(obstacle(vec(-100, -100)), "obstacles", 0);
	GAME.world.add(obstacle(vec(-100, -100)), "buttons", 0);
	GAME.world.add(point(vec(-100, -100)), "points", 0);

	const velocity = vec(0, -0.2);

	const originY = GAME.height + 80

	const up = false;

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY),
		velocity,
		size: 20,
		text: [
			"You won!",
		],
		up,
	}), "texts", 10);
	let deathText = [
		"And you only died " + GAME.deaths + " times!",
	];

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 30),
		velocity,
		size: 10,
		text: deathText,
		up,
	}), "texts", 10);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 230),
		velocity,
		size: 20,
		text: [
			"Credits"
		],
		up,
	}), "texts", 10);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 260),
		velocity,
		size: 10,
		text: [
			"Art, programming and music - Gustav Almstrom",
			"",
			"Sound effects - Fridolf Tofft Glans",
			"",
			"Best playtester - Norton Ehrnborn",
		],
		up,
	}), "texts", 10);

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 460),
		velocity: velocity.copy(),
		size: 15,
		text: [
			"Thank you for playing!",
		],
		up,
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
	GAME.creditsOps = {
		bla: false,
		lastText: undefined,
		menuCounter: 60 * 7.5,
	};
}

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

	GAME.creditsOps.lastText = GAME.world.texts[GAME.world.texts.length - 1];
	if(GAME.creditsOps.lastText.pos.y < GAME.height / 2){
		GAME.creditsOps.lastText.velocity.y *= 0.97;
		GAME.creditsOps.menuCounter--;
	}

	GAME.world.update(GAME);

	if(GAME.world.player.dead){
		GAME.deaths++;
		GAME.transitionState("setupLevel");

	}
	if(GAME.creditsOps.menuCounter === 0){
		GAME.world.clearAll();
		GAME.fadeToState("setupStartscreen")
	}

	if(GAME.creditsOps.bla) GAME.transitionPosX += 20;
	GAME.creditsOps.bla = true;

	GAME.transitionFade -= 0.01;
	if(GAME.transitionFade < 0) GAME.transitionFade = 0;
}

export default setupCredits;
