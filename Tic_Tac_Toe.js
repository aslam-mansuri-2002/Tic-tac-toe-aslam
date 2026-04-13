//importan eliments selection

let boxes = document.querySelectorAll(".small-box");
let start = document.querySelectorAll(".start-btn")[0];
let PlayerStatus = document.querySelectorAll(".status")[0];
let allClear = document.querySelectorAll(".all-clear-btn")[0];
let result = document.querySelectorAll(".result")[0];

let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let gameActive = false;

start.addEventListener("click", function () {
    if (start.innerText.trim() === "Start") {
        start.innerText = "Stop";
        gameActive = true
    }
    else {
        start.innerText = "Start";
        gameActive = false;
    }

})

//yaha se local storage mai save hoga
function tttGameData() {
    let ttt = {
        board: gameBoard,
        player: currentPlayer,
    }
    localStorage.setItem("tttGame", JSON.stringify(ttt));
}
function reloadttt() {
    let tttdata = localStorage.getItem("tttGame");
    if (tttdata) {
        let data = JSON.parse(tttdata);
        gameBoard = data.board;
        currentPlayer = data.player;
        boxes.forEach(function (boxx) {
            let index = boxx.getAttribute("data-index");
            boxx.innerText = gameBoard[index];
            if (gameBoard[index] === "X") {
                boxx.style.color = "red";
            }
            else if (boxx.innerText === "O") {
                boxx.style.color = "green";
            }
            PlayerStatus.innerText = "Player " + currentPlayer + "'s Turn"
        })
    }
}
// yah se winner chek hoga..
//winnig pattan..
let winnPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
// yaha se winner chek hoga ya draw hoga 
function checkwinner() {
    for (i = 0; i < winnPatterns.length; i++) {
        let pattan = winnPatterns[i]

        let a = gameBoard[pattan[0]];
        let b = gameBoard[pattan[1]];
        let c = gameBoard[pattan[2]];
        if (a !== "" && a === b && a === c) {
            result.innerText = "Winner is " + a;
            gameActive = false
            start.innerText = "Start";
            if (a === "X") {
                result.style.color = "#ff007f";
            }
            else if (a === "O") {
                result.style.color = "#00d2ff"
            }
            return;
        }
    }
    if (!gameBoard.includes("")) {
        result.innerText = "Game has Draw";
        result.style.color = "#ffd700";
        start.innerText = "Start";
    }
}

// jab game start btn se suru kare

boxes.forEach(function (my_boxes) {
    my_boxes.addEventListener("click", function () {
        if (gameActive == true) {
            let index = my_boxes.getAttribute("data-index");
            if (gameBoard[index] === "") {
                gameBoard[index] = currentPlayer

                if (currentPlayer === "X") {
                    my_boxes.style.color = "#ff007f"; // Neon Pink
                    my_boxes.style.textShadow = "0 0 10px #ff007f, 0 0 20px #ff007f";
                    my_boxes.innerText = currentPlayer;
                    currentPlayer = "O"
                }
                else {
                    my_boxes.style.color = "#00d2ff"; // Neon Cyan
                    my_boxes.style.textShadow = "0 0 10px #00d2ff, 0 0 20px #00d2ff";
                    my_boxes.innerText = currentPlayer;
                    currentPlayer = "X";
                }

                // yaha se status badl hoga
                PlayerStatus.innerText = "Player " + currentPlayer + "'s Turn";
                tttGameData();
                checkwinner();
            }
        }
    })
})
reloadttt();

//yaha se sab kuch clear aur restart hoga..
allClear.addEventListener("click", function () {
    localStorage.clear();
    gameBoard = ["", "", "", "", "", "", "", "", ""];
    start.innerText = "Start";
    gameActive = false;
    currentPlayer = "X";
    PlayerStatus.innerText = "Player " + currentPlayer + "'s Turn";
    result.innerText = "...";
    result.style.color = "white";
    boxes.forEach(function (boxx) {
        boxx.innerText = "";
        boxx.style.color = "white";
        boxx.style.textShadow = "none";
    })
});