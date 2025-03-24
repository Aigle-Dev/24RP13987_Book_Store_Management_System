const express = require('express');
const router = express.Router();
const bookRepository = require('../repositories/bookRepository');

// Get all books in inventory
router.get('/', async (req, res) => {
    try {
        const books = await bookRepository.getAllBooks();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Get a specific book
router.get('/:id', async (req, res) => {
    try {
        const book = await bookRepository.getBookById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book' });
    }
});

// Add a new book to inventory
router.post('/', async (req, res) => {
    try {
        const book = await bookRepository.createBook({
            title: req.body.title,
            author: req.body.author,
            isbn: req.body.isbn,
            price: req.body.price,
            quantity: req.body.quantity || 0
        });
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ message: 'Error creating book' });
    }
});

// Update book information
router.put('/:id', async (req, res) => {
    try {
        const result = await bookRepository.updateBook(req.params.id, req.body);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const updatedBook = await bookRepository.getBookById(req.params.id);
        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Error updating book' });
    }
});

// Update book quantity
router.patch('/:id/quantity', async (req, res) => {
    try {
        const result = await bookRepository.updateQuantity(req.params.id, req.body.quantity);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        const updatedBook = await bookRepository.getBookById(req.params.id);
        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: 'Error updating book quantity' });
    }
});

// Delete a book from inventory
router.delete('/:id', async (req, res) => {
    try {
        const result = await bookRepository.deleteBook(req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting book' });
    }
});

module.exports = router;