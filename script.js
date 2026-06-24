const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");

const nicknameText = document.getElementById("nickname");
const scoreText = document.getElementById("score");
const inkText = document.getElementById("ink");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const rankList = document.getElementById("rankList");

let nickname = "";
let score = 0;
let ink = 100;
let isPainting = false;
let gameStarted = false;
let gameEnded = false;

const brushRadius = 28;
const cellSize = 4;

const cols = Math.floor(canvas.width / cellSize);
const rows = Math.floor(canvas.height / cellSize);
const totalCells = cols * rows;
const maxPaintCells = Math.floor(totalCells * 0.8);

let paintedCells = [];

const fakeRanks = [
  { name: "QWERTY", score: 15800 },
  { name: "INKAAA", score: 13200 },
  { name: "PAINTX", score: 11950 },
  { name: "COLORZ", score: 9700 },
  { name: "BRUSHH", score: 8400 },
  { name: "SPLASH", score: 6900 },
  { name: "DOTDOT", score: 5200 }
];

function randomNickname() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let name = "";

  for (let i = 0; i < 6; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }

  return name;
}

function setupGame() {
  nickname = randomNickname();
  score = 0;
  ink = 100;
  isPainting = false;
  gameStarted = false;
  gameEnded = false;

  paintedCells = new Array(totalCells).fill(false);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  nicknameText.textContent = nickname;
  updateUI();
  loadRank();
}

function startGame() {
  gameStarted = true;
  gameEnded = false;
}

function updateUI() {
  scoreText.textContent = score;
  inkText.textContent = Math.max(0, Math.floor(ink)) + "%";
}

function getPos(event) {
  const rect = canvas.getBoundingClientRect();

  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height)
  };
}

function paint(x, y) {
  if (!gameStarted || gameEnded) return;
  if (ink <= 0) return;

  let newCells = 0;
  let touchedCells = 0;

  const startCol = Math.max(0, Math.floor((x - brushRadius) / cellSize));
  const endCol = Math.min(cols - 1, Math.floor((x + brushRadius) / cellSize));
  const startRow = Math.max(0, Math.floor((y - brushRadius) / cellSize));
  const endRow = Math.min(rows - 1, Math.floor((y + brushRadius) / cellSize));

  for (let col = startCol; col <= endCol; col++) {
    for (let row = startRow; row <= endRow; row++) {
      const cellX = col * cellSize + cellSize / 2;
      const cellY = row * cellSize + cellSize / 2;

      const dx = cellX - x;
      const dy = cellY - y;

      if (dx * dx + dy * dy <= brushRadius * brushRadius) {
        const index = row * cols + col;
        touchedCells++;

        if (!paintedCells[index]) {
          paintedCells[index] = true;
          newCells++;
        }
      }
    }
  }

  const inkCost = (touchedCells / maxPaintCells) * 100;
  ink -= inkCost;

  if (ink < 0) ink = 0;

  ctx.fillStyle = "#1e88ff";
  ctx.beginPath();
  ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
  ctx.fill();

  score += newCells * 10;

  updateUI();

  if (ink <= 0) {
    endGame();
  }
}

function endGame() {
  if (gameEnded) return;

  gameEnded = true;
  gameStarted = false;

  saveRank();
  alert("게임 끝! 점수: " + score);
}

function saveRank() {
  const myRanks = JSON.parse(localStorage.getItem("inkrushRanks") || "[]");

  myRanks.push({
    name: nickname,
    score: score
  });

  localStorage.setItem("inkrushRanks", JSON.stringify(myRanks));
  loadRank();
}

function loadRank() {
  const myRanks = JSON.parse(localStorage.getItem("inkrushRanks") || "[]");
  const allRanks = [...fakeRanks, ...myRanks];

  allRanks.sort((a, b) => b.score - a.score);

  const top10 = allRanks.slice(0, 10);

  rankList.innerHTML = "";

  top10.forEach((player, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}위 ${player.name} - ${player.score}점`;
    rankList.appendChild(li);
  });
}

canvas.addEventListener("mousedown", function(event) {
  isPainting = true;
  const pos = getPos(event);
  paint(pos.x, pos.y);
});

canvas.addEventListener("mousemove", function(event) {
  if (!isPainting) return;

  const pos = getPos(event);
  paint(pos.x, pos.y);
});

window.addEventListener("mouseup", function() {
  isPainting = false;
});

canvas.addEventListener("touchstart", function(event) {
  event.preventDefault();
  isPainting = true;

  const pos = getPos(event);
  paint(pos.x, pos.y);
});

canvas.addEventListener("touchmove", function(event) {
  event.preventDefault();

  if (!isPainting) return;

  const pos = getPos(event);
  paint(pos.x, pos.y);
});

canvas.addEventListener("touchend", function() {
  isPainting = false;
});

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", function() {
  setupGame();
});

setupGame();