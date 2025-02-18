require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET;

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// User Registration with Validation
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    try {
        // Check if username exists
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) return res.status(500).json({ message: "Database error." });
            if (results.length > 0) return res.status(400).json({ message: "Username already taken." });

            // Hash password and insert user
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: "Database error." });
                res.json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
});

// User Login with Validation
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error." });
        if (results.length === 0) return res.status(401).json({ message: "Invalid username or password." });

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: "Invalid username or password." });

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware to authenticate users
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.userId = decoded.userId;
        req.username = decoded.username; // Ensure username is assigned
        next();
    });
};

// Fetch logged-in user details
app.get('/user', authenticate, (req, res) => {
    db.query('SELECT id, username FROM users WHERE id = ?', [req.userId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result[0]);
    });
});

// CRUD for Categories
app.get('/categories', authenticate, (req, res) => {
    db.query('SELECT * FROM categories WHERE user_id = ?', [req.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/categories', authenticate, (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO categories (name, user_id) VALUES (?, ?)', [name, req.userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ id: result.insertId, name });
    });
});

app.put('/categories/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    db.query('UPDATE categories SET name = ? WHERE id = ? AND user_id = ?', [name, id, req.userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Category updated successfully' });
    });
});

app.delete('/categories/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, req.userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Category and related expenses deleted successfully' });
    });
});

// CRUD for Expenses
app.get('/expenses/:categoryId', authenticate, (req, res) => {
    const { categoryId } = req.params;
    db.query('SELECT * FROM expenses WHERE category_id = ? AND user_id = ?', [categoryId, req.userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/expenses', authenticate, (req, res) => {
    const { category_id, item, quantity, price } = req.body;
    db.query('INSERT INTO expenses (category_id, item, quantity, price, user_id) VALUES (?, ?, ?, ?, ?)',
        [category_id, item, quantity, price, req.userId],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId, item, quantity, price });
        }
    );
});

app.put('/expenses/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const { item, quantity, price } = req.body;
    db.query('UPDATE expenses SET item = ?, quantity = ?, price = ? WHERE id = ? AND user_id = ?',
        [item, quantity, price, id, req.userId],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Expense updated successfully' });
        }
    );
});

app.delete('/expenses/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, req.userId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Expense deleted successfully' });
    });
});

// Report Settings - Save user preferences
app.post('/report-settings', authenticate, (req, res) => {
    const { enabled, frequency, email } = req.body;

    db.query(
        `INSERT INTO report_settings (user_id, enabled, frequency, email) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE enabled = ?, frequency = ?, email = ?`,
        [req.userId, enabled, frequency, email, enabled, frequency, email],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Report settings updated successfully" });
        }
    );
});

// Report Settings - Fetch user preferences
app.get('/report-settings', authenticate, (req, res) => {
    db.query(
        'SELECT enabled, frequency, email FROM report_settings WHERE user_id = ?',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) return res.json({ enabled: false, frequency: "weekly", email: "" });
            res.json(results[0]);
        }
    );
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
