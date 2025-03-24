const request = require('supertest');
const express = require('express');
const orderRoutes = require('../routes/orderRoutes');
const db = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
    beforeAll(async () => {
        // Setup test database
        await require('../config/seedData').insertBooks();
        await require('../config/seedData').createOrders();
    });

    afterAll(async () => {
        await new Promise((resolve) => db.close(() => resolve()));
    });

    describe('GET /api/orders', () => {
        it('should return all orders', async () => {
            const res = await request(app).get('/api/orders');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should return a single order', async () => {
            const res = await request(app).get('/api/orders/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('customer_name');
            expect(res.body).toHaveProperty('total_amount');
        });

        it('should return 404 for non-existent order', async () => {
            const res = await request(app).get('/api/orders/999');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/orders', () => {
        it('should create a new order', async () => {
            const newOrder = {
                customer_name: 'Test Customer',
                items: [
                    { book_id: 1, quantity: 2, price: 29.99 }
                ]
            };
            const res = await request(app)
                .post('/api/orders')
                .send(newOrder);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
        });
    });
});