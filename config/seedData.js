const db = require('./database');

// Sample book data
const books = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', price: 14.99, quantity: 50 },
    { title: '1984', author: 'George Orwell', isbn: '9780451524935', price: 12.99, quantity: 75 },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780446310789', price: 15.99, quantity: 60 },
    { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', price: 9.99, quantity: 45 },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769488', price: 11.99, quantity: 55 }
];

// Sample customer names for orders
const customerNames = ['John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis', 'James Miller'];

// Function to insert books
async function insertBooks() {
    const insertBookPromises = books.map(book => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO books (title, author, isbn, price, quantity) VALUES (?, ?, ?, ?, ?)',
                [book.title, book.author, book.isbn, book.price, book.quantity],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    });

    await Promise.all(insertBookPromises);
    console.log('Sample books inserted successfully');
}

// Function to create sample orders
async function createOrders() {
    // Get all books first
    const booksFromDb = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM books', [], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });

    // Create orders
    for (const customerName of customerNames) {
        // Randomly select 1-3 books for each order
        const orderBooks = [];
        const numBooks = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numBooks; i++) {
            const randomBook = booksFromDb[Math.floor(Math.random() * booksFromDb.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            orderBooks.push({
                bookId: randomBook.id,
                quantity: quantity,
                price: randomBook.price
            });
        }

        // Calculate total amount
        const totalAmount = orderBooks.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create order
        await new Promise((resolve, reject) => {
            db.run('BEGIN TRANSACTION');

            db.run(
                'INSERT INTO orders (customer_name, total_amount, status) VALUES (?, ?, ?)',
                [customerName, totalAmount, 'pending'],
                async function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                    }

                    const orderId = this.lastID;

                    try {
                        // Insert order items
                        for (const item of orderBooks) {
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
                        resolve();
                    } catch (error) {
                        db.run('ROLLBACK');
                        reject(error);
                    }
                }
            );
        });
    }

    console.log('Sample orders created successfully');
}

// Main function to seed data
async function seedData() {
    try {
        await insertBooks();
        await createOrders();
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

module.exports = {
    insertBooks,
    createOrders,
    seedData
};