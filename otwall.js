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
  this.mass = 1;
  this.rest = -0.8;

  this.vel = {x: 100, y: 00};
  this.A = Math.PI * this.radius * this.radius / (1000);

  this.collided = false;


  this.update = function(dt) {
    
    var oldx = this.x;
    var oldy = this.y;

    //Drag:
    var fx = -0.5 * game.drag * this.A * game.rho * this.vel.x * this.vel.x * this.vel.x / Math.abs(this.vel.x);
    var fy = -0.5 * game.drag * this.A * game.rho * this.vel.y * this.vel.y * this.vel.y / Math.abs(this.vel.y);
    fx = (isNaN(fx) ? 0 : fx);
    fy = (isNaN(fy) ? 0 : fy);

    //Calc accel:
    var ax = fx / this.mass;
    var ay = game.grav + (fy / this.mass);

    this.vel.x += ax * dt;
    this.vel.y += ay * dt;

    this.x += this.vel.x * dt * 100;
    this.y += this.vel.y * dt * 100;

    if (this.x - this.radius < 0){
      this.vel.x *= this.rest;
      this.x = this.radius;
    }
    
    if (this.x + this.radius > this.canvasWidth){
      this.vel.x *= this.rest;
      this.x = this.canvasWidth - this.radius;
    }

    if ((this.y + this.radius) > this.canvasHeight){
      this.vel.y *= this.rest;
      this.y = this.canvasHeight - this.radius;
    }

    rackstart = new Vector2(game.player.rstartx, game.player.rstarty);
    rackend = new Vector2(game.player.rendx, game.player.rendy);
    oldpos = new Vector2(oldx, oldy);
    newpos = new Vector2(this.x, this.y);
    //var collides = checkColl(rackstart, rackend, newpos, this.radius);
    var collides = checkCollRay(rackstart, rackend, oldpos, newpos);
    //debug(collides);
    this.collided = collides;

    if (collides ) {

      var dir = newpos.subtr(oldpos);
      var surf = rackend.subtr(rackstart);
      var newangle = this.getNewAngle(dir, surf);
      debug(newangle);

      var newvelangle = newangle.unit().multiply((new Vector2(this.vel.x, this.vel.y)).length());
      this.vel.x = newvelangle.x ;
      this.vel.y = newvelangle.y;
      this.x = collides.x + newvelangle.x*game.player.rforce*dt*5;
      this.y = collides.y + newvelangle.y*game.player.rforce*dt*5;

    }

  };

  this.render = function() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);

    rackstart = new Vector2(game.player.rstartx, game.player.rstarty);
    rackend = new Vector2(game.player.rendx, game.player.rendy);
    oldpos = new Vector2(0, 0);
    newpos = new Vector2(this.x, this.y);
    //var collides = checkColl(rackstart, rackend, newpos, this.radius);
    var collides = game.ball.collided; 
    if (collides){
      this.context.fillStyle = 'red';}
    else {
      this.context.fillStyle = 'yellow';
    }
    this.context.fill();
    this.context.stroke();
  }

  this.getNewAngle = function(dir, sur) {
    var surunit = sur.unit();
    var norm = new Vector2(-1*surunit.y, surunit.x);
    if (norm.dot(dir) >= 0){
      norm = new Vector2(surunit.y, -1* surunit.x);
    }
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
    this.y = 20;
    this.vel = {x: 1, y: 0};
  }

}
Ball.prototype = new Drawable();

function Player() {
  this.speed = 5;
  this.rspeed = 0.15;
  this.rangle = Math.PI/2;
  //this.rangle = -1.4584073464102074;
  this.rangle = 0.9415926535897925;
  this.armcx = 0;
  this.armcy = 0;
  this.rforce = 1;

  this.render = function() {
    //debug(this.rforce);
    this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.context.drawImage(imageRepository.player, this.x, this.y);

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

      this.armcx = this.x + this.width/2;
      this.armcy = this.y + 46;
      this.rstartx = this.armcx + Math.cos(this.rangle)*40;
      this.rstarty = this.armcy + Math.sin(this.rangle)*40;

      this.rendx = this.armcx + Math.cos(this.rangle)*71;
      this.rendy = this.armcy + Math.sin(this.rangle)*71;
  };

}
Player.prototype = new Drawable();

