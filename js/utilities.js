
// lerp function from circle blast
function lerp(start, end, amt){
    return start * (1-amt) + amt * end;
}
//clamp function from circle blast
function clamp(val, min, max){
    return val < min ? min : (val > max ? max : val);
}

//rectsIntersect function from circle blast
function rectsIntersect(a,b){
    var ab = a.getBounds();
    var bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}