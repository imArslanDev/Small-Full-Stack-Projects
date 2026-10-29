import Task from '../models/task.model.js';
import Workspace from '../models/workspace.model.js';

// @desc    Get all tasks for a workspace
// @route   GET /api/tasks/:workspaceId
export const getWorkspaceTasks = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const tasks = await Task.find({ workspace: workspaceId })
            .populate('assignedTo', 'username email avatar')
            .populate('comments.user', 'username email avatar')
            .sort({ order: 1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new task in a workspace
// @route   POST /api/tasks/:workspaceId
export const createTask = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { title, description, status, priority, assignedTo, dueDate } = req.body;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        const taskCount = await Task.countDocuments({ workspace: workspaceId, status: status || 'To Do' });

        const task = await Task.create({
            workspace: workspaceId,
            title,
            description,
            status: status || 'To Do',
            priority: priority || 'Medium',
            assignedTo: assignedTo || [],
            dueDate,
            order: taskCount
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'username email avatar');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status or Kanban order (Drag & Drop)
// @route   PATCH /api/tasks/:taskId/status
export const updateTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status, order } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (status) task.status = status;
        if (order !== undefined) task.order = order;

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('assignedTo', 'username email avatar')
            .populate('comments.user', 'username email avatar');

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:taskId/comments
export const addTaskComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.comments.push({
            user: req.user._id,
            text
        });

        await task.save();

        const updatedTask = await Task.findById(taskId)
            .populate('assignedTo', 'username email avatar')
            .populate('comments.user', 'username email avatar');

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};