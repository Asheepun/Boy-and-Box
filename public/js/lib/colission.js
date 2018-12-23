import vec, * as v from "/js/lib/vector.js";

export const checkCol = (entity, candidate) => 
    entity.pos.x + entity.size.x > candidate.pos.x
    && entity.pos.x < candidate.pos.x + candidate.size.x
    && entity.pos.y + entity.size.y > candidate.pos.y
    && entity.pos.y < candidate.pos.y + candidate.size.y;

export const checkSetCol = (entity, set) => {
    for(let i = 0; i < set.length; i++){
        if(checkCol(entity, set[i]) && entity !== set[i])
            return set[i];
    }
    return false;
}

export const checkPlatformCol = (entity, platform) => 
	entity.pos.y + entity.size.y > platform.pos.y
	&& entity.pos.y + entity.size.y <= platform.pos.y + platform.size.y
	&& entity.pos.x + entity.size.x >= platform.pos.x
	&& entity.pos.x <= platform.pos.x + platform.size.x

export const checkPlatformSetCol = (entity, set) => {
	for(let i = 0; i < set.length; i++){
		if(checkPlatformCol(entity, set[i]) && entity !== set[i])
			return set[i];
	}
	return false;
}

export const checkOub = (entity, oubArea) => 
    entity.pos.x < oubArea[0]
    || entity.pos.x + entity.size.x > oubArea[0] + oubArea[2]
    || entity.pos.y < oubArea[1]
    || entity.pos.y + entity.size.y > oubArea[1] + oubArea[3]

let pos;
let dist;
let counter = 0;

export const checkLOS = (entity, target, obstacles) => {
    pos = entity.center.copy();

    dist = v.sub(pos, target).mag/20;
    counter = 0;

    while(counter <= dist){
        pos.add(v.pipe(
            v.sub(pos, target),
            v.normalize,
            v.reverse,
            x => v.mul(x, 20),
        ));
        
        for(let i = 0; i < obstacles.length; i++){
            if(v.sub(obstacles[i].center, pos).mag < 30) return false;
        }

        counter++;
    }

    return true;
}

export const checkPointCol = (vec, obstacles) => {
	for(let i = 0; i < obstacles.length; i++){
		if(vec.x >= obstacles[i].pos.x
		&& vec.x < obstacles[i].pos.x + obstacles[i].size.x
		&& vec.y >= obstacles[i].pos.y
		&& vec.y < obstacles[i].pos.y + obstacles[i].size.y)
			return obstacles[i];
	}
	return false;
}

let difX = 0;
let difY = 0;
const c = document.createElement("canvas");
const ctx = c.getContext("2d");

let entityImgPosX, entityImgPosY, candidateImgPosX, candidateImgPosY;

let imgData;

export const checkPixelCol = (entity, candidate, sprites) => {
	if(checkCol(entity, candidate)){

		if(entity.pos.x > candidate.pos.x){
			difX = Math.floor((candidate.pos.x + candidate.size.x) - entity.pos.x);
			entityImgPosX = 0;
			candidateImgPosX = candidate.size.x - difX;
		}
		else {
			difX = Math.floor((entity.pos.x + entity.size.x) - candidate.pos.x);
			entityImgPosX = entity.size.x - difX;
			candidateImgPosX = 0;
		}
		
		if(entity.pos.y > candidate.pos.y){
			difY = Math.floor((candidate.pos.y + candidate.size.y) - entity.pos.y);
			entityImgPosY = 0;
			candidateImgPosY = candidate.size.y - difY;
		}
		else{
			difY = Math.floor((entity.pos.y + entity.size.y) - candidate.pos.y);
			entityImgPosY = entity.size.y - difY;
			candidateImgPosY = 0;
		}

		if(difX === 0 || difY === 0) return false;

		c.width = difX * 50;
		c.height = difY * 50;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;    
		ctx.imageSmoothingEnabled = false;
		ctx.globalAlpha = 0.5;
		ctx.scale(50, 50);
		ctx.drawImage(sprites[entity.img], entity.imgPos.x + entityImgPosX, entity.imgPos.y + entityImgPosY, difX, difY, 0, 0, difX, difY);
		ctx.drawImage(sprites[candidate.img], candidate.imgPos.x + candidateImgPosX, candidate.imgPos.y + candidateImgPosY, difX, difY, 0, 0, difX, difY);

		imgData = ctx.getImageData(0, 0, c.width, c.height).data;

		for(let i = 0; i < imgData.length / 4; i++){
			if(imgData[i * 4 + 3] === 192){
				return true;
			}
		}

		return false;

	}else return false;
}
