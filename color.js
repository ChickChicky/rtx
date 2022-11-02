
function Color(a,b,c) {
    let color = {};

    if (typeof a == "number" && typeof b == "undefined" && typeof c == "undefined") {
        color.r = a&0x0000ff;
        color.g = (a&0x00ff00)>>8;
        color.b = (a&0xff0000)>>16;
    }
    if (typeof a == "string" && typeof b == "undefined" && typeof c == "undefined") {
        [_,color.r,color.g,color.b] = a.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i).slice(1,4).map(m=>Number.parseInt(m,'16')); 
    }
    if (typeof a == "number" && typeof b == "number" && typeof c == "number") {
        color.r = a;
        color.g = b;
        color.b = c;
    }
    if (a._color == true && typeof b == "undefined" && typeof c == "undefined") {
        color.r=a.r;
        color.g=a.g;
        color.b=a.b;
    }

    color._color = true;

    color.toNumber = function(reversed=false) {
        if (reversed) {
            return color.b | color.g << 8 | color.r << 16;
        } else {
            return color.r | color.g << 8 | color.b << 16;
        }
    }
    color.toString = function() {
        return `${color.r.toString(16).padStart(2,'0')}${color.g.toString(16).padStart(2,'0')}${color.b.toString(16).padStart(2,'0')}`;
    }
    color.map = function(fn) {
        [color.r,color.g,color.b] = [color.r,color.g,color.b].map(fn);
        return color;
    }
    color.blend = function(other,rate) {
        other = Color(other);
        return Color(
            color.r*(1-rate)+other.r*rate,
            color.g*(1-rate)+other.g*rate,
            color.b*(1-rate)+other.b*rate
        );
    }
    color.round = function() {
        return Color(
            Math.round(color.r),
            Math.round(color.g),
            Math.round(color.b)
        );
    }
    color.valueOf = function() {
        return `<Color #${color.toString()}>`;
    }
    return color;
}

module.exports = Color;