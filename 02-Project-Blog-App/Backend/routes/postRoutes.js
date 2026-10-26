import express from 'express';
import Post from '../models/Post.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all posts (with search & author details populated)
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' }; // Case-insensitive search
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const posts = await Post.find(query)
            .populate('author', 'username email') // Fetches author details instead of just ObjectId
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/posts
// @desc    Create a new post
router.post('/', protect, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = await Post.create({
            title,
            content,
            category: category || 'General',
            author: req.user // From protect middleware
        });

        const populatedPost = await post.populate('author', 'username email');
        res.status(201).json(populatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/posts/:id
// @desc    Update a post (Only Author can update)
router.put('/:id', protect, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Authorization Check: Is logged-in user the author?
        if (post.author.toString() !== req.user) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('author', 'username email');
            
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post (Only Author can delete)
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Authorization Check: Is logged-in user the author?
        if (post.author.toString() !== req.user) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;