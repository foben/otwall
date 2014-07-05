function Vector2(x, y) {
  this.x = x;
  this.y = y;
}
Vector2.prototype = {
  add: function(v) {
    if (v instanceof Vector2){
      return new Vector2(this.x + v.x, this.y + v.y);
    } else {
      return new Vector2(this.x + v, this.y + v);
    }
  },
  subtr: function(v) {
    if (v instanceof Vector2){
      return new Vector2(this.x - v.x, this.y - v.y);
    } else {
      return new Vector2(this.x - v, this.y - v);
    }
  },
  divide: function(v) {
    if (v instanceof Vector2) return new Vector(this.x / v.x, this.y / v.y);
    else return new Vector2(this.x / v, this.y / v);
  },
  multiply: function(v) {
    if (v instanceof Vector2) return new Vector(this.x * v.x, this.y * v.y);
    else return new Vector2(this.x * v, this.y * v);
  },
  unit: function() {
    return this.divide(this.length());
  },
  dot: function(v) {
    return this.x * v.x + this.y * v.y;
  },
  length: function() {
    return Math.sqrt(this.dot(this));
  }

}
