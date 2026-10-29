import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['To Do', 'In Progress', 'Under Review', 'Completed'], 
        default: 'To Do' 
    },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    order: { type: Number, default: 0 }, // Order index for Kanban position sync
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
    attachments: [{ type: String }],
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;