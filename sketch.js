// Flocking
// Daniel Shiffman
// https://thecodingtrain.com

// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

const sprites_to_draw = [];
const flock = [];

function preload() {
  // Use the preload function to ensure sprites are loaded before setup runs
  loadJSON("../../Penguins/animationData.json", function (data) {
    sprites_to_draw.push(new Sprite(data, 0, 0, "idleFall"));
    sprites_to_draw.push(new Sprite(data, 0, 0, "idleSpin"));
    sprites_to_draw.push(new Sprite(data, 0, 0, "idleWave"));
  });
}



let alignSlider, cohesionSlider, separationSlider;

function setup() {
  createCanvas(1300, 700);
  alignSlider = createSlider(0, 2, 1, 0.1);
  cohesionSlider = createSlider(0, 2, 1, 0.1);
  separationSlider = createSlider(0, 2, 1, 0.1);
  for (let i = 0; i < 3; i++) {
    flock.push(new Boid(sprites_to_draw));
  }
}

function draw() {
  background(100);
  for (let boid of flock) {
    boid.edges();
    boid.flock(flock);
    boid.update();
    boid.show();
  }
}
