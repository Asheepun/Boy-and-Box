const vec = (x = 0, y = 0) => {
	const that = {
		x,
		y,
		mag: Math.sqrt(x*x + y*y),
	};

	that.copy = () => vec(that.x, that.y);

	return that;
}

export const rVec = (low, high) => vec(Math.random()*high+low, Math.random()*high+low);

export const add = (vec1, vec2) => vec(vec1.x+vec2.x, vec1.y+vec2.y); 

export const sub = (vec1, vec2) => vec(vec1.x-vec2.x, vec1.y-vec2.y); 

export const div = (v, x) => vec(v.x/x, v.y/x); 

export const mul = (v, x) => vec(v.x*x, v.y*x);

export const dub = (v) => mul(v, 2);

export const half = (v) => div(v, 2);

export const reverse = (v) => vec(-v.x, -v.y);

export const normalize = (v) => v.mag !== 0 ? div(v, v.mag) : v;

export const abs = (v) => vec(Math.abs(v.x), Math.abs(v.y));

export const floor = (v) => vec(Math.floor(v.x), Math.floor(v.y)); 

export const round = (v) => vec(Math.round(v.x), Math.round(v.y)); 

export const align = (cord, scl) => {
    if(Math.floor(cord) % scl === 0) return Math.floor(cord);
    else return align(cord-1, scl);
}

export const angle = (vec1, vec2) => -Math.atan2(vec1.x - vec2.x, vec1.y - vec2.y);

export const pipe = (x, ...funcs) => funcs.reduce((x, func) => func(x), x);

export const getDir = (vec, dist = 1) => pipe(
    vec,
    normalize,
    reverse,
    x => mul(x, dist),
);


export default vec;
