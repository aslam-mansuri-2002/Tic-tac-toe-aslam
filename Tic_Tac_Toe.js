// DOM Elements
const bigBox = document.getElementById("big-box");
const startBtn = document.querySelector(".start-btn");
const playerStatus = document.querySelector(".status");
const allClearBtn = document.querySelector(".all-clear-btn");
const resultDisplay = document.querySelector(".result");
const scoreXDisplay = document.getElementById("score-x");
const scoreODisplay = document.getElementById("score-o");
const scoreDrawDisplay = document.getElementById("score-draw");
const pvpModeBtn = document.getElementById("pvp-mode");
const pvaiModeBtn = document.getElementById("pvai-mode");
const winnerModal = document.getElementById("winner-modal");
const modalText = document.getElementById("modal-winner-text");
const playAgainBtn = document.getElementById("play-again-btn");
const themeToggleBtn = document.getElementById("theme-toggle");
const sizeButtons = document.querySelectorAll(".size-btn");

// Game State
let currentPlayer = "X";
let gridSize = 3; // Default 3x3
let gameBoard = [];
let gameActive = false;
let gameMode = "PvP";
let scores = { X: 0, O: 0, Draw: 0 };
let currentTheme = "dark";

// Colors
const NEON_PINK = "#ff007f";
const NEON_CYAN = "#00d2ff";
const NEON_GOLD = "#ffd700";

// --- Grid Generation ---
function initGrid() {
    bigBox.innerHTML = "";
    bigBox.className = gridSize === 3 ? "grid-3x3" : "grid-4x4";
    gameBoard = Array(gridSize * gridSize).fill("");
    
    for (let i = 0; i < gridSize * gridSize; i++) {
        const box = document.createElement("div");
        box.className = "small-box";
        box.setAttribute("data-index", i);
        box.addEventListener("click", () => handleBoxClick(i));
        bigBox.appendChild(box);
    }
}

// --- Winning Patterns Generator ---
function getWinPatterns() {
    let patterns = [];
    // Rows
    for (let i = 0; i < gridSize; i++) {
        let row = [];
        for (let j = 0; j < gridSize; j++) row.push(i * gridSize + j);
        patterns.push(row);
    }
    // Cols
    for (let i = 0; i < gridSize; i++) {
        let col = [];
        for (let j = 0; j < gridSize; j++) col.push(i + j * gridSize);
        patterns.push(col);
    }
    // Diagonals
    let diag1 = [], diag2 = [];
    for (let i = 0; i < gridSize; i++) {
        diag1.push(i * gridSize + i);
        diag2.push(i * gridSize + (gridSize - 1 - i));
    }
    patterns.push(diag1, diag2);
    return patterns;
}

// --- Theme Toggle ---
themeToggleBtn.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.className = currentTheme === "light" ? "light-mode" : "";
    localStorage.setItem("skTheme", currentTheme);
});

// --- Grid Size Selection ---
sizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const newSize = parseInt(btn.getAttribute("data-size"));
        if (newSize !== gridSize) {
            gridSize = newSize;
            sizeButtons.forEach(b => b.classList.toggle("active", b === btn));
            resetBoard();
            saveGameState();
        }
    });
});

// --- Move Handling ---
function handleBoxClick(index) {
    if (gameActive && gameBoard[index] === "") {
        makeMove(index);
        if (gameActive && gameMode === "PvAI" && currentPlayer === "O") {
            gameActive = false; // Block player during AI turn
            setTimeout(aiMove, 600);
        }
    }
}

function makeMove(index) {
    gameBoard[index] = currentPlayer;
    const box = bigBox.children[index];
    box.innerText = currentPlayer;
    box.style.color = currentPlayer === "X" ? NEON_PINK : NEON_CYAN;
    box.style.textShadow = `0 0 10px ${box.style.color}, 0 0 20px ${box.style.color}`;
    
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    playerStatus.innerText = `Player ${currentPlayer}'s Turn`;
    saveGameState();
    checkWinner();
}

// --- AI Logic (Basic) ---
function aiMove() {
    if (!gameActive && gameBoard.includes("")) {
        let available = [];
        gameBoard.forEach((val, idx) => { if (val === "") available.push(idx); });
        
        if (available.length > 0) {
            // Very simple AI: random move for now, but respect gridSize
            let move = available[Math.floor(Math.random() * available.length)];
            gameActive = true;
            makeMove(move);
        }
    }
}

// --- Winner Check ---
function checkWinner() {
    const winPatterns = getWinPatterns();
    let roundWon = false;
    let winnerPattern = null;

    for (let pattern of winPatterns) {
        const first = gameBoard[pattern[0]];
        if (first && pattern.every(idx => gameBoard[idx] === first)) {
            roundWon = true;
            winnerPattern = pattern;
            break;
        }
    }

    if (roundWon) {
        const winner = gameBoard[winnerPattern[0]];
        scores[winner]++;
        saveGameData();
        updateScoreboard();
        showResult(winner, winnerPattern);
        gameActive = false;
        saveGameState();
        return;
    }

    if (!gameBoard.includes("")) {
        scores.Draw++;
        saveGameData();
        updateScoreboard();
        showResult("Draw");
        gameActive = false;
        saveGameState();
    }
}

