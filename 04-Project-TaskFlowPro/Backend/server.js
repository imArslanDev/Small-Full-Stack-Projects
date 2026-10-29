import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import taskRoutes from './routes/task.routes.js';
import Message from './models/message.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH"]
    }
});

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/tasks', taskRoutes);

// Socket.io Real-Time Engine
io.on('connection', (socket) => {
    console.log(`⚡ User Connected: ${socket.id}`);

    // Join Workspace Room
    socket.on('join_workspace', (workspaceId) => {
        socket.join(workspaceId);
        console.log(`User joined workspace room: ${workspaceId}`);
    });

    // Real-Time Task Kanban Update / Move
    socket.on('task_updated', (data) => {
        // data contains workspaceId and updated task info
        socket.to(data.workspaceId).emit('receive_task_update', data);
    });

    // Real-Time Workspace Chat Message
    socket.on('send_message', async (data) => {
        try {
            const { workspaceId, senderId, text } = data;
            const message = await Message.create({
                workspace: workspaceId,
                sender: senderId,
                text
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username email avatar');

            // Broadcast message to everyone in the workspace room except sender
            io.to(workspaceId).emit('receive_message', populatedMessage);
        } catch (error) {
            console.error('Socket message error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔥 User Disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('TaskFlow Pro Database Connected Successfully! 🗄️');
        server.listen(PORT, () => {
            console.log(`Server & Socket running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error);
    });