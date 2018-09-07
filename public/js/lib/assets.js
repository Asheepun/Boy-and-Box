export const loadSprites = (...urls) => new Promise((resolve, reject) => {
    const sprites = urls.reduce((sprites, url) => {
        const sprite = new Image();
        sprite.src = `/assets/sprites/${url}.png`;
        sprites[url] = sprite;
        return sprites;
    }, {});
    resolve(sprites);
});

export const loadAudio = (volume = 0.5, ...urls) => new Promise((resolve, reject) => {
    const audio = {
        //get audio elements
        sounds: urls.reduce((sounds, url) => {
            const a = new Audio(`/assets/audio/${url}.wav`);
			a.preload = "auto";
            a.load();
            sounds[url] = a;
            a.originVolume = volume;
            return sounds;
        }, {}),
        volume: 100,
    };
    audio.play = (url) => {
		audio.sounds[url].load();
		audio.sounds[url].play();
    }
	let a;
	audio.playOffSync = (url) => {
		a = audio.sounds[url].cloneNode();
		a.volume = audio.sounds[url].volume;
		a.play();
	}
    audio.loop = (url) => {
        audio.sounds[url].loop = true;
        audio.play(url);
    }
    audio.stop = (url) => {
        audio.sounds[url].loop = false;
        audio.sounds[url].load();
    }
    audio.setVolume = (volume) => {
        for(let key in audio.sounds){
            audio.sounds[key].volume = audio.sounds[key].originVolume * (volume !== undefined ? volume : audio.volume/100);
        }
    }
    resolve(audio);
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
