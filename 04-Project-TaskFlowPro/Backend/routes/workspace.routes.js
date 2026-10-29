import express from 'express';
import { 
    createWorkspace, 
    getUserWorkspaces, 
    getWorkspaceById, 
    addWorkspaceMember 
} from '../controllers/workspace.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createWorkspace)
    .get(protect, getUserWorkspaces);

router.route('/:id')
    .get(protect, getWorkspaceById);

router.route('/:id/members')
    .post(protect, addWorkspaceMember);

export default router;