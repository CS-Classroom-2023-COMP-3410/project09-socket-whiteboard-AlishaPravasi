const socket = io('http://localhost:3000'); // Connect to backend server

const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let drawing = false;
let color = 'black';
let lastX = 0, lastY = 0;

// Function to start drawing
function startDrawing(x, y) {
    drawing = true;
    lastX = x;
    lastY = y;
}

// Function to draw locally and send to server
function draw(x, y) {
    if (!drawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Send drawing data to server with acknowledgment
    socket.emit('draw', { lastX, lastY, x, y, color }, (response) => {
        console.log(response); // Log acknowledgment from server
    });

    lastX = x;
    lastY = y;
}

// Stop drawing function
function stopDrawing() {
    drawing = false;
}

// Event listeners for user drawing
canvas.addEventListener('mousedown', (event) => startDrawing(event.offsetX, event.offsetY));
canvas.addEventListener('mousemove', (event) => draw(event.offsetX, event.offsetY));
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Listen for drawing events from the server
socket.on('draw', (data) => {
    ctx.beginPath();
    ctx.moveTo(data.lastX, data.lastY);
    ctx.lineTo(data.x, data.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 2;
    ctx.stroke();
});

// Load board state when connecting
socket.on('loadBoard', (boardData) => {
    boardData.forEach((data) => {
        ctx.beginPath();
        ctx.moveTo(data.lastX, data.lastY);
        ctx.lineTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
});

// Clear board button
document.getElementById('clear').addEventListener('click', () => {
    socket.emit('clearBoard', (response) => {
        console.log(response); // Log acknowledgment from server
    });
});

// Listen for board clear event
socket.on('clearBoard', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
