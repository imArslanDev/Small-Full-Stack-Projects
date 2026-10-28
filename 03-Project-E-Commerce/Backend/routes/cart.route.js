import express from 'express';
import Cart from '../models/Cart.model.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   GET /api/cart
// @desc    Get logged-in user's cart with product details populated
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/cart
// @desc    Add or update item quantity in cart
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ product: productId, quantity: Number(quantity) || 1 }]
            });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                // Product already exists in cart, update quantity
                cart.items[itemIndex].quantity = Number(quantity);
            } else {
                // Add new product
                cart.items.push({ product: productId, quantity: Number(quantity) || 1 });
            }

            await cart.save();
        }

        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove an item from cart
router.delete('/:productId', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
        await cart.save();

        cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;