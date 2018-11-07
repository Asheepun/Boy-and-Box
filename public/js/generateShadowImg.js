import vec, * as v from "/js/lib/vector.js";

const generateShadowImg = (template, sprites) => {

	const img = document.createElement("canvas");
	const ctx = img.getContext("2d");
	img.width = 15 * 32;
	img.height = 15 * 18;

	ctx.globalAlpha = 0.8;
	ctx.fillStyle = "#171717";
	ctx.fillRect(0, 0, img.width, img.height);
	ctx.globalAlpha = 1;

	ctx.clearRect(0, 0, 13*15, 13*15);
	ctx.drawImage(sprites.shadow, 0, 0, 13*15, 13*15);

	return img;

}

const strEach = (str, func) => {
	for(let i = 0; i < str.length; i++){
		func(str[i], i);
	}
}

export default generateShadowImg;
