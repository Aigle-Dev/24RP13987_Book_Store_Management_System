const request = require('supertest');
const express = require('express');
const inventoryRoutes = require('../routes/inventoryRoutes');
const db = require('../config/database');

const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRoutes);

describe('Inventory Routes', () => {
    beforeAll(async () => {
        // Setup test database if needed
    });

    afterAll(async () => {
        await new Promise((resolve) => db.close(() => resolve()));
    });

    describe('GET /api/inventory', () => {
        it('should return all books', async () => {
            const res = await request(app).get('/api/inventory');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
        });
    });

    describe('GET /api/inventory/:id', () => {
        it('should return a single book', async () => {
            const res = await request(app).get('/api/inventory/1');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('id');
            expect(res.body).toHaveProperty('title');
            expect(res.body).toHaveProperty('author');
            expect(res.body).toHaveProperty('quantity');
        });

        it('should return 404 for non-existent book', async () => {
            const res = await request(app).get('/api/inventory/999');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/inventory/:id', () => {
        it('should update book quantity', async () => {
            const updateData = { quantity: 10 };
            const res = await request(app)
                .put('/api/inventory/1')
                .send(updateData);
            expect(res.statusCode).toBe(200);
            expect(res.body.quantity).toBe(10);
        });
    });
});