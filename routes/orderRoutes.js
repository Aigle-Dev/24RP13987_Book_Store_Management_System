const express = require('express');
const router = express.Router();
const orderRepository = require('../repositories/orderRepository');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await orderRepository.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Get a specific order
router.get('/:id', async (req, res) => {
    try {
        const order = await orderRepository.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching order' });
    }
});

// Create a new order
router.post('/', async (req, res) => {
    try {
        const { customer_name, items } = req.body;
        if (!customer_name || !items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid order data' });
        }
        
        const total_amount = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        const order = await orderRepository.createOrder({
            customer_name,
            items,
            total_amount
        });
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Update an order
router.put('/:id', async (req, res) => {
    try {
        const result = await orderRepository.updateOrderStatus(req.params.id, req.body.status);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
});

// Delete an order
router.delete('/:id', async (req, res) => {
    try {
        const result = await orderRepository.deleteOrder(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});

module.exports = router;