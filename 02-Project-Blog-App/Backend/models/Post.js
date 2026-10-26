import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true, 
        default: 'General' 
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
export default Post;