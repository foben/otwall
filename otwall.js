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

  this.render = function() {};
  this.update = function() {};
}

function Ball() {
  this.radius = 7;
  this.xa = -5;
  this.ya = -15;
  //this.direction = Math.PI/2.345; //rechts oben
  //this.speed = 13;
  //
  this.render = function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    this.context.fillStyle = 'yellow';
    this.context.fill();
    this.context.stroke();

  }

  this.update = function() {
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
        this.xa = deflection.x * game.player.rforce;
        this.ya = deflection.y * game.player.rforce;
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
  this.rforce = 1;

  this.render = function() {
    debug(this.rforce);
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

  this.update = function() {
    if (KEY_STATUS.left || KEY_STATUS.right) {
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
    }
    if(KEY_STATUS.rleft || KEY_STATUS.rright) {
      this.rforce = Math.min (this.rforce += 0.08, 3);
      if(KEY_STATUS.rright) {
        this.rangle += this.rspeed;
      } else if (KEY_STATUS.rleft) {
        this.rangle -= this.rspeed;
      }
    } else {
      this.rforce = 1;
    }
  };

}
Player.prototype = new Drawable();

var game  = {
  fps: 60,
  ball: null,
  player: null,

  bgCanvas: null,
  ballCanvas: null,
  playerCanvas: null,
  armCanvas: null,

  bgContext: null,
  ballContext: null,
  playerContext: null,
  armContext: null,

  update: function(dt) {
    game.player.update();
    game.ball.update();
  },

  render: function(){
    game.player.render();
    game.ball.render();
  },

  init: function() {
    game.bgCanvas = document.getElementById('background');
    game.ballCanvas = document.getElementById('ball');
    game.playerCanvas = document.getElementById('player');
    game.armCanvas = document.getElementById('arm');
    if (game.bgCanvas.getContext) {
      //Get Canvas contexts
      game.bgContext = game.bgCanvas.getContext('2d');
      game.ballContext = game.ballCanvas.getContext('2d');
      game.playerContext = game.playerCanvas.getContext('2d');
      game.armContext = game.armCanvas.getContext('2d');

      //Setup Ball:
      Ball.prototype.context = game.ballContext;
      Ball.prototype.canvasWidth = game.ballCanvas.width;
      Ball.prototype.canvasHeight = game.ballCanvas.height;
      //Setup Player:
      Player.prototype.context = game.playerContext;
      Player.prototype.canvasWidth = game.playerCanvas.width;
      Player.prototype.canvasHeight = game.playerCanvas.height;
      Player.prototype.armContext = game.armContext;
      Player.prototype.armCanvasWidth = game.armCanvas.width;
      Player.prototype.armCanvasHeight = game.armCanvas.height;

      game.ball = new Ball();
      game.ball.init(30, 100, 7, 7);
      game.player = new Player();
      game.player.init(50, game.playerCanvas.height - imageRepository.player.height, imageRepository.player.width,
          imageRepository.player.height);

      return true;
    } else {
      return false;
    }
  },

  run: function() {
    var now,
    dt       = 0,
    last     = timestamp(),
    slow     = 1, // slow motion scaling factor
    step     = 1/game.fps, 
    slowStep = slow * step,
    fpsmeter = new FPSMeter(document.getElementById('fpsdiv'), { decimals: 0, graph: true, theme: 'dark', left: '5px' });

    function frame() {
      fpsmeter.tickStart();
      now = timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while(dt > slowStep) {
        dt = dt - slowStep;
        game.update(step);
      }
      if (KEY_STATUS.space){
        game.ball.reset();
      }
      game.render();
      last = now;
      fpsmeter.tick();
      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  },

}

function drawVect(ctx, v, style) {
  ctx.strokeStyle = style;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(v.x, v.y);
  ctx.stroke();
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

function init() {
  if (game.init()){
    game.run();
  }
}


function debug(text){
  document.getElementById("debug").textContent = text;
}

function timestamp() {
  return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}
