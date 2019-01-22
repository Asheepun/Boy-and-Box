/*

keyObject schema
{
	keyCode: number,
	tag: name,
}

*/

const keys = (...keyObjects) => {
	const that = {};

	keyObjects.forEach((ko) => {
		that[ko.tag] = {
			code: ko.code,
			down: false,
			downed: false,
			upped: false,
		}
	});

	that.update = () => {
		for(let key in that){
			if(that[key].code){
				that[key].downed = false;
				that[key].upped = false;
			}
		}
	}

	document.addEventListener("keydown", (e) => {
		for(let key in that){
			if(that[key].code
			&& that[key].code === e.keyCode
			&& !that[key].down){
				that[key].down = true;
				that[key].downed = true;
			}
		}
	});

	document.addEventListener("keyup", (e) => {
		for(let key in that){
			if(that[key].code
			&& that[key].code === e.keyCode
			&& that[key].down){
				that[key].down = false;
				that[key].upped = true;
			}
		}
	});

	return that;
}

export default keys;
