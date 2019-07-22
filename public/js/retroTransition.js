import vec, * as v 		 		from "/js/lib/vector.js";
import traitHolder, * as traits from "/js/lib/traits.js";

const setupRetroTransition = (GAME) => {
	GAME.world.clearAll();

	GAME.world.add(retroTransitionSprite(), "particles", 20);

	counter = 0;

	GAME.state = retroTransition
}

let counter = 0;

const retroTransition = (GAME) => {

	counter++;

	if(counter === 60 * 5){
		GAME.transitionState("setupLevel");
		return;
	}

	GAME.world.update(GAME);

	GAME.transitionPosX += 2;
	GAME.transitionFade -= 0.01;
	if(GAME.transitionFade < 0) GAME.transitionFade = 0;
}

const retroTransitionSprite = () => {
	const that = traitHolder();

	that.draw = (ctx, sprites, GAME) => {

		ctx.save();
		ctx.drawImage(sprites.transition, -20, 0, GAME.width, GAME.height);

		ctx.drawImage(sprites.boy,
			0, 0, 12, 15,
			GAME.width / 2 - 27, GAME.height / 2 - 15, 12, 15
		);
		ctx.fillStyle = "white";
		ctx.font = "16px game";

		ctx.fillText("x", GAME.width / 2-2, GAME.height / 2 - 2);

		ctx.fillText(GAME.lives, GAME.width / 2 + 18, GAME.height / 2 - 1)

		ctx.font = "8px game";

		ctx.textAlign = "center";

		let sorryText = "I'm sorry...";
		if(GAME.lives === 2) sorryText = "Who are you?";
		if(GAME.lives === 1) sorryText = "My experiments...";

		ctx.fillText(sorryText, GAME.width / 2 + 2, GAME.height / 2 + 60);

		ctx.restore();
	
	}

	return that;
}

export default setupRetroTransition;
