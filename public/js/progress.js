export const getProgress = () => {
	const progress = {};

	if(localStorage.currentLevel === undefined
	|| !storageAvailable()){
		progress.currentLevel = 0;
		progress.deaths = 0;
	}else{
		progress.currentLevel = Number(localStorage.currentLevel);
		progress.deaths = Number(localStorage.deaths);
	}

	return progress;
}

export const saveProgress = (progress) => {
	localStorage.currentLevel = progress.currentLevel;
	localStorage.deaths = progress.deaths;
}

function storageAvailable(type) {
    try {
        const x = '__storage_test__';
        localStorage.setItem(x, x);
        localStorage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}
