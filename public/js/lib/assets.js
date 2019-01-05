export const loadSprites = (...urls) => new Promise((resolve, reject) => {
    let loadCounter = 0;
    const sprites = urls.reduce((sprites, url) => {
        const sprite = new Image();
        sprite.src = `/assets/sprites/${url}.png`;
        sprites[url] = sprite;
        sprite.addEventListener("load", (e) => {
            loadCounter++;
            if(loadCounter === urls.length){
                resolve(sprites);   
            }
        });
        return sprites;
    }, {});
});

export const loadAudio = (volume = 0.5, ...urls) => new Promise((resolve, reject) => {
	const audio = {
		volume,
		ctx: new AudioContext(),
		buffers: {},
		loops: {},
	};

	audio.play = (buffer, { volume = 1, frequencyScale = 1 }) => {
		const soundNode = audio.ctx.createBufferSource();
		soundNode.buffer = audio.buffers[buffer];

		const gainNode = audio.ctx.createGain();
		gainNode.gain.value = audio.volume * volume;

		soundNode.connect(gainNode);

		gainNode.connect(audio.ctx.destination);

		soundNode.start(audio.ctx.currentTime);
	}

	audio.loop = (buffer, { volume = 1 }) => {
		const loop = {
			volume,
		}
		loop.soundNode = audio.ctx.createBufferSource();
		loop.soundNode.buffer = audio.buffers[buffer]
		loop.soundNode.loop = true;

		loop.gainNode = audio.ctx.createGain();
		loop.gainNode.gain.value = audio.volume * volume;

		loop.soundNode.connect(loop.gainNode);

		loop.gainNode.connect(audio.ctx.destination);

		loop.soundNode.start(audio.ctx.currentTime);

		audio.loops[buffer] = loop;
	}
	
	audio.stopLoop = (buffer) => {
		audio.loops[buffer].soundNode.stop(audio.ctx.currentTime);
		delete audio.loops[buffer];
	}

	audio.changeVolume = (change) => {
		audio.volume *= 100;
		audio.volume = Math.floor(audio.volume);
		audio.volume += change;
		audio.volume /= 100;
		if(audio.volume < 0) audio.volume = 0;

		for(let key in audio.loops){
			audio.loops[key].gainNode.gain.value = audio.loops[key].volume * audio.volume;
		}
	}

	audio.setVolume = (volume) => {
		audio.volume = volume;

		for(let key in audio.loops){
			audio.loops[key].gainNode.gain.value = audio.loops[key].volume * audio.volume;
		}
	}

	let loadedBuffers = 0;
	urls.forEach(url => {
		const xhr = new XMLHttpRequest();

		xhr.open("Get", `/assets/audio/${url}.wav`, true);

		xhr.responseType = "arraybuffer";

		xhr.send();

		xhr.addEventListener("load", (e) => {
			audio.ctx.decodeAudioData(
				xhr.response,
				buffer => {
					audio.buffers[url] = buffer;
					loadedBuffers++;
					if(loadedBuffers === urls.length) resolve(audio);
				},
				err => console.log(err),
			);
		}, false);
	});

});

export const loadJSON = (...srcs) => new Promise((resolve, reject) => {
    const resJSON = {};

    for(let i = 0; i < srcs.length; i++){
        const jsonReq = new XMLHttpRequest();
    
        jsonReq.onreadystatechange = function(){
            if(this.readyState === 4 && this.status === 200){
                resJSON[srcs[i]] = JSON.parse(this.responseText);
                if(Object.keys(resJSON).length === srcs.length) resolve(resJSON);
            }
        }
        jsonReq.open("GET", "/assets/json/" + srcs[i] + ".json", true);
        jsonReq.send();
    }
});
