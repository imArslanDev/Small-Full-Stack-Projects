import express from 'express';
import { 
    getWorkspaceTasks, 
    createTask, 
    updateTaskStatus, 
    addTaskComment 
} from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/:workspaceId')
    .get(protect, getWorkspaceTasks)
    .post(protect, createTask);

router.route('/:taskId/status')
    .patch(protect, updateTaskStatus);

router.route('/:taskId/comments')
    .post(protect, addTaskComment);

export default router;