import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const shadow = () => {
	const that = traitHolder();

	that.img = document.createElement("canvas");
	that.ctx = that.img.getContext("2d");
	that.ctx.fillStyle = "#171717";

	that.updateImg = ({ world: { player, lamps }, width, height }) => {
		that.img.width = width;
		that.img.height = height;
		that.ctx.fillRect(0, 0, width, height);

		//that.ctx.beginPath();
		//that.ctx.arc(player.center.x, player.center.y, 50, 0, 2 * Math.PI);
		//that.ctx.clip();
		//that.ctx.clearRect(0, 0, width, height);

		lamps.forEach((lamp) => {
			that.ctx.beginPath();
			that.ctx.arc(lamp.center.x, lamp.center.y, 50, 0, 2 * Math.PI);
			that.ctx.clip();
			that.ctx.clearRect(lamp.center.x - 25, lamp.center.y - 25, 50, 50);
		});

	}

	that.draw = (ctx, sprites, GAME) => {
		ctx.globalAlpha = 0;
		ctx.drawImage(that.img, 0, 0, GAME.width, GAME.height);
		ctx.globalAlpha = 1;
	}

	that.addMethods("updateImg");

	return that;
}

export default shadow;
