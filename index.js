const express = require('express');
const app = express();

// Middleware for parsing JSON bodies
app.use(express.json());

// Import routes
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');

// Use routes
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});