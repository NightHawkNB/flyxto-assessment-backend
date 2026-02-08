import express from 'express';
import multer from 'multer';
import { handleFileUpload } from './fileUploadHandler.js';
import "dotenv/config";

const app = express()
const port = 4000
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

let tasks = [];

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
