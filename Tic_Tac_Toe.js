// DOM Elements
const boxes = document.querySelectorAll(".small-box");
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

// Game State
let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;
let gameMode = "PvP"; // Default mode
let scores = { X: 0, O: 0, Draw: 0 };

// Neon Colors
const NEON_PINK = "#ff007f";
const NEON_CYAN = "#00d2ff";

// Load data from localStorage
function loadGameData() {
    const savedScores = localStorage.getItem("skUniqueScores");
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreboard();
    }
}

function saveGameData() {
    localStorage.setItem("skUniqueScores", JSON.stringify(scores));
}

function updateScoreboard() {
    scoreXDisplay.innerText = scores.X;
    scoreODisplay.innerText = scores.O;
    scoreDrawDisplay.innerText = scores.Draw;
}

// Winning Patterns
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Start/Stop Logic
startBtn.addEventListener("click", () => {
    if (!gameActive) {
        startGame();
    } else {
        stopGame();
    }
});

function startGame() {
    gameActive = true;
    startBtn.innerText = "Stop Game";
    startBtn.style.background = "rgba(255, 0, 0, 0.2)";
    startBtn.style.borderColor = "#ff4d4d";
    playerStatus.innerText = `Player ${currentPlayer}'s Turn`;
    resultDisplay.innerText = "Game in progress...";
}

function stopGame() {
    gameActive = false;
    startBtn.innerText = "Start Game";
    startBtn.style.background = "";
    startBtn.style.borderColor = "";
    playerStatus.innerText = "Game Paused";
}

// Mode Selection
pvpModeBtn.addEventListener("click", () => setMode("PvP"));
pvaiModeBtn.addEventListener("click", () => setMode("PvAI"));

function setMode(mode) {
    gameMode = mode;
    pvpModeBtn.classList.toggle("active", mode === "PvP");
    pvaiModeBtn.classList.toggle("active", mode === "PvAI");
    resetBoard();
}

// Box Click Logic
boxes.forEach(box => {
    box.addEventListener("click", () => {
        const index = box.getAttribute("data-index");
        if (gameActive && gameBoard[index] === "") {
            handleMove(index);
            
            if (gameActive && gameMode === "PvAI" && currentPlayer === "O") {
                // Wait a bit for AI to "think"
                gameActive = false; // Disable clicks during AI turn
                setTimeout(aiMove, 600);
            }
        }
    });
});

function handleMove(index) {
    gameBoard[index] = currentPlayer;
    const box = boxes[index];
    box.innerText = currentPlayer;
    
    if (currentPlayer === "X") {
        box.style.color = NEON_PINK;
        box.style.textShadow = `0 0 10px ${NEON_PINK}, 0 0 20px ${NEON_PINK}`;
        currentPlayer = "O";
    } else {
        box.style.color = NEON_CYAN;
        box.style.textShadow = `0 0 10px ${NEON_CYAN}, 0 0 20px ${NEON_CYAN}`;
        currentPlayer = "X";
    }

    playerStatus.innerText = `Player ${currentPlayer}'s Turn`;
    checkWinner();
}

// AI Logic (Simple Random but can be improved to Minimax)
function aiMove() {
    if (!gameActive && gameBoard.includes("")) {
        // Find available indices
        let available = [];
        gameBoard.forEach((val, idx) => { if (val === "") available.push(idx); });
        
        if (available.length > 0) {
            // Check if AI can win or needs to block
            let move = findBestMove(available);
            gameActive = true;
            handleMove(move);
        }
    }
}

function findBestMove(available) {
    // Simple priority: Win > Block > Random
    // 1. Can AI Win?
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        if (gameBoard[a] === "O" && gameBoard[b] === "O" && gameBoard[c] === "") return c;
        if (gameBoard[a] === "O" && gameBoard[c] === "O" && gameBoard[b] === "") return b;
        if (gameBoard[b] === "O" && gameBoard[c] === "O" && gameBoard[a] === "") return a;
    }
    // 2. Block Player X
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        if (gameBoard[a] === "X" && gameBoard[b] === "X" && gameBoard[c] === "") return c;
        if (gameBoard[a] === "X" && gameBoard[c] === "X" && gameBoard[b] === "") return b;
        if (gameBoard[b] === "X" && gameBoard[c] === "X" && gameBoard[a] === "") return a;
    }
    // 3. Center
    if (available.includes(4)) return 4;
    // 4. Random
    return available[Math.floor(Math.random() * available.length)];
}

function checkWinner() {
    let roundWon = false;
    let winningPattern = null;

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningPattern = pattern;
            break;
        }
    }

    if (roundWon) {
        const winner = gameBoard[winningPattern[0]];
        showResult(winner);
        highlightWinner(winningPattern);
        scores[winner]++;
        saveGameData();
        updateScoreboard();
        gameActive = false;
        return;
    }

    if (!gameBoard.includes("")) {
        showResult("Draw");
        scores.Draw++;
        saveGameData();
        updateScoreboard();
        gameActive = false;
    }
}

function highlightWinner(pattern) {
    pattern.forEach(idx => {
        boxes[idx].classList.add("win-animate");
    });
}

function showResult(winner) {
    if (winner === "Draw") {
        modalText.innerText = "IT'S A DRAW!";
        modalText.style.color = NEON_GOLD;
        resultDisplay.innerText = "Game Drawn!";
    } else {
        modalText.innerText = `PLAYER ${winner} WINS!`;
        modalText.style.color = winner === "X" ? NEON_PINK : NEON_CYAN;
        resultDisplay.innerText = `Player ${winner} is the Champion!`;
        triggerConfetti();
    }
    
    setTimeout(() => {
        winnerModal.style.display = "flex";
    }, 1000);
}

function triggerConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [NEON_PINK, NEON_CYAN, '#ffffff']
    });
}

// Reset Logic
function resetBoard() {
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    boxes.forEach(box => {
        box.innerText = "";
        box.style.color = "";
        box.style.textShadow = "";
        box.classList.remove("win-animate");
    });
    playerStatus.innerText = `Player X's Turn`;
    resultDisplay.innerText = "Game in progress...";
    winnerModal.style.display = "none";
    if (gameActive) startGame();
}

playAgainBtn.addEventListener("click", resetBoard);

allClearBtn.addEventListener("click", () => {
    if (confirm("Reset all scores and board?")) {
        scores = { X: 0, O: 0, Draw: 0 };
        saveGameData();
        updateScoreboard();
        resetBoard();
        stopGame();
    }
});

// Initialize
loadGameData();
stopGame();