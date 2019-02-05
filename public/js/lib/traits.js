import vec, * as v                         						from "/js/lib/vector.js";
import { checkCol, checkSetCol, checkOub, checkPlatformSetCol } from "/js/lib/colission.js";

const traitHolder = (startSpecs = {}) => {
    const that = startSpecs;
    that.methods = [];

    that.update = (GAME) => {
        that.methods.forEach(method => {
            that[method](GAME);
        });
    }

    that.addMethods = (...methods) => {
        methods.forEach(method => that.methods.push(method));
    }

    that.removeMethods = (...methods) => {
        methods.forEach(method => that.methods.splice(that.methods.indexOf(method), 1));
    }

    return that;
}

export default traitHolder;

export const addOubTrait = ({ oubArea = [0, 0, 900, 600], bounce = false }) => (that) => {
	that.onOubDown = () => {};
	that.onOubUp = () => {};
	that.onOubLeft = () => {};
	that.onOubRight = () => {};
    that.oubArea = oubArea;
	that.oubBounce = bounce;

    that.handleOubX = () => {
        if(that.velocity.x > 0){
            that.pos.x = that.oubArea[0] + that.oubArea[2] - that.size.x;
			that.onOubRight();
		}else{
			that.pos.x = that.oubArea[0];
			that.onOubLeft();
		}
        if(that.oubBounce) that.velocity.x *= -1;
		else{
			if(that.acceleration) that.acceleration.x = 0;
			that.velocity.x = 0;
		}
    }
    that.handleOubY = () => {
        if(that.velocity.y > 0){
            that.onGround = true;
            that.pos.y = oubArea[1] + oubArea[3] - that.size.y;
			that.onOubDown();
        }else{
			that.onRoof = true;
            that.pos.y = oubArea[1];
			that.onOubUp();
		}
        if(bounce) that.velocity.y *= -1;
		else{
			that.velocity.y = 0;
			if(that.acceleration) that.acceleration.y = 0;
		}
    }
    that.checkOub = () => checkOub(that, that.oubArea);
}

export const addColTrait = ({ bounce = false, }) => (that) => {
	that.onColDown = () => {};
	that.onColUp = () => {};
	that.onColLeft = () => {};
	that.onColRight = () => {};
	that.colBounce = bounce;
	that.handleColX = (obstacle) => {	
		if(that.velocity.x > 0){
			that.pos.x = obstacle.pos.x - that.size.x;
			that.onRightWall = true;
			that.onColRight();
		}
		else{
			that.pos.x = obstacle.pos.x + obstacle.size.x;
			that.onLeftWall = true;
			that.onColLeft();
		}
		if(that.colBounce) that.velocity.x *= -1;
		else{
			that.velocity.x = 0;
			if(that.acceleration) that.acceleration.x = 0;
		}
    }
    that.handleColY = (obstacle) => {
		if(that.velocity.y > 0){
			that.onGround = true;
			that.pos.y = obstacle.pos.y - that.size.y;
			that.onColDown();
		}else{
			that.onRoof = true;
			that.pos.y = obstacle.pos.y + obstacle.size.y;
			that.onColUp();
		}
		if(that.colBounce) that.velocity.y *= -1;
		else{
			that.velocity.y = 0;
			if(that.acceleration) that.acceleration.y = 0;
		} 
    }
}

export const addBoxColTrait = ({ bounce = false }) => (that) => {
	that.onBoxCol = () => {};
	that.handleBoxCol = ({ world: { box } }) => {
		if(that.pos.x + that.size.x >= box.pos.x
		&& that.pos.x <= box.pos.x + box.size.x
		&& that.pos.y + that.size.y >= box.pos.y
		&& that.pos.y + that.size.y <= box.pos.y + that.velocity.y + 3
		&& that.velocity.y >= 0){
			that.pos.y = box.pos.y - that.size.y;
			that.fixCenter();
			that.onGround = true;
			that.onBoxCol();
			if(bounce) that.velocity.y *= -1;
			else {
				that.velocity.y = 0;
				if(that.acceleration) that.acceleration.y = 0;
			}
		}
	}

	that.addMethods("handleBoxCol");
}

