const db = require('../config/database');

class BookRepository {
    // Get all books
    async getAllBooks() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM books', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    // Get a book by ID
    async getBookById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // Create a new book
    async createBook(book) {
        return new Promise((resolve, reject) => {
            const { title, author, isbn, price, quantity } = book;
            db.run(
                'INSERT INTO books (title, author, isbn, price, quantity) VALUES (?, ?, ?, ?, ?)',
                [title, author, isbn, price, quantity],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: this.lastID, ...book });
                }
            );
        });
    }

    // Update a book
    async updateBook(id, updates) {
        const fields = Object.keys(updates)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(updates), id];

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE books SET ${fields} WHERE id = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    }

    // Update book quantity
    async updateQuantity(id, quantity) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE books SET quantity = ? WHERE id = ?',
                [quantity, id],
                function(err) {
                    if (err) reject(err);
                    resolve({ changes: this.changes });
                }
            );
        });
    }

    // Delete a book
    async deleteBook(id) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                resolve({ changes: this.changes });
            });
        });
    }
}

module.exports = new BookRepository();