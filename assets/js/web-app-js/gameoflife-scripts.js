const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const resolution = 10;
const maxCanvasWidth = 500;
const screenWidth = window.innerWidth;

canvas.width = Math.min(screenWidth - 20, maxCanvasWidth);
canvas.height = canvas.width;

const cols = Math.floor(canvas.width / resolution);
const rows = Math.floor(canvas.height / resolution);

window.addEventListener('resize', () => {
    const newScreenWidth = window.innerWidth;
    canvas.width = Math.min(newScreenWidth - 20, maxCanvasWidth);
    canvas.height = canvas.width;

    grid = buildGrid();
    renderGrid();
});

let grid = buildGrid();
let isRunning = false;
let isMouseDown = false;

function buildGrid() {
    return new Array(cols).fill(null).map(() =>
        new Array(rows).fill(null).map(() => 0)
    );
}

function updateGrid() {
    const nextGrid = grid.map(arr => [...arr]);

    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const cell = grid[col][row];
            const neighbors = countNeighbors(grid, col, row);

            if (cell === 1 && (neighbors < 2 || neighbors > 3)) {
                nextGrid[col][row] = 0;
            } else if (cell === 0 && neighbors === 3) {
                nextGrid[col][row] = 1;
            }
        }
    }

    grid = nextGrid;
}

function countNeighbors(grid, x, y) {
    let count = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i === 0 && j === 0) continue;
            const col = (x + i + cols) % cols;
            const row = (y + j + rows) % rows;
            count += grid[col][row];
        }
    }
    return count;
}

function renderGrid() {
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const cell = grid[col][row];
            ctx.beginPath();
            ctx.rect(col * resolution, row * resolution, resolution, resolution);
            ctx.fillStyle = cell ? 'aqua' : 'black';
            ctx.fill();
            ctx.stroke();
        }
    }
}

function loop() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid();
    updateGrid();
    requestAnimationFrame(loop);
}

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    toggleCell(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown) toggleCell(e);
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
});

function toggleCell(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / resolution);
    const y = Math.floor((e.clientY - rect.top) / resolution);

    if (x >= 0 && y >= 0 && x < cols && y < rows) {
        grid[x][y] = 1;
        renderGrid();
    }
}

document.getElementById('startButton').addEventListener('click', () => {
    isRunning = true;
    loop();
});

document.getElementById('stopButton').addEventListener('click', () => {
    isRunning = false;
});

document.getElementById('resetButton').addEventListener('click', () => {
    grid = buildGrid();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid();
});

document.getElementById('randomizeBtn').addEventListener('click', () => {
    grid = grid.map(row => row.map(() => (Math.random() > 0.5 ? 1 : 0)));
    renderGrid();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    toggleCell(e.touches[0]);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isMouseDown) toggleCell(e.touches[0]);
});

canvas.addEventListener('touchend', () => {
    isMouseDown = false;
});

renderGrid();