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

// button

let buttonX = boardWidth / 2 - 60;
let buttonY = boardHeight / 2 + 50;
let buttonWidth = 120;
let buttonHeight = 50;

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
let gameOverMP = new Audio("./audio/game-over.mp3");
let swooshing = new Audio("audio/sfx_swooshing.wav");
let bestScore = localStorage.getItem("bestScore") || 0;

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
  if (
    !gameOver &&
    (e.code == "Space" || e.code == "ArrowUp" || e.type == "click")
  ) {
    velocityY = -6;
    if (bgm.paused) {
      bgm.play();
    }
    wingSound.currentTime = 0;
    wingSound.play();
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
    swooshing.currentTime = 0;
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
  if (!gameOver) {
    context.fillText(score, 5, 45);
  }

  if (gameOver) {
    context.fillText("GAME OVER", 45, 300);
    context.fillText(`Your score: ${score} `, 50, 350);
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bestScore", bestScore);
    }
    context.fillText(`Best score: ${bestScore} `, 5, 45);
    context.fillStyle = "red";
    context.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    context.fillStyle = "white";
    context.font = "25px sans-serif";
    context.fillText("Restart", buttonX + 15, buttonY + 33);
    board.addEventListener("click", restartGame);
    bgm.pause();
    hitSound.pause();
    if (!(bird.y > board.height)) {
      gameOverMP.currentTime = 0;
      gameOverMP.play();
    }

    bgm.currentTime = 0;
  }
}
function restartGame(e) {
  let rect = board.getBoundingClientRect();
  let clickX = e.clientX - rect.left;
  let clickY = e.clientY - rect.top;

  if (
    clickX >= buttonX &&
    clickX <= buttonX + buttonWidth &&
    clickY >= buttonY &&
    clickY <= buttonY + buttonHeight
  ) {
    bird.y = birdY;
    velocityY = 0;
    pipeArray = [];
    score = 0;
    gameOver = false;
    board.removeEventListener("click", restartGame);
    document.addEventListener("keydown", startGame);
    document.addEventListener("click", startGame);
    gameOverMP.pause();
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
