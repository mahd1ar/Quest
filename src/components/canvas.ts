import SimplexNoise from "simplex-noise";

const rand = (n: number) => n * Math.random();
const lerp = (n1: number, n2: number, speed: number) =>
  (1 - speed) * n1 + speed * n2;
const randRange = (n: number) => n - rand(2 * n);
const TAU = 2 * Math.PI;
const fadeInOut = (t: number, m: number) => {
  const hm = 0.5 * m;
  return Math.abs(((t + hm) % m) - hm) / hm;
};
const particleCount = 700;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 100;
const baseTTL = 50;
const rangeTTL = 150;
const baseSpeed = 0.1;
const rangeSpeed = 2;
const baseRadius = 1;
const rangeRadius = 4;
const baseHue = 220;
const rangeHue = 100;
const noiseSteps = 8;
const xOff = 0.00125;
const yOff = 0.00125;
const zOff = 0.0005;
const backgroundColor = "hsla(260,40%,5%,1)";

let container;
let canvas: { a: HTMLCanvasElement; b: HTMLCanvasElement };
let ctx: { a: CanvasRenderingContext2D; b: CanvasRenderingContext2D };
let center: number[];
// let gradient;
let tick: number;
let simplex: SimplexNoise;
let particleProps: Float32Array;
// let positions;
// let velocities;
// let lifeSpans;
// let speeds;
// let sizes;
// let hues;
let reqAnimationCounter: number;

function setup() {
  createCanvas();
  resize();
  initParticles();
  draw();
}

function initParticles() {
  tick = 0;
  simplex = new SimplexNoise();

  particleProps = new Float32Array(particlePropsLength);

  let i;

  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }
}

function initParticle(i: number) {
  // let x, y, vx, vy, life, ttl, speed, radius, hue;

  const x = rand(canvas.a.width);
  const y = center[1] + randRange(rangeY);
  const vx = 0;
  const vy = 0;
  const life = 0;
  const ttl = baseTTL + rand(rangeTTL);
  const speed = baseSpeed + rand(rangeSpeed);
  const radius = baseRadius + rand(rangeRadius);
  const hue = baseHue + rand(rangeHue);

  particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
}

function drawParticles() {
  let i;

  for (i = 0; i < particlePropsLength; i += particlePropCount) {
    updateParticle(i);
  }
}

function updateParticle(i: number) {
  const i2 = 1 + i,
    i3 = 2 + i,
    i4 = 3 + i,
    i5 = 4 + i,
    i6 = 5 + i,
    i7 = 6 + i,
    i8 = 7 + i,
    i9 = 8 + i;
  // let n, x, y, vx, vy, life, ttl, speed, x2, y2, radius, hue;

  const x = particleProps[i];
  const y = particleProps[i2];
  const n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
  const vx = lerp(particleProps[i3], Math.cos(n), 0.5);
  const vy = lerp(particleProps[i4], Math.sin(n), 0.5);
  let life = particleProps[i5];
  const ttl = particleProps[i6];
  const speed = particleProps[i7];
  const x2 = x + vx * speed;
  const y2 = y + vy * speed;
  const radius = particleProps[i8];
  const hue = particleProps[i9];

  drawParticle(x, y, x2, y2, life, ttl, radius, hue);

  life++;

  particleProps[i] = x2;
  particleProps[i2] = y2;
  particleProps[i3] = vx;
  particleProps[i4] = vy;
  particleProps[i5] = life;

  (checkBounds(x, y) || life > ttl) && initParticle(i);
}

function drawParticle(
  x: number,
  y: number,
  x2: number,
  y2: number,
  life: number,
  ttl: number,
  radius: number,
  hue: number
) {
  ctx.a.save();
  ctx.a.lineCap = "round";
  ctx.a.lineWidth = radius;
  ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
  ctx.a.beginPath();
  ctx.a.moveTo(x, y);
  ctx.a.lineTo(x2, y2);
  ctx.a.stroke();
  ctx.a.closePath();
  ctx.a.restore();
}

function checkBounds(x: number, y: number) {
  return x > canvas.a.width || x < 0 || y > canvas.a.height || y < 0;
}

function createCanvas() {
  container = document.querySelector(
    ".canvas-placeholder"
  ) as HTMLCanvasElement;
  canvas = {
    a: document.createElement("canvas")!,
    b: document.createElement("canvas")!
  };
  // position: fixed;
  // @ts-ignore
  canvas.b.style = `
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	`;
  container.appendChild(canvas.b);
  ctx = {
    a: canvas.a.getContext("2d")!,
    b: canvas.b.getContext("2d")!
  };
  center = [];
}

function resize() {
  const { innerWidth, innerHeight } = window;

  canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;

  ctx.a.drawImage(canvas.b, 0, 0);

  canvas.b.width = innerWidth;
  canvas.b.height = innerHeight;

  ctx.b.drawImage(canvas.a, 0, 0);

  center[0] = 0.5 * canvas.a.width;
  center[1] = 0.5 * canvas.a.height;
}

function renderGlow() {
  ctx.b.save();
  ctx.b.filter = "blur(8px) brightness(200%)";
  ctx.b.globalCompositeOperation = "lighter";
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();

  ctx.b.save();
  ctx.b.filter = "blur(4px) brightness(200%)";
  ctx.b.globalCompositeOperation = "lighter";
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function renderToScreen() {
  ctx.b.save();
  ctx.b.globalCompositeOperation = "lighter";
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function draw() {
  tick++;

  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);

  ctx.b.fillStyle = backgroundColor;
  ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);

  drawParticles();
  renderGlow();
  renderToScreen();

  reqAnimationCounter = window.requestAnimationFrame(draw);
}

function stop() {
  window.cancelAnimationFrame(reqAnimationCounter);
}

export { setup, resize, stop };

// setup()
// window.addEventListener('resize', resize);

// https://codepen.io/seanfree/pen/dNXrrr
// https://codepen.io/seanfree/pen/RqRXay
// https://codepen.io/seanfree/pen/yxBpwb
// https://codepen.io/seanfree/pen/xxbKqPv
// https://codepen.io/seanfree/pen/apvzbv
// https://codepen.io/franksLaboratory/details/ZEprPKx