function showResult(winner, pattern = null) {
    if (winner === "Draw") {
        modalText.innerText = "IT'S A DRAW!";
        modalText.style.color = NEON_GOLD;
        resultDisplay.innerText = "Game Drawn!";
    } else {
        modalText.innerText = `PLAYER ${winner} WINS!`;
        modalText.style.color = winner === "X" ? NEON_PINK : NEON_CYAN;
        resultDisplay.innerText = `Player ${winner} is the Champion!`;
        if (pattern) {
            pattern.forEach(idx => bigBox.children[idx].classList.add("win-animate"));
        }
        triggerConfetti();
    }
    setTimeout(() => { winnerModal.style.display = "flex"; }, 800);
}

function triggerConfetti() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [NEON_PINK, NEON_CYAN, '#fff'] });
}

// --- Game Logic Controls ---
startBtn.addEventListener("click", () => {
    gameActive = !gameActive;
    updateStartBtnUI();
    saveGameState();
});

function updateStartBtnUI() {
    if (gameActive) {
        startBtn.innerText = "Stop Game";
        startBtn.style.background = "rgba(255, 0, 0, 0.2)";
        playerStatus.innerText = `Player ${currentPlayer}'s Turn`;
    } else {
        startBtn.innerText = "Start Game";
        startBtn.style.background = "";
        playerStatus.innerText = "Game Paused";
    }
}

allClearBtn.addEventListener("click", () => {
    if (confirm("Reset everything?")) {
        scores = { X: 0, O: 0, Draw: 0 };
        saveGameData();
        updateScoreboard();
        resetBoard();
        gameActive = false;
        updateStartBtnUI();
        localStorage.removeItem("skUniqueGameState");
    }
});

function resetBoard() {
    initGrid();
    currentPlayer = "X";
    winnerModal.style.display = "none";
    updateStartBtnUI();
    saveGameState();
}

playAgainBtn.addEventListener("click", resetBoard);

// --- Mode Logic ---
pvpModeBtn.addEventListener("click", () => setMode("PvP"));
pvaiModeBtn.addEventListener("click", () => setMode("PvAI"));

function setMode(mode) {
    gameMode = mode;
    pvpModeBtn.classList.toggle("active", mode === "PvP");
    pvaiModeBtn.classList.toggle("active", mode === "PvAI");
    resetBoard();
}

// --- Persistence ---
function saveGameData() { localStorage.setItem("skUniqueScores", JSON.stringify(scores)); }
function updateScoreboard() {
    scoreXDisplay.innerText = scores.X;
    scoreODisplay.innerText = scores.O;
    scoreDrawDisplay.innerText = scores.Draw;
}

function saveGameState() {
    const state = { board: gameBoard, player: currentPlayer, mode: gameMode, active: gameActive, size: gridSize };
    localStorage.setItem("skUniqueGameState", JSON.stringify(state));
}

function loadGameData() {
    // Theme
    const theme = localStorage.getItem("skTheme");
    if (theme) {
        currentTheme = theme;
        document.documentElement.className = theme === "light" ? "light-mode" : "";
    }
    // Scores
    const savedScores = localStorage.getItem("skUniqueScores");
    if (savedScores) { scores = JSON.parse(savedScores); updateScoreboard(); }
    // State
    const savedState = localStorage.getItem("skUniqueGameState");
    if (savedState) {
        const state = JSON.parse(savedState);
        gridSize = state.size || 3;
        gameBoard = state.board;
        currentPlayer = state.player;
        gameMode = state.mode;
        gameActive = state.active;
        
        // Update size UI
        sizeButtons.forEach(btn => btn.classList.toggle("active", parseInt(btn.getAttribute("data-size")) === gridSize));
        
        // Restore Grid
        bigBox.innerHTML = "";
        bigBox.className = gridSize === 3 ? "grid-3x3" : "grid-4x4";
        gameBoard.forEach((val, i) => {
            const box = document.createElement("div");
            box.className = "small-box";
            box.innerText = val;
            box.setAttribute("data-index", i);
            if (val === "X") {
                box.style.color = NEON_PINK;
                box.style.textShadow = `0 0 10px ${NEON_PINK}, 0 0 20px ${NEON_PINK}`;
            } else if (val === "O") {
                box.style.color = NEON_CYAN;
                box.style.textShadow = `0 0 10px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}`;
            }
            box.addEventListener("click", () => handleBoxClick(i));
            bigBox.appendChild(box);
        });
        
        updateStartBtnUI();
        pvpModeBtn.classList.toggle("active", gameMode === "PvP");
        pvaiModeBtn.classList.toggle("active", gameMode === "PvAI");
    } else {
        initGrid();
    }
}

// --- Initialize ---
loadGameData();