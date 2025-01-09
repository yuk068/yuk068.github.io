let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;
let botThinking = false;

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameOver = false;
    botThinking = false;
    statusElement.innerText = "";
    setBoardState(false);
    renderBoard();
}

function makeMove(index) {
    if (board[index] === "" && !gameOver && !botThinking && currentPlayer === "X") {
        board[index] = currentPlayer;
        renderBoard();
        
        if (checkWin(currentPlayer)) {
            gameOver = true;
            statusElement.innerText = `${currentPlayer} Wins!`;
        } else if (board.every(cell => cell !== "")) {
            gameOver = true;
            statusElement.innerText = "It's a Tie!";
        } else {
            currentPlayer = "O";
            botThinking = true;
            setBoardState(true);
            setTimeout(botMove, 500);
        }
    }
}

function setBoardState(disabled) {
    botThinking = disabled;
    const cells = boardElement.querySelectorAll(".cell");
    cells.forEach(cell => {
        if (disabled) {
            cell.style.opacity = "0.5";
            cell.style.cursor = "not-allowed";
        } else {
            cell.style.opacity = "1";
            cell.style.cursor = "pointer";
        }
    });
}

function renderBoard() {
    let cells = boardElement.querySelectorAll(".cell");
    cells.forEach((cell, index) => {
        cell.innerText = board[index];
    });
}

function checkWin(player) {
    return winningCombos.some(combo => 
        combo.every(index => board[index] === player)
    );
}

function getAvailableMoves(board) {
    return board
        .map((cell, index) => cell === "" ? index : null)
        .filter(index => index !== null);
}

function botMove() {
    const bestMove = findBestMove();
    if (bestMove !== -1) {
        board[bestMove] = "O";
        renderBoard();
        
        if (checkWin("O")) {
            gameOver = true;
            statusElement.innerText = "O Wins!";
        } else if (board.every(cell => cell !== "")) {
            gameOver = true;
            statusElement.innerText = "It's a Tie!";
        } else {
            currentPlayer = "X";
        }
    }
    setBoardState(false);
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false, -Infinity, Infinity);
            board[i] = "";
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    // Terminal states
    if (checkWin("O")) return 10 - depth;
    if (checkWin("X")) return depth - 10;
    if (!board.includes("")) return 0;
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = "";
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = "";
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return minScore;
    }
}

renderBoard();