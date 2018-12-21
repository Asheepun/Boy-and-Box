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
	};

	audio.play = (buffer, { volume = 1 }) => {
		const soundNode = audio.ctx.createBufferSource();
		soundNode.buffer = audio.buffers[buffer];

		const volumeNode = audio.ctx.createGain();
		volumeNode.gain.value = audio.volume * volume;

		soundNode.connect(volumeNode);

		volumeNode.connect(audio.ctx.destination);

		soundNode.start(audio.ctx.currentTime);
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
