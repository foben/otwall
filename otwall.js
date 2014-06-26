var imageRepository  = new function() {
  this.player = new Image();
  this.arm = new Image();
  var numImages = 2;
  var numLoaded = 0;
  function imageLoaded() {
    numLoaded++;
    if (numLoaded === numImages) {
      window.init();
    }
  }
  this.player.onload = function() {
    imageLoaded();
  }
  this.arm.onload = function() {
    imageLoaded();
  }

  this.player.src = "images/dude.png";
  this.arm.src = "images/arm.png";
}

function Drawable() {
  this.init = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  this.speed = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;

  this.draw = function() {};
}

function Ball() {
  this.radius = 7;
  this.xa = -5;
  this.ya = -15;
  //this.direction = Math.PI/2.345; //rechts oben
  //this.speed = 13;

  this.draw = function() {
    //document.getElementById("debug").textContent = this.direction;
    this.context.clearRect(this.x - 3*this.radius, this.y - 3*this.radius,
        5*this.radius, 5*this.radius);
    this.ya += 1;
    this.xa *= 0.99;
    this.ya *= 0.99;


    linestart = new Vector2(game.player.rstartx, game.player.rstarty);
    lineend = new Vector2(game.player.rendx, game.player.rendy);
    var i;
    for(i = 1; i < 25; i++){
      ballpos = new Vector2(this.x + (this.xa / i), this.y + (this.ya/i));
      if (doesCollide(linestart, lineend, ballpos, this.radius)){
        var deflection = this.getNewAngle(new Vector2(this.xa, this.ya), lineend.subtr(linestart));
        this.xa = deflection.x;
        this.ya = deflection.y;
        //this.reset();
        break;
      }
    }

    this.x += this.xa;
    this.y += this.ya;

    if (this.x < 0 || (this.x + this.radius) > this.canvasWidth ) {
      //this.direction = this.getNewAngle(this.direction, 0, 1);
      this.xa *= -1;
    }
    if (this.y < 0 || (this.y + this.radius) > this.canvasHeight){
      //this.direction = this.getNewAngle(this.direction, 1, 0);
      this.ya *= -1;
    }
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = 'yellow';
    this.context.fill();
    this.context.stroke();

  };

  this.getNewAngle = function(dir, sur) {
    var surunit = sur.unit();
    var norm = new Vector2(-1*surunit.y, surunit.x);
    var norm2 = norm.multiply(2);
    var dotpr = norm.dot(dir);
    var def = dir.subtr(norm2.multiply(dotpr));


    
    return def;
  }

  this.reset = function() {
    this.context.clearRect(this.x, this.y, 50, 50);
    this.context.clearRect(this.x - 3*this.radius, this.y - 3*this.radius,
        5*this.radius, 5*this.radius);
    this.x = 20;
    this.y = 0;
    this.ya = 0;
    this.xa = 4;
  }

}
Ball.prototype = new Drawable();

function Player() {
  this.speed = 5;
  this.rspeed = 0.2;
  this.rangle = 0;
  this.armcx = 0;
  this.armcy = 0;

  this.draw = function() {
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.drawImage(imageRepository.player, this.x, this.y);
    this.armcx = this.x + this.width/2;
    this.armcy = this.y + 46;
    this.rstartx = this.armcx + Math.cos(this.rangle)*40;
    this.rstarty = this.armcy + Math.sin(this.rangle)*40;

    this.rendx = this.armcx + Math.cos(this.rangle)*71;
    this.rendy = this.armcy + Math.sin(this.rangle)*71;

    this.context.strokeStyle = "red";
    this.context.lineWidth = 1;
    this.context.beginPath();
    this.context.moveTo(this.rstartx, this.rstarty);
    this.context.lineTo(this.rendx, this.rendy);
    this.context.stroke();

    this.armContext.clearRect(-200,-200,800,800);
    this.armContext.restore();
    this.armContext.save();

    this.armContext.translate(this.armcx, this.armcy);
    this.armContext.rotate(this.rangle);
    this.armContext.drawImage(imageRepository.arm, -5,-5 );

  };
  this.move = function() {
    if (KEY_STATUS.left || KEY_STATUS.right
        || KEY_STATUS.rleft || KEY_STATUS.rright) {
      if (KEY_STATUS.left) {
        this.x -= this.speed;
        if (this.x <= 0) {
          this.x = 0;
        }
      } else if (KEY_STATUS.right) {
        this.x += this.speed;
        if ((this.x + this.width) > this.canvasWidth) {
          this.x = this.canvasWidth - this.width;
        }
      }

      if(KEY_STATUS.rright) {
        this.rangle += this.rspeed;
      } else if (KEY_STATUS.rleft) {
        this.rangle -= this.rspeed;
      }
    }
    this.draw();
  };

}
Player.prototype = new Drawable();