export const addCheckColTrait = ({ sets = [], singles = [] }) => (that) => {
	that.checkCol = (GAME) => {
		sets.forEach(set => {
			if(GAME.world[set]) GAME.world[set].forEach((entity) => {
				if(checkCol(that, entity)) that[set + "Col"](entity, GAME);
			}
		)});
		singles.forEach((single) => {
			if(single && checkCol(that, GAME.world[single])) that[single + "Col"](GAME.world[single], GAME);
		})
	}

	that.addMethods("checkCol");
}

export const addLandingTrait = ({ velocity = 0 }) => (that) => {
	that.requiredLandVelocity = velocity;
	that.lastFallVelocity;
	that.landed = false;
	that.checkLanding = (GAME) => {
		if(that.onGround && !that.landed && that.lastFallVelocity >= that.requiredLandVelocity){
			that.landed = true;
			that.land(GAME);
		}
		if(!that.onGround){
			that.landed = false;
			that.lastFallVelocity = that.velocity.y;
		}
	}

	that.addMethods("checkLanding")
}

export const addEntityTrait = ({ pos, size, hitBox, hitBoxOffset = vec(0, 0) }) => (that) => {
    that.pos = pos;
    that.size = size;
	that.originSize = size;
	if(hitBox) that.hitBox = hitBox;
	else that.hitBox = that.size.copy();
	that.hitBoxOffset = hitBoxOffset;

    that.fixCenter = () => {
        that.center = v.add(that.pos, v.half(that.size));
    }

    that.fixCenter();

    that.addMethods("fixCenter");
}

export const addMoveTrait = ({ velocity = vec(0, 0), canMove = true, obstacleTypes = ["obstacles"] }) => (that) => {
	that.velocity = velocity;
    that.canMove = canMove;
    that.onGround = false;
    that.onLeftWall = false;
    that.onRightWall = false;
	that.onRoof = false;
    let oub = false;
    let col = false;
	let platCol = false;

	let count = 0;
    that.move = (GAME) => {

		that.onRoof = false;
		that.onGround = false;
		that.onLeftWall = false;
		that.onRightWall = false;

        col = false;
        oub = false;

        that.pos.y += that.velocity.y;
        if(that.handleOubY) oub = that.checkOub();
        if(oub) that.handleOubY(GAME);
        if(that.handleColY){
            obstacleTypes.forEach(obstacleType => {
                if(!col && GAME.world[obstacleType]) col = checkSetCol(that, GAME.world[obstacleType]);
            });
            if(col) that.handleColY(col, GAME);
        }

        col = false;
        oub = false;

        that.pos.x += that.velocity.x;
        if(that.handleOubX) oub = that.checkOub();
        if(oub) that.handleOubX(GAME);
        if(that.handleColX){
            obstacleTypes.forEach(obstacleType => {
                if(!col && GAME.world[obstacleType]) col = checkSetCol(that, GAME.world[obstacleType]);
            });
            if(col) that.handleColX(col, GAME);

        }

        that.fixCenter();
    }

    that.handleMove = (GAME) => {
        if(that.canMove) that.move(GAME);
    }

    that.addMethods("handleMove");
}

export const addPhysicsTrait = ({ acceleration = vec(0, 0), resistance = 1, gravity = 0 }) => (that) =>  {
	that.acceleration = acceleration;
	that.resistance = resistance;
	that.gravity = gravity;
	
	that.handlePhysics = () => {
		if(that.canMove){
			that.acceleration.y += that.gravity;
			that.velocity = v.add(that.velocity, that.acceleration);
			that.velocity = v.mul(that.velocity, that.resistance);
		}
	}
	
	that.addMethods("handlePhysics");
}

export const addSpriteTrait = ({ color, img, alpha = 1, rotation = 0, visible = true, imgPos = vec(0, 0), imgSize, drawOffset = vec(0, 0), drawSize }) => (that) => {
    that.color = color;
    that.img = img;
    that.alpha = alpha;
    that.rotation = rotation;
    that.visible = visible;
    that.imgPos = imgPos;
    that.imgSize = imgSize;
	if(drawSize) that.drawSize = drawSize;
	else that.drawSize = that.size.copy();
	that.drawOffset = drawOffset
	if(!imgSize) that.imgSize = that.size.copy();
	that.facing = vec(1, 1);

    that.draw = (ctx, sprites) => {
        if(that.visible){
            ctx.save();
            ctx.translate(Math.round(that.center.x), Math.round(that.center.y));
            ctx.rotate(that.rotation);
            ctx.globalAlpha = that.alpha;
            ctx.fillStyle = that.color;
            if(that.color) ctx.fillRect((-that.size.x/2), (-that.size.y/2), that.size.x, that.size.y);
            if(that.img){
				ctx.scale(that.facing.x, that.facing.y);
				ctx.drawImage(
					sprites[that.img],
					that.imgPos.x, that.imgPos.y, that.imgSize.x, that.imgSize.y,
					Math.floor(-that.size.x/2), Math.floor(-that.size.y/2), that.size.x, that.size.y
				);
			}
            ctx.globalApha = 1;
            ctx.restore();
			/*
			if(that.hitBox.x !== that.originSize.x){
				ctx.fillStyle = "blue";
				ctx.fillRect(that.pos.x + that.hitBoxOffset.x, that.pos.y + that.hitBoxOffset.y, that.hitBox.x, that.hitBox.y);
			}
			*/
        }
    }
}

