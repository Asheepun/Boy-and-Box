import vec, { div, sub } from "/js/lib/vector.js";

const createCanvas = (width = 800, height = 600, element = document.body) => new Promise((resolve, reject) => {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
	c.id = "gameCanvas";
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;    
	ctx.imageSmoothingEnabled = false;

    //fix canvas size
    const dif = height/width;

    const reSize  = () => {
        c.width = Math.floor(window.innerWidth-10);
        c.height = c.width*dif;
        while(c.height > window.innerHeight){
            c.width -= 2;
            c.height = Math.floor(c.width*dif);
        }
		c.scale = c.width/width;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.mozImageSmoothingEnabled = false;    
		ctx.imageSmoothingEnabled = false;
    }
    reSize();

    window.addEventListener("resize", reSize);

    const pointer = {
        pos: vec(0, 0),
        down: false,
        downed: false,
        upped: false,
    };

	pointer.update = () => {
		pointer.downed = false;
		pointer.upped = false;
	}

    c.addEventListener("mousedown", e => {
        if(!pointer.down) pointer.downed = true;
        pointer.down = true;
        const offset = vec(c.offsetLeft, c.offsetTop);
        pointer.pos = div(sub(vec(e.pageX, e.pageY), offset), c.scale);
    });
    c.addEventListener("mouseup", e => {
        if(pointer.down) pointer.upped = true;
        pointer.down = false;
        const offset = vec(c.offsetLeft, c.offsetTop);
        pointer.pos = div(sub(vec(e.pageX, e.pageY), offset), c.scale);
    });
    c.addEventListener("mousemove", e => {
        const offset = vec(c.offsetLeft, c.offsetTop);
        pointer.pos = div(sub(vec(e.pageX, e.pageY), offset), c.scale);
    });
    c.addEventListener("contextmenu", e => {
        e.preventDefault();
    });

	const touches = [];

	c.addEventListener("touchstart", (e) => {
        const offset = vec(c.offsetLeft, c.offsetTop);

		e.touches.forEach(touch => touches.push({
			idx: touch.identifier,
			pos: div(sub(vec(e.touch.pageX, e.touch.pageY), offset), c.scale),
		}));
	});

	c.addEventListener("touchend", (e) => {
		e.touches.forEach((touch) => {
			touches.forEach((existingTouch, i) => {
				if(touch.identifier === existingTouch.idx) touches.splice(i, 0);
			});
		});
	});

    element.appendChild(c);
    resolve({
        c,
        ctx,
        pointer,
		touches,
        width,
        height,
		scale: c.scale,
    });

});

export default createCanvas;
