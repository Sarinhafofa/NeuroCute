const EMOJI_FIGURES = [
  "💗", "✂️", "📒", "🫟", "♻️", "🐻", "⚕️", "✏️", "🍀",
  "🐱", "🐸", "🐼", "🦊", "🐢", "🐙", "🦋", "🐝", "🐬",
  "🦄", "🌈", "🌻", "🌙", "⭐", "🎈", "🎁", "🚀", "⚽",
  "🎨", "🎵", "🍎", "🍓", "🍉", "🧁", "🥕", "🍕", "🌺",
  "🌵", "🪁", "🎸"
];

let cards = [], flippedCards = [], matchedPairs = 0, moves = 0, timer = 0;
let timerInterval = null, gameActive = true, lockBoard = false, jogoPausado = false;

function carregarHistorico() {
  try {
    const savedHistory = JSON.parse(localStorage.getItem("memoryHistory") || "[]");
    return Array.isArray(savedHistory) ? savedHistory : [];
  } catch {
    return [];
  }
}

function salvarHistorico() {
  try {
    localStorage.setItem("memoryHistory", JSON.stringify(history));
    return true;
  } catch {
    return false;
  }
}

let history = carregarHistorico();

const gameBoard = document.getElementById("gameBoard");
const movesDisplay = document.getElementById("moves");
const timeDisplay = document.getElementById("time");
const matchesDisplay = document.getElementById("matches");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pause");
const messageText = document.getElementById("message");

pauseBtn.onclick = () => {
  jogoPausado = !jogoPausado;
  pauseBtn.textContent = jogoPausado ? "▶️" : "⏸️";
};

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let totalPairs = 0;

function initGame() {
  if (timerInterval) clearInterval(timerInterval);

  totalPairs = window.innerWidth <= 720 ? 6 : 9;
  const selectedFigures = shuffleArray([...EMOJI_FIGURES]).slice(0, totalPairs);
  cards = shuffleArray(selectedFigures.flatMap(figure => [figure, figure]));

  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  timer = 0;
  gameActive = true;
  lockBoard = false;
  jogoPausado = false;

  pauseBtn.textContent = "⏸️";
  movesDisplay.textContent = moves;
  matchesDisplay.textContent = matchedPairs;
  timeDisplay.textContent = formatTime(timer);
  messageText.textContent = "ACHE OS PARES!";
  messageText.style.color = "";

  renderBoard();
  timerInterval = setInterval(updateTimer, 1000);
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

function renderBoard() {
  gameBoard.innerHTML = "";
  cards.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">🔆</div>
        <div class="card-back">${item}</div>
      </div>
    `;
    card.onclick = () => flipCard(i);
    gameBoard.appendChild(card);
  });
}


function flipCard(i) {

    if (!gameActive || jogoPausado || lockBoard || flippedCards.includes(i)) return;

  flippedCards.push(i);
  document.querySelectorAll(".card")[i].classList.add("flipped");
  if (flippedCards.length === 2) {
    moves++; movesDisplay.textContent = moves;
    checkMatch();
  }
}
function checkMatch() {
  const [i1, i2] = flippedCards;
  const [c1, c2] = [cards[i1], cards[i2]];
  const elements = document.querySelectorAll(".card");

  lockBoard = true;

  setTimeout(() => {
    if (c1 === c2) {
      matchedPairs++;
      matchesDisplay.textContent = matchedPairs;

      [i1, i2].forEach(i => {
        elements[i].classList.add("flipped", "matched");
        elements[i].style.pointerEvents = "none";
      });

      if (matchedPairs === totalPairs) {
        winGame();
      }
    } else {
      [i1, i2].forEach(i => {
        elements[i].classList.remove("flipped");
      });
    }

    flippedCards = [];
    lockBoard = false;
  }, 700);
}
function winGame() {
  gameActive = false;
  clearInterval(timerInterval);
  messageText.innerHTML = "VOCÊ GANHOU!!";
  messageText.style.color = "#367e02";

  history.push({ moves, time: formatTime(timer), pairs: matchedPairs });
  const historySaved = salvarHistorico();

  const saveWarning = historySaved ? "" : "\nNão foi possível salvar o resultado no histórico.";
  alert(`TOTAL: Movimentos ${moves} Tempo ${formatTime(timer)}!\nPARABÉNS${saveWarning}`);
}

function updateTimer() {
  if (gameActive && !jogoPausado && matchedPairs < totalPairs) {
    timer++; timeDisplay.textContent = formatTime(timer);
  }
}
resetBtn.onclick = initGame;

window.onload = initGame;