export const addFrameTrait = ({ delay, frames, initState = "still" }) => (that) => {
	that.frameState = initState;
	that.frames = frames;
	that.frameDelay = delay;

	let frameCounter = 0;
	let lastState = that.frameState;
	that.handleFrames = ({ JSON }) => {
		frameCounter += 1;

		if(lastState !== that.frameState) frameCounter = 0;
		lastState = that.frameState;

		if(Math.floor(frameCounter/that.frameDelay) >= JSON[that.frames][that.frameState].length) frameCounter = 0;

		if(JSON[that.frames][that.frameState][Math.floor(frameCounter/that.frameDelay)][0] === "break"){
			frameCounter -= that.frameDelay * JSON[that.frames][that.frameState][Math.floor(frameCounter/that.frameDelay)][1];
		}

		that.imgPos.x = JSON[that.frames][that.frameState][Math.floor(frameCounter/that.frameDelay)][0];
		that.imgPos.y = JSON[that.frames][that.frameState][Math.floor(frameCounter/that.frameDelay)][1];
	}

	that.addMethods("handleFrames");
}

export const addTalkTrait = ({ texts, size, Yoffset, condition, sound = false, soundSpec = {} }) => (that) => {
	that.texts = texts;
	that.textYoffset = Yoffset;
	that.textCondition = condition;
	that.textSize = size;
	that.talkSound = sound;
	that.talkSoundSpec = soundSpec;
	that.hasTalked = false;

	that.currentText = 0;
	let lastCurrentText;

	that.text = textEntity({
		pos: vec(0, 0),
		text: that.texts[that.currentText],
		size: that.textSize,
	});

	that.talking = false;
	that.addedText = false;
	
	that.talk = ({ world: { add, remove }, audio: { play } }) => {
		that.text.pos = vec(that.center.x, that.pos.y - that.textYoffset);

		if(that.talking && !that.addedText){
			if(that.talkSound
			&& !that.hasTalked){
				play(that.talkSound, that.talkSoundSpec);
				that.hasTalked = true;
			}

			that.text.text = that.texts[that.currentText];
			that.text.size = that.textSize;

			add(that.text, "texts", 9);
			that.addedText = true;

			if(that.texts.length > 1){
				lastCurrentText = that.currentText;
				while(that.currentText === lastCurrentText){
					that.currentText = Math.floor(Math.random()*that.texts.length);
				}
			}
		}
		if(!that.talking && that.addedText){
			remove(that.text);
			that.addedText = false;
		}
	}

	that.checkTextCondition = (GAME) => {
		if(that.textCondition(GAME))
			that.talking = true;
		else that.talking = false;
	}

	that.addMethods("checkTextCondition", "talk");
}

export const textEntity = ({ pos, size, text }) => {
	const that = traitHolder();

	that.pos = pos;
	that.size = size;
	that.text = text;

	let offsetX;
	
	that.draw = (ctx, sprites, GAME) => {
		ctx.globalAlpha = 1;
		ctx.fillStyle = "white"
		ctx.font = that.size + "px game";
		for(let i = 0; i < that.text.length; i++){
			offsetX = (that.text[i].length / 2) * (that.size / 2);
			if(that.text[i].constructor === Function) ctx.fillText(that.text[i](GAME), that.pos.x - offsetX, that.pos.y - (size + 2) * (that.text.length-1 - i));
			else ctx.fillText(that.text[i], that.pos.x - offsetX, that.pos.y - (size + 2) * (that.text.length-1 - i));
		}
		ctx.globalAlpha = 1;
	}


	return that;
}
