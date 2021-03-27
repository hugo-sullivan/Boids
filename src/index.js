let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

const pi = 3.14159265358979;
const width = canvas.width;
const height = canvas.height;
const packNum = 100;
const packSize = 8;
const predNum = 30;
const boidLimit = 2;
const predLimit = 2;
/*
const flockCentering = 0.02;
const velMatching = 0.02;
const avoidPredFactor = 0.02;
*/
const predAccel = 0.03;
const visualDist = 50;
const eatDist = 3;

var boids = [];
var preds = [];

function initBoid() {
  for (let j = 0; j < packNum; j++) {
    var fCmod = Math.random();
    var vMmod = Math.random();
    var aPmod = Math.random();
    var sumMod = fCmod + vMmod + aPmod;
    var colour =
      Math.round(fCmod * 16) * 65536 +
      Math.round(vMmod * 256) * 256 +
      Math.round(aPmod * 256);
    for (let i = 0; i < packSize; i++) {
      var startVel = Math.random() * 4 + 1;
      var startAngel = Math.random() * (2 * pi);
      boids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: startVel * Math.cos(startAngel),
        dy: startVel * Math.sin(startAngel),
        fC: (fCmod / sumMod) * 0.06,
        vM: (vMmod / sumMod) * 0.06,
        aP: (aPmod / sumMod) * 0.06,
        colour: "#" + colour
      });
    }
  }
}

function initPred() {
  for (var i = 0; i < predNum; i++) {
    var startVel = Math.random() * 4 + 1;
    var startAngel = Math.random() * (2 * pi);
    preds[i] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: startVel * Math.cos(startAngel),
      dy: startVel * Math.sin(startAngel)
    };
  }
}

function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y)
  );
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
  const minDistance = 10; // The distance to stay away from other boids
  const avoidPredFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  for (let i = 0; i < boids.length; i++) {
    if (boids[i] !== boid && distance(boid, boids[i]) < minDistance) {
      moveX += boid.x - boids[i].x;
      moveY += boid.y - boids[i].y;
    }
  }

  boid.dx += moveX * avoidPredFactor;
  boid.dy += moveY * avoidPredFactor;
}

//Aim for center of boids in visual range and shift velocity
//closer to the average if boids in visual range
function visualAim(boid) {
  let averageX = 0;
  let averageY = 0;
  let averageDX = 0;
  let averageDY = 0;
  let numBoid = 0;

  for (let i = 0; i < boids.length; i++) {
    if (boids[i] !== boid && distance(boid, boids[i]) < visualDist) {
      averageY += boids[i].y;
      averageX += boids[i].x;
      averageDY += boids[i].dy;
      averageDX += boids[i].dx;
      numBoid++;
    }
  }

  if (numBoid) {
    boid.dy += (averageY / numBoid - boid.y) * boid.fC;
    boid.dx += (averageX / numBoid - boid.x) * boid.fC;
    boid.dy += (averageDY / numBoid - boid.dy) * boid.vM;
    boid.dx += (averageDX / numBoid - boid.dx) * boid.vM;
  }
}

function avoidPred(boid) {
  // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  for (let i = 0; i < predNum; i++) {
    if (preds[i] !== boid && distance(boid, preds[i]) < visualDist) {
      moveX += boid.x - preds[i].x;
      moveY += boid.y - preds[i].y;
    }
  }

  boid.dx += moveX * boid.aP;
  boid.dy += moveY * boid.aP;
}

function limitSpeed(boid, speedLimit) {
  var speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = speedLimit * (boid.dx / speed);
    boid.dy = speedLimit * (boid.dy / speed);
  }
}

function drawTriangle(ctx, x, y, angle, hypot, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(
    x + hypot * Math.sin(angle + 0.261799387799),
    y + hypot * Math.cos(angle + 0.261799387799)
  );
  ctx.lineTo(
    x + hypot * Math.sin(angle - 0.261799387799),
    y + hypot * Math.cos(angle - 0.261799387799)
  );
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function boidTick(ctx, boid) {
  avoidOthers(boid);
  visualAim(boid);
  avoidPred(boid);
  limitSpeed(boid, boidLimit);
  boid.x += boid.dx;
  boid.y += boid.dy;
  boid.x = boid.x % width;
  boid.y = boid.y % height;
  if (boid.x < 0) {
    boid.x = boid.x + width;
  }
  if (boid.y < 0) {
    boid.y = boid.y + height;
  }
  //drawTriangle(ctx, boid.x, boid.y, angle, 8, "blue");
}

function predAim(ctx, pred) {
  let closestBoidDist = visualDist + 1;
  let closestBoid = -1;
  for (let i = 0; i < boids.length; i++) {
    let dist = distance(pred, boids[i]);
    if (dist < visualDist + 20 && dist < closestBoidDist) {
      closestBoid = i;
      closestBoidDist = dist;
    }
  }
  if (closestBoid !== -1) {
    pred.dy += (boids[closestBoid].y - pred.y) * predAccel;
    pred.dx += (boids[closestBoid].x - pred.x) * predAccel;
  }
  if (closestBoidDist < eatDist) {
    boids.splice(closestBoid, 1);
  }
}

function avoidOtherPred(pred) {
  const minDistance = 10; // The distance to stay away from other boids
  const avoidPredFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  for (let i = 0; i < preds.length; i++) {
    if (preds[i] !== pred && distance(pred, preds[i]) < minDistance) {
      moveX += pred.x - preds[i].x;
      moveY += pred.y - preds[i].y;
    }
  }

  pred.dx += moveX * avoidPredFactor;
  pred.dy += moveY * avoidPredFactor;
}

function predTick(ctx, pred) {
  predAim(ctx, pred);
  avoidOtherPred(pred);
  limitSpeed(pred, predLimit);
  pred.x += pred.dx;
  pred.y += pred.dy;
  pred.x = pred.x % width;
  pred.y = pred.y % height;
  if (pred.x < 0) {
    pred.x = pred.x + width;
  }
  if (pred.y < 0) {
    pred.y = pred.y + height;
  }
  //drawTriangle(ctx, pred.x, pred.y, angle, 14, "red");
}

function drawPredBoid(ctx) {
  for (let i = 0; i < boids.length; i++) {
    let angle = Math.atan2(boids[i].dx, boids[i].dy) + pi;
    drawTriangle(ctx, boids[i].x, boids[i].y, angle, 8, boids[i].colour);
  }
  for (let i = 0; i < predNum; i++) {
    let angle = Math.atan2(preds[i].dx, preds[i].dy) + pi;
    drawTriangle(ctx, preds[i].x, preds[i].y, angle, 14, "red");
  }
}

function animationLoop() {
  ctx.clearRect(0, 0, width, height);
  for (var i = 0; i < boids.length; i++) {
    boidTick(ctx, boids[i]);
  }
  for (var j = 0; j < predNum; j++) {
    predTick(ctx, preds[j]);
  }
  drawPredBoid(ctx);
  // Schedule the next frame
  ctx.font = "30px Garamond";
  ctx.fillStyle = "Black";
  ctx.fillText("Boids " + boids.length, 0, canvas.height);
  requestAnimationFrame(animationLoop);
}

initBoid();
initPred();
// Schedule the main animation loop
requestAnimationFrame(animationLoop);
