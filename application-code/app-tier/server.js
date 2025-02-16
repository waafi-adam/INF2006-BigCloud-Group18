// Required Dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('Database connected');
});

// Register User Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';

        db.query(sql, [username, email, hashedPassword], (err) => {
            if (err) return res.status(400).json({ message: 'User already exists' });
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login User Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = result[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware for Authentication
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Get Grocery List
app.get('/items', authenticate, (req, res) => {
    db.query('SELECT * FROM grocery_list WHERE user_id = ?', [req.user.user_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error retrieving list' });
        res.json(results);
    });
});

// Add Item to Grocery List
app.post('/items', authenticate, (req, res) => {
    const { item_name, quantity, price } = req.body;

    if (!item_name || !quantity || !price) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'INSERT INTO grocery_list (user_id, item_name, quantity, price) VALUES (?, ?, ?, ?)';
    db.query(sql, [req.user.user_id, item_name, quantity, price], (err) => {
        if (err) return res.status(500).json({ message: 'Error adding item' });
        res.status(201).json({ message: 'Item added successfully' });
    });
});
// Update Item in Grocery List
app.put('/items/:id', authenticate, (req, res) => {
    const { item_name, quantity, price } = req.body;
    const item_id = req.params.id;

    if (!item_id || isNaN(item_id)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }
    if (!item_name || !quantity || !price) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const sql = 'UPDATE grocery_list SET item_name = ?, quantity = ?, price = ? WHERE item_id = ? AND user_id = ?';
    db.query(sql, [item_name, quantity, price, item_id, req.user.user_id], (err, result) => {
        if (err) {
            console.error('Database Update Error:', err);
            return res.status(500).json({ message: 'Error updating item' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found or user not authorized' });
        }

        res.json({ message: 'Item updated successfully' });
    });
});

// Delete Item from Grocery List
app.delete('/items/:id', authenticate, (req, res) => {
    const item_id = req.params.id;

    if (!item_id || isNaN(item_id)) {
        return res.status(400).json({ message: 'Invalid item ID' });
    }

    db.query('DELETE FROM grocery_list WHERE item_id = ? AND user_id = ?', [item_id, req.user.user_id], (err, result) => {
        if (err) {
            console.error("Delete Query Error:", err);
            return res.status(500).json({ message: 'Error deleting item' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found or already deleted' });
        }

        res.json({ message: 'Item deleted successfully' });
    });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
