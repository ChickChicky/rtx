module.exports = function(pos,radius,color) {
    this.type = 'shape';
    this.pos = pos;
    this.radius = radius;
    this.color = color;

    this.reflective = false;

    this.intersects = function(point) {
        return this.pos.distanceTo(point) <= this.radius;
    }
}