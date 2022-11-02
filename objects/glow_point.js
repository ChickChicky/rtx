module.exports = function(pos,radius,color,smoothingFactor=5,transparencyFactor=100,innerRadius=0) {
    this.type = 'object';
    this.pos = pos;
    this.radius = radius;
    this.color = color;
    this.smoothingFactor = smoothingFactor;
    this.transparencyFactor = transparencyFactor;
    this.innerRadius = innerRadius;

    this.blend = function(point) { // returns how much color it should blend
        let d = this.pos.distanceTo(point);
        if (d <= this.radius) {
            return { color:this.color, blend:1-(d/this.radius) }
        } else {
            return { color:this.color, blend:0 }
        }
    }

    this.intersects = function(point) {
        return this.pos.distanceTo(point) < this.radius && this.pos.distanceTo(point) > this.innerRadius;
    }


}