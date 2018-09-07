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
	&& entity.pos.y + entity.size.y < platform.pos.y + platform.size.y
	&& entity.pos.x + entity.size.x > platform.pos.x
	&& entity.pos.x < platform.pos.x + platform.size.x

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
		&& vec.x <= obstacles[i].pos.x + obstacles[i].size.x
		&& vec.y >= obstacles[i].pos.y
		&& vec.y <= obstacles[i].pos.y + obstacles[i].size.y)
			return obstacles[i];
	}
	return false;
}
