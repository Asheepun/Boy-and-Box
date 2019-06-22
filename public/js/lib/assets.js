export const loadSprites = (...urls) => new Promise((resolve, reject) => {
    let loadCounter = 0;
    const sprites = urls.reduce((sprites, url) => {
        const sprite = new Image();
		sprite.crossOrigin = "";
        sprite.src = `/assets/sprites/${url}.png`;
        sprites[url] = sprite;
        sprite.addEventListener("load", (e) => {
            loadCounter++;
            if(loadCounter === urls.length){
                resolve(sprites);   
            }
			document.getElementById("loading-sprites").innerHTML =
				"Loading sprites " + Math.floor(100 * loadCounter / urls.length) + "%";
        });
        return sprites;
    }, {});
});

export const loadAudio = (sfxVolume = 1, musicVolume = 1, ...urls) => new Promise((resolve, reject) => {
	const audio = {
		sfxVolume,
		musicVolume,
		ctx: new AudioContext(),
		buffers: {},
		loops: {},
	};

	audio.play = (buffer, { volume = 1, frequencyScale = 1, type = "sfx" }) => {
		const soundNode = audio.ctx.createBufferSource();
		soundNode.buffer = audio.buffers[buffer];

		const gainNode = audio.ctx.createGain();
		gainNode.gain.value = audio[type + "Volume"] * volume;

		soundNode.connect(gainNode);

		gainNode.connect(audio.ctx.destination);

		soundNode.start(audio.ctx.currentTime);
	}

	audio.loop = (buffer, { volume = 1 , type = "sfx"}) => {
		const loop = {
			volume,
		}
		loop.soundNode = audio.ctx.createBufferSource();
		loop.soundNode.buffer = audio.buffers[buffer];
		loop.soundNode.loop = true;
		loop.type = type;

		loop.gainNode = audio.ctx.createGain();
		loop.gainNode.gain.value = audio[type + "Volume"] * volume;

		loop.soundNode.connect(loop.gainNode);

		loop.gainNode.connect(audio.ctx.destination);

		loop.soundNode.start(audio.ctx.currentTime);

		audio.loops[buffer] = loop;
	}
	
	audio.stopLoop = (buffer) => {
		audio.loops[buffer].soundNode.stop(audio.ctx.currentTime);
		delete audio.loops[buffer];
	}

	audio.fadeOutLoop = (buffer, fade) => {
		audio.loops[buffer].fadeOut = true;
		audio.loops[buffer].fade = fade * audio.loops[buffer].gainNode.gain.value;
	}

	audio.updateLoops = (GAME) => {
		for(let key in audio.loops){
			if(audio.loops[key].fadeOut){
				audio.loops[key].gainNode.gain.value -= audio.loops[key].fade;
				if(audio.loops[key].gainNode.gain.value < 0){
					audio.loops[key].soundNode.stop(audio.ctx.currentTime);
					delete audio.loops[key];
				}
			}
		}
	}

	audio.changeVolume = (change) => {
		audio.volume *= 100;
		audio.volume = Math.floor(audio.volume);
		audio.volume += change;
		audio.volume /= 100;
		if(audio.volume < 0) audio.volume = 0;

		for(let key in audio.loops){
			audio.loops[key].gainNode.gain.value = audio.loops[key].volume * audio[audio.loops[key].type + "Volume"];
		}
	}

	audio.setVolume = (volume, type) => {
		audio[type + "Volume"] = volume;

		for(let key in audio.loops){
			audio.loops[key].gainNode.gain.value = audio.loops[key].volume * audio[audio.loops[key].type + "Volume"];
		}
	}

	let loadedBuffers = 0;
	urls.forEach(url => {
		const xhr = new XMLHttpRequest();

		xhr.open("Get", `/assets/audio/${url}.ogg`, true);

		xhr.responseType = "arraybuffer";

		xhr.send();

		xhr.addEventListener("load", (e) => {
			audio.ctx.decodeAudioData(
				xhr.response,
				buffer => {
					audio.buffers[url] = buffer;
					loadedBuffers++;
					if(loadedBuffers === urls.length) resolve(audio);
					document.getElementById("loading-audio").innerHTML =
						"Loading audio " + Math.floor(100 * loadedBuffers / urls.length) + "%";
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
