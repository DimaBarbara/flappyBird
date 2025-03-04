// board

let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// bird

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImgs = [];
let birdImgsIndex = 0;

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};

// pipes

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let gameOver = false;
let score = 0;
let gameStarted = false;
let wingSound = new Audio("./audio/sfx_wing.wav");
let hitSound = new Audio("./audio/sfx_hit.wav");
let bgm = new Audio("./audio/bgm_mario.mp3");
bgm.loop = true;
let fall = new Audio("./audio/sfx_die.wav");
let point = new Audio("./audio/sfx_point.wav");
let swooshing = new Audio("audio/sfx_swooshing.wav");

window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  for (let i = 0; i < 4; i++) {
    let birdImg = new Image();
    birdImg.src = `/images/flappybird${i}.png`;
    birdImgs.push(birdImg);
  }

  topPipeImg = new Image();
  topPipeImg.src = "./images/toppipe.png";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "/images/bottompipe.png";
  document.addEventListener("keydown", startGame);
  document.addEventListener("click", startGame);
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText("Click to start", 50, 300);
};
function startGame(e) {
  if (!gameStarted) {
    gameStarted = true;
    gameOver = false;
    score = 0;
    pipeArray = [];

    requestAnimationFrame(update);
    setInterval(placePipes, 1500);
  }
  if (e.code == "Space" || e.code == "ArrowUp" || e.type == "click") {
    velocityY = -6;
    if (bgm.paused) {
      bgm.play();
    }
    wingSound.play();

    if (gameOver) {
      bird.y = birdY;
      pipeArray = [];
      score = 0;
      gameOver = false;
    }
  }
}

function update() {
  requestAnimationFrame(update);

  if (!gameStarted || gameOver) {
    return;
  }
  context.clearRect(0, 0, board.width, board.height);

  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);
  context.drawImage(
    birdImgs[birdImgsIndex],
    bird.x,
    bird.y,
    bird.width,
    bird.height
  );
  birdImgsIndex++;
  birdImgsIndex %= birdImgs.length;
  if (bird.y === 0) {
    swooshing.play();
  }
  if (bird.y > board.height) {
    gameOver = true;
    fall.play();
  }
  for (let i = 0; i < pipeArray.length; i++) {
    let pipe = pipeArray[i];
    pipe.x += velocityX;
    context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

    if (!pipe.passed && bird.x > pipe.x + pipe.width) {
      score += 0.5;
      pipe.passed = true;
      point.play();
    }

    if (deleteCollision(bird, pipe)) {
      hitSound.play();
      gameOver = true;
    }
  }
  while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
    pipeArray.shift();
  }
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  if (gameOver) {
    context.fillText("GAME OVER", 45, 300);
    bgm.pause();
    bgm.currentTime = 0;
  }
}

function placePipes() {
  if (!gameStarted || gameOver) {
    return;
  }

  let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
  openingSpace = boardHeight / 4;

  let topPipe = {
    img: topPipeImg,
    x: pipeX,
    y: randomPipeY,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };

  pipeArray.push(topPipe);

  let bottomPipe = {
    img: bottomPipeImg,
    x: pipeX,
    y: randomPipeY + pipeHeight + openingSpace,
    width: pipeWidth,
    height: pipeHeight,
    passed: false,
  };
  pipeArray.push(bottomPipe);
}

function deleteCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
