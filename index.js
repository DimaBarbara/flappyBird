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

let bird = {
  x: birdX,
  y: birdY,
  width: birdWidth,
  height: birdHeight,
};
window.onload = function () {
  board = document.getElementById("board");
  board.height = boardHeight;
  board.width = boardWidth;
  context = board.getContext("2d");

  birdImg = new Image();
  birdImg.src = "images/flappybird.png";
  birdImg.onload = function () {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
  };
  requestAnimationFrame(update);
};

function update() {
  requestAnimationFrame(update);
  context.clearRect(0, 0, board.width, board.height);
  context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}
