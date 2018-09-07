export const defaultText = ({ text, color, font, fontSize, x, y, ctx }) => {
	ctx.fillStyle = color;
	ctx.font = fontSize + "px " + font;
	ctx.fillText(text, x, y);
}

export const white = (text, x, y, fontSize, ctx) => defaultText({
	text,
	x,
	y,
	fontSize,
	ctx,
	color: "white",
	font: "game",
});

export const grey = (text, x, y, fontSize, ctx) => defaultText({
	text,
	x,
	y,
	fontSize,
	ctx,
	color: "grey",
	font: "game",
});

export const white5 = (text, x, y, ctx) => white(text, x, y, 5, ctx);

export const white10 = (text, x, y, ctx) => white(text, x, y, 10, ctx);

export const white15 = (text, x, y, ctx) => white(text, x, y, 15, ctx);

export const white20 = (text, x, y, ctx) => white(text, x, y, 20, ctx);

export const white40 = (text, x, y, ctx) => white(text, x, y, 40, ctx);

export const grey10 = (text, x, y, ctx) => grey(text, x, y, 10, ctx);

export const grey15 = (text, x, y, ctx) => grey(text, x, y, 15, ctx);

export const grey20 = (text, x, y, ctx) => grey(text, x, y, 20, ctx);

export const grey40 = (text, x, y, ctx) => grey(text, x, y, 40, ctx);
