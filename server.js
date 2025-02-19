const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();
const PORT = 5001;
const SECRET_KEY = "your_secret_key";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Change if needed
    password: '', // Add your MySQL password
    database: 'easygro'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

// Signup Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) {
            return res.status(500).json({ message: 'User already exists or error occurred' });
        }
        res.json({ message: 'Signup successful!' });
    });
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ user_id: user.id, username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token, user_id: user.id });
    });
});

// Add Product to Cart (Fix)
app.post('/cart', (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || quantity < 1) {
        return res.status(400).json({ error: "Invalid cart data" });
    }

    db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
        [user_id, product_id, quantity, quantity], (err) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Added to cart successfully' });
        }
    );
});

// Get Cart Items (Fix)
app.get('/cart/:user_id', (req, res) => {
    const { user_id } = req.params;

    db.query(`SELECT cart.id, products.name, products.price, products.image, cart.quantity 
              FROM cart JOIN products ON cart.product_id = products.id WHERE cart.user_id = ?`, [user_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching cart items' });
        res.json(results);
    });
});

// Remove Item from Cart (Fix)
app.delete('/cart/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM cart WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error removing item' });
        res.json({ message: 'Item removed successfully' });
    });
});

// Update Cart Quantity (Fix)
app.put('/cart/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id], (err) => {
        if (err) return res.status(500).json({ error: 'Error updating cart item' });
        res.json({ message: 'Cart updated successfully' });
    });
});
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
