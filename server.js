import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store board state
const boardState = [];

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Send full board state to new clients
    socket.emit('loadBoard', boardState);

    // Handle drawing events
    socket.on('draw', (data, callback) => {
        boardState.push(data);  // Store stroke
        socket.broadcast.emit('draw', data);  // Broadcast to all except sender
        callback('Stroke received');  // Acknowledge receipt
    });

    // Handle board clearing
    socket.on('clearBoard', (callback) => {
        boardState.length = 0;
        io.emit('clearBoard');  // Clear for all clients
        callback('Board cleared');  // Acknowledge action
    });

    socket.on('disconnect', () => {
        console.log(`A user disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
