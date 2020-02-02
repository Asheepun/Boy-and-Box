import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";
import * as text				from "/js/lib/text.js";
import { tiles, obstacle }		from "/js/generateLevel.js";
import box						from "/js/box.js";
import player					from "/js/player.js";
import point					from "/js/points.js";

let playedSong = false;

const endMessageDiv = document.createElement("div");
endMessageDiv.style.opacity = 0;

const setupCredits = (GAME) => {

	GAME.world.clearAll();

	/*
	if(!playedSong){
		GAME.audio.play("credits", {
			volume: 2,
			type: "music",
		});
	}

	playedSong = true;

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

	GAME.world.add(traits.textEntity({
		pos: vec(GAME.width / 2, originY + 450),
		velocity,
		size: 20,
		text: [
			"Tools",
		],
	}), "texts", 10);

	GAME.creditsOps = {
		bla: false,
		lastText: undefined,
		menuCounter: 60 * 11,//7.5,
	};
	*/
	GAME.state = credits;

	//GAME.audio.play("enemies-west", {
		//type: "music",
	//});

	const header = document.createElement("h2");
	const getNow = document.createElement("h2");
	const capsule = document.createElement("div")
	capsule.innerHTML = '<iframe src="https://store.steampowered.com/widget/1232830/?t=Coming%20soon!" frameborder="0" width="646" height="190"></iframe>';
	//capsule.innerHTML = '<iframe src="https://store.steampowered.com/widget/1232830/?t=Coming%20soon!" frameborder="0" width="1vw" height="1vw"></iframe>';
	header.innerHTML = "Thank you for playing the demo for BoyandBox!";
	header.style.color = "white";
	header.style.fontSize = "3vw";
	endMessageDiv.appendChild(header);

	getNow.style.color = "white";
	getNow.style.fontSize = "3vw";
	getNow.innerHTML = "Check out the full game on Steam!";
	endMessageDiv.appendChild(getNow);

	const scrt2 = document.createElement("img");
	scrt2.src = "/scrt2.png";

	endMessageDiv.appendChild(scrt2);

	const scrt1 = document.createElement("img");
	scrt1.src = "/scrt1.png";

	endMessageDiv.appendChild(scrt1);

	const scrt0 = document.createElement("img");
	scrt0.src = "/scrt0.png";

	endMessageDiv.appendChild(scrt0);

	endMessageDiv.appendChild(capsule);

	document.body.removeChild(GAME.c);

	document.body.appendChild(endMessageDiv)

	document.body.style.backgroundColor = "#171717";

}

let endOpacity = 0;

const credits = (GAME) => {

	endOpacity += 0.01;

	endMessageDiv.style.opacity = endOpacity;


	/*
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
	*/
}

export default setupCredits;
