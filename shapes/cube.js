module.exports = function(pos,size,color) {
    this.type = 'shape';
    this.pos = pos;
    this.size = size;
    this.color = color;

    this.reflective = false;

    this.intersects = function(point) {
        return (
            point.x<this.pos.x+this.size.x && point.x>this.pos.x-this.size.x &&
            point.y<this.pos.y+this.size.y && point.y>this.pos.y-this.size.y &&
            point.z<this.pos.z+this.size.z && point.z>this.pos.z-this.size.z
        )

    }
}