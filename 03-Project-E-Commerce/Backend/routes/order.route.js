import express from 'express';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order from cart and clear cart
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // Prepare order items and calculate total amount
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));

        const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const order = await Order.create({
            user: req.user._id,
            orderItems,
            shippingAddress,
            totalAmount
        });

        // Clear user's cart after successful order placement
        cart.items = [];
        await cart.save();

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged-in user's orders
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('orderItems.product').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'username email').populate('orderItems.product').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;