function Game() {
  this.init = function() {
    this.bgCanvas = document.getElementById('background');
    this.ballCanvas = document.getElementById('ball');
    this.playerCanvas = document.getElementById('player');
    this.armCanvas = document.getElementById('arm');
    if (this.bgCanvas.getContext) {
      //Get Canvas contexts
      this.bgContext = this.bgCanvas.getContext('2d');
      this.ballContext = this.ballCanvas.getContext('2d');
      this.playerContext = this.playerCanvas.getContext('2d');
      this.armContext = this.armCanvas.getContext('2d');

      //Setup Ball:
      Ball.prototype.context = this.ballContext;
      Ball.prototype.canvasWidth = this.ballCanvas.width;
      Ball.prototype.canvasHeight = this.ballCanvas.height;
      //Setup Player:
      Player.prototype.context = this.playerContext;
      Player.prototype.canvasWidth = this.playerCanvas.width;
      Player.prototype.canvasHeight = this.playerCanvas.height;
      Player.prototype.armContext = this.armContext;
      Player.prototype.armCanvasWidth = this.armCanvas.width;
      Player.prototype.armCanvasHeight = this.armCanvas.height;

      this.ball = new Ball();
      this.ball.init(30, 100, 7, 7);
      this.player = new Player();
      this.player.init(50, this.playerCanvas.height - imageRepository.player.height, imageRepository.player.width,
          imageRepository.player.height);
      return true;
    } else {
      return false;
    }
  };

  this.start = function() {
    this.player.draw();
    animate();
  };
}

function drawVect(ctx, v, style) {
  ctx.strokeStyle = style;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(v.x, v.y);
  ctx.stroke();
}
  

function animate() {
  requestAnimFrame( animate );
  game.player.move();
  game.ball.draw();
  if (KEY_STATUS.space){
    game.ball.reset();
  }
}

function doesCollide(linestart, lineend, ballpos, radius){
  var coll = true;
  var seg_a = linestart;
  var seg_b = lineend;
  var circ = ballpos;
  var seg_v = seg_b.subtr(seg_a);
  var pt_v = circ.subtr(seg_a);
  var proj_l = pt_v.dot(seg_v.unit());
  var closest;
  if(proj_l < 0) {
    closest = seg_a;
    coll = false;
  } else if (proj_l > seg_v.length()){
    closest = seg_b;
    coll = false;
  } else {
    closest = seg_v.unit().multiply(proj_l);
    closest = closest.add(seg_a);
  }
  //drawVect(game.playerContext, closest, 'red');
  var dist = circ.subtr(closest).length();
  if (dist > radius) {
    coll = false;
  }
  return coll;
}

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


window.requestAnimFrame = (function(){
  console.log((new Vector2(5,5)).unit());
  return  window.requestAnimationFrame   ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame    ||
  window.oRequestAnimationFrame      ||
  window.msRequestAnimationFrame     ||
  function(/* function */ callback, /* DOMElement */ element){
    window.setTimeout(callback, 1000 / 60);
  };
})();

var game = new Game();

function init() {
  if (game.init()){
    game.start();
  }
}


KEY_CODES = {
  37: 'left',
  39: 'right',
  65: 'rleft',
  68: 'rright',
  32: 'space',
}

KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[ KEY_CODES[ code] ] = false;
}

document.onkeydown = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}

document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}
