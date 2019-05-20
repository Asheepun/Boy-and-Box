import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";

const dynamicShadow = () => {
	const that = traitHolder();

	that.img = document.createElement("canvas");
	that.ctx = that.img.getContext("2d");
	that.img.width = 32 * 15;
	that.img.height = 18 * 15;

	that.updateImg = ({ world: { player, points, reds, shine, door_buttons, boss }, sprites }) => {

		that.ctx.clearRect(0, 0, that.img.width, that.img.height);
		
		that.ctx.globalAlpha = 0.3;
		that.ctx.globalCompositeOperation = "source-over";

		that.ctx.drawImage(sprites["tiles/shadow"], 0, 0, that.img.width, that.img.height);

		that.ctx.globalCompositeOperation = "destination-out";
		that.ctx.globalAlpha = 1;

		that.ctx.drawImage(sprites["shadows/120"], Math.floor(player.center.x - 60), Math.floor(player.center.y - 60), 120, 120);

		points.forEach(p => {
			that.ctx.drawImage(sprites["shadows/60"], Math.floor(p.center.x - 30), Math.floor(p.center.y - 30), 60, 60);
		})

		if(reds) reds.forEach(r => {
			that.ctx.drawImage(sprites["shadows/100"], Math.floor(r.center.x - 50), Math.floor(r.center.y - 50), 100, 100);
		});

		if(points.length === 0)
			that.ctx.drawImage(sprites["shadows/100"], shine[0].center.x - 50, Math.floor(shine.reduce((x, s) => s.center.y + x, 0) / shine.length - 50), 100, 100);
		if(boss && door_buttons){
			//that.ctx.drawImage(sprites["shadows/60"], Math.floor(door_buttons[0].center.x - 30), Math.floor(door_buttons[0].center.y - 30));
		}
		/*
		if(points.length === 0) shine.forEach(s => {
			that.ctx.fillRect(s.center.x - 30, s.center.y - 30, 60, 60);
		});
		*/
	}

	that.draw = (ctx) => {
		ctx.drawImage(that.img, 0, 0, that.img.width, that.img.height);
	}

	that.addMethods("updateImg");

	return that;
}

export default dynamicShadow;
