const keys = (...keys) => {
	const that = {};

	keys.forEach((key) => {
		that[key] = {
			key,
			down: false,
			downed: false,
			upped: false,
			isKey: true,
		};
	});

	that.update = () => {
		for(let key in that){
			if(that[key].isKey){
				that[key].downed = false;
				that[key].upped = false;
			}
		}
	}

	document.addEventListener("keydown", (e) => {
		for(let key in that){
			if(that[key].key && that[key].key === e.key && !that[key].down){
				that[key].down = true;
				that[key].downed = true;
			}
		};
	});

	document.addEventListener("keyup", (e) => {
		for(let key in that){
			if(that[key].isKey && that[key].key === e.key && that[key].down){
				that[key].down = false;
				that[key].upped = true;
			}
		};
	});

	return that;
}

export default keys;
