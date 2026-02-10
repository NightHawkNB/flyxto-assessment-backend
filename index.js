import express from 'express';
import { createServer } from 'http';
import multer from 'multer';
import { handleFileUpload } from './fileUploadHandler.js';
import "dotenv/config";

// Socket modules
import { Server } from "socket.io";
import cors from 'cors';

const app = express()
const port = 4000
const upload = multer({ storage: multer.memoryStorage() });

const server = createServer(app);

// Socket initialization
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

let tasks = [];

// Socket connection handling
io.on("connection", (socket) => {
    console.log("A user connected: " + socket.id);

    // Handling 'task update' event
    socket.on('task update', (msg) => {
        console.log('Message Received: ' + msg);

        // socket.broadcast.emit() sends the message to all clients except the sender
        socket.broadcast.emit('task update', `${socket.id} said: ${msg}`);

        // io.emit() sends the message to all clients including the sender
        // io.emit('chat message', `${socket.id} said: ${msg}`);
    });

    // Handling disconection event
    socket.on("disconnect", () => {
        console.log("A user disconnected: " + socket.id);
    })
});

app.post("/api/uploadthing", upload.single("file"), handleFileUpload);

app.get('/api/tasks', (req, res) => {
    res.status(200).json(tasks);
})

app.get('/api/tasks/:id', (req, res) => {
    const id = Number.parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);

    if (task) {
        res.status(200).json(task);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
})

app.post('/api/tasks', (req, res) => {
    const task = req.body;
    task.id = tasks.length + 1;
    tasks.push(task);
    res.status(201).json(task);
})

app.delete('/api/tasks/:id', (req, res) => {
    const id = Number.parseInt(req.params.id);
    const index = tasks.findIndex(t => t.id === id);

    if (index !== -1) {
        tasks.splice(index, 1);
        res.status(200).send();
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
})

app.put('/api/tasks/:id', (req, res) => {
    const id = Number.parseInt(req.params.id);
    const index = tasks.findIndex(t => t.id === id);

    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...req.body };
        res.status(200).json(tasks[index]);
    } else {
        res.status(404).json({ message: 'Task not found' });
    }
})

server.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
