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
                if (!order) resolve(null);

                // Get order items
                const items = await this.getOrderItems(id);
                order.items = items;
                resolve(order);
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
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(
                    'INSERT INTO orders (customer_name, total_amount, status) VALUES (?, ?, ?)',
                    [orderData.customerName, orderData.totalAmount, 'pending'],
                    async function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        const orderId = this.lastID;

                        try {
                            // Insert order items
                            for (const item of orderData.books) {
                                await new Promise((resolve, reject) => {
                                    db.run(
                                        'INSERT INTO order_items (order_id, book_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                                        [orderId, item.bookId, item.quantity, item.price],
                                        (err) => {
                                            if (err) reject(err);
                                            resolve();
                                        }
                                    );
                                });
                            }

                            db.run('COMMIT');
                            resolve({ id: orderId, ...orderData });
                        } catch (error) {
                            db.run('ROLLBACK');
                            reject(error);
                        }
                    }
                );
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