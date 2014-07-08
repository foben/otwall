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

function doLineSegmentsIntersect(p, p2, q, q2) {
  var r = p2.subtr(p);
  var s = q2.subtr(q);

  var uNumerator = cross2d(q.subtr(p), r);
  var denominator = cross2d(r, s);

  if (uNumerator == 0 && denominator == 0) {
    // colinear, so do they overlap?
    return ((q.x - p.x < 0) != (q.x - p2.x < 0) != (q2.x - p.x < 0) != (q2.x - p2.x < 0)) || 
      ((q.y - p.y < 0) != (q.y - p2.y < 0) != (q2.y - p.y < 0) != (q2.y - p2.y < 0));
  }

  if (denominator == 0) {
    // lines are paralell
    return false;
  }

  var u = uNumerator / denominator;
  var t = cross2d(q.subtr(p), s) / denominator;

  var collides = (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1);

  if (!collides) {
    return false;
  }
  return p.add(r.multiply(t));

}

function cross2d(v1, v2) {
  return ( v1.x * v2.y - v1.y * v2.x );
}
