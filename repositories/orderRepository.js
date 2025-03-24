const db = require('../config/database');

class OrderRepository {
    // Get all orders
    async getAllOrders() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM orders', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    // Get an order by ID with its items
    async getOrderById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM orders WHERE id = ?', [id], async (err, order) => {
                if (err) reject(err);
                if (!order) {
                    resolve(null);
                    return;
                }

                try {
                    // Get order items
                    const items = await this.getOrderItems(id);
                    order.items = items;
                    resolve(order);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    // Get order items
    async getOrderItems(orderId) {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT oi.*, b.title, b.author 
                FROM order_items oi 
                JOIN books b ON oi.book_id = b.id 
                WHERE oi.order_id = ?`,
                [orderId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }

    // Create a new order
    async createOrder(orderData) {
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            throw new Error('Order must contain at least one item');
        }

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION', async (err) => {
                    if (err) return reject(err);
                    
                    try {
                        // Insert order
                        const order = await new Promise((resolve, reject) => {
                            db.run(
                                'INSERT INTO orders (customer_name, total_amount, status) VALUES (?, ?, ?)',
                                [orderData.customer_name, orderData.total_amount, 'pending'],
                                function(err) {
                                    if (err) reject(err);
                                    resolve(this.lastID);
                                }
                            );
                        });

                        const orderId = order;

                        // Insert order items
                        await Promise.all(orderData.items.map(item => {
                            return new Promise((resolve, reject) => {
                                db.run(
                                    'INSERT INTO order_items (order_id, book_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                                    [orderId, item.book_id, item.quantity, item.price],
                                    (err) => {
                                        if (err) reject(err);
                                        resolve();
                                    }
                                );
                            });
                        }));

                        // Commit transaction
                        await new Promise((resolve, reject) => {
                            db.run('COMMIT', (err) => {
                                if (err) reject(err);
                                resolve();
                            });
                        });

                        resolve({ id: orderId, ...orderData });
                    } catch (error) {
                        // Rollback on any error
                        db.run('ROLLBACK', () => {
                            reject(error);
                        });
                    }
                });
            });
        });
    }

    // Update order status
    async updateOrderStatus(id, status) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, id],
                function(err) {
                    if (err) reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    }

    // Delete an order
    async deleteOrder(id) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run('DELETE FROM order_items WHERE order_id = ?', [id], (err) => {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        db.run('COMMIT');
                        resolve({ changes: this.changes });
                    });
                });
            });
        });
    }
}

module.exports = new OrderRepository();