var game  = {
  fps: 60,
  slow: 1,
  ball: null,
  player: null,

  drag: 0.47,
  rho: 1.22,
  grav: 9.81,

  bgCanvas: null,
  ballCanvas: null,
  playerCanvas: null,
  armCanvas: null,

  bgContext: null,
  ballContext: null,
  playerContext: null,
  armContext: null,

  update: function(dt) {
    if (KEY_STATUS['space']){
      game.slow = 40;
    } else {
      game.slow = 1;
    }
    game.player.update();
    game.ball.update(dt);
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
      game.ball.init(30, 400, 7, 7);
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
    fpsmeter = new FPSMeter(document.getElementById('fpsdiv'), { decimals: 0, graph: true, theme: 'dark', left: '5px' });

    function frame() {
      slowStep = game.slow * step,

      fpsmeter.tickStart();
      now = timestamp();
      dt = dt + Math.min(1, (now - last) / 1000);
      while(dt > slowStep) {
        dt = dt - slowStep;
        game.update(step);
      }
      if (KEY_STATUS.enter){
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

function checkCollRay(rackstart, rackend, oldpos, newpos) {
  return doLineSegmentsIntersect(rackstart, rackend, oldpos, newpos);
  //var collides = true;
  //var rackvect = rackend.subtr(rackstart);
  //var rayvect = newpos.subtr(oldpos);
  //var scalefact = (rayvect.length + game.ball.radius) / rayvect.length;
  ////rayvect.multiply(scalefact);

  //var d1 = cross2d( rackvect, oldpos.subtr(rackend) );
  //var d2 = cross2d( rackvect, newpos.subtr(rackend) );
  //if ( (d1 < 0 && d2 < 0) || (d1 > 0 && d2 > 0) ){
  //  return false;
  //}
  //var d3 = cross2d( rayvect, rackstart.subtr(newpos) );
  //var d4 = cross2d( rayvect, rackend.subtr(newpos) );
  //if ( (d3 < 0 && d4 < 0) || (d3 > 0 && d4 > 0) ){
  //  return false;
  //}
  //return collides;

}

function cross2d(v1, v2) {
  return ( v1.x * v2.y - v1.y * v2.x );
}

function checkColl(rackstart, rackend, pos, radius){
  var collides = true;
  var dist = linePointDistance(rackstart, rackend, pos);
  if (dist > radius){
    return false;
  }
  var rackvect = new Vector2(rackend.x - rackstart.x, rackend.y - rackstart.y);
  var SP = new Vector2(pos.x - rackstart.x, pos.y - rackstart.y);
  var EP = new Vector2(pos.x - rackend.x, pos.y - rackend.y);
  var spd = SP.dot(rackvect);
  var epd = EP.dot(rackvect);
  if ( (spd >= 0 && epd >= 0) || (spd <= 0 && epd <= 0) ) {
    return false;
  }
  return collides;
}

function linePointDistance(linestart, lineend, point) {
  var p1 = linestart;
  var p2 = lineend;
  var p3 = point;
  var p2p1 = new Vector2(p2.x - p1.x, p2.y - p1.y);

  var u = (p3.x - p1.x)*(p2.x - p1.x) + (p3.y - p1.y)*(p2.y - p1.y);
  u = u / (p2p1.length() * p2p1.length());
  var pfoot = new Vector2(p1.x + u * (p2.x - p1.x), p1.y + u*(p2.y - p1.y));
  var linepointvec = new Vector2(pfoot.x - point.x, pfoot.y - point.y);
  return linepointvec.length();
  
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
