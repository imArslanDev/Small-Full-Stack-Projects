import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;