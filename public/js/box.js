import traitHolder, * as traits from "/js/lib/traits.js";
import vec, * as v				from "/js/lib/vector.js";
import * as col					from "/js/lib/colission.js";

const box = (pos) => {
	const that = traitHolder();

	traits.addEntityTrait({
		pos,
		size: vec(15, 15),
	})(that);

	traits.addSpriteTrait({
		img: "box",
		imgSize: that.size.copy(),
	})(that);

	that.waitedForDowned = false; //make sure box is not moved when clickin buttons

	let newPos;
	let lastPos = that.pos.copy();
	that.checkPointer = ({ pointer, world: { obstacles, buttons, blockers }, audio: { play } }) => {
		if(pointer.downed) that.waitedForDowned = true;
		if(pointer.down && that.waitedForDowned){
			newPos = v.pipe(
				pointer.pos.copy(),
				x => v.div(x, 15),
				v.floor,
				x => v.mul(x, 15),
			);

			if(!col.checkPointCol(newPos, obstacles)
			&& (blockers && !col.checkPointCol(newPos, blockers) || !blockers)
			&& !col.checkPointCol(pointer.pos, buttons)
			&& !(lastPos.x === newPos.x && lastPos.y === newPos.y)){
				lastPos = newPos.copy();
				that.pos = v.add(newPos, vec(5, 5));
				that.size = vec(5, 5);
				that.fixCenter();
			}
		}
	}

	that.grow = () => {
		if(that.size.x < 15){
			that.size.x += 2;
			that.size.y += 2;
			that.pos.x -= 1;
			that.pos.y -= 1;
		}
	}

	that.addMethods("checkPointer", "grow");

	return that;
}

export default box;
