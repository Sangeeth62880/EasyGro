const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs'); // Change this line
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
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
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
        console.log(user);
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ user_id: user.id, username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token, user_id: user.id });
    });
});

// Improved Cart Route with Error Handling
app.post('/cart', (req, res) => {
    const { user_id, product_id, quantity = 1 } = req.body; // Default quantity to 1 if not provided

    if (!user_id || !product_id || isNaN(user_id)) {
        return res.status(400).json({ error: 'Invalid user_id or product_id' });
    }

    console.log('Adding to cart:', { user_id, product_id }); // Debug log

    // First check if product exists
    const checkProduct = 'SELECT id FROM products WHERE id = ?';
    db.query(checkProduct, [product_id], (err, productResults) => {
        if (err) {
            console.error('Product check error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if item already in cart
        const checkCart = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
        db.query(checkCart, [user_id, product_id], (err, cartResults) => {
            if (err) {
                console.error('Cart check error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (cartResults.length > 0) {
                // Update existing cart item
                const updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
                db.query(updateQuery, [quantity, user_id, product_id], (err) => {
                    if (err) {
                        console.error('Update cart error:', err);
                        return res.status(500).json({ error: 'Error updating cart' });
                    }
                    res.json({ message: 'Cart updated successfully' });
                });
            } else {
                // Add new cart item
                const insertQuery = 'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)';
                db.query(insertQuery, [user_id, product_id, quantity], (err) => {
                    if (err) {
                        console.error('Insert cart error:', err);
                        return res.status(500).json({ error: 'Error adding to cart' });
                    }
                    res.json({ message: 'Added to cart successfully' });
                });
            }
        });
    });
});

// Get Cart Items (Fix)
app.get('/cart/:user_id', (req, res) => {
    const { user_id } = req.params;
    const query = `
        SELECT c.id, c.quantity, p.name, p.price, p.image , c.product_id
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ error: 'Error fetching cart' });
        }
        // Convert price to number before sending
        const cartItems = results.map(item => ({
            ...item,
            price: parseFloat(item.price)
        }));
        res.json(cartItems);
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

// Add this after existing routes
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching products' });
        res.json(results);
    });
});

// Add this route after existing /products route
app.get('/products/filter', (req, res) => {
    const { category, sortPrice } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    if (category && category !== 'all') {
        query += ' WHERE category = ?';
        params.push(category);
    }

    if (sortPrice) {
        query += ' ORDER BY price';
        query += sortPrice === 'asc' ? ' ASC' : ' DESC';
    }

    console.log('Query:', query); // Debug log

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.json(results);
    });
});

app.post('/checkout/:user_id', (req, res) => {
    const { user_id } = req.params;

    // Begin transaction
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: 'Transaction error' });
        }

        // Get cart items
        const getCartItems = 'SELECT product_id, quantity FROM cart WHERE user_id = ?';
        db.query(getCartItems, [user_id], (err, cartItems) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ error: 'Error fetching cart items' });
                });
            }

            // Insert into inventory
            const insertInventory = 'INSERT INTO inventory (user_id, product_id, quantity) VALUES ?';
            const values = cartItems.map(item => [user_id, item.product_id, item.quantity]);

            db.query(insertInventory, [values], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error adding to inventory' });
                    });
                }

                // Clear cart
                const clearCart = 'DELETE FROM cart WHERE user_id = ?';
                db.query(clearCart, [user_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Error clearing cart' });
                        });
                    }

                    // Commit transaction
                    db.commit(err => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ error: 'Error completing checkout' });
                            });
                        }
                        res.json({ message: 'Checkout successful' });
                    });
                });
            });
        });
    });
});

app.get('/inventory/:user_id', (req, res) => {
    const { user_id } = req.params;
    const query = `
        SELECT 
            p.id,
            p.name,
            p.image,
            COALESCE(i.quantity, 0) as quantity
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id AND i.user_id = ?
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Error fetching inventory' });
        }
        res.json(results);
    });
});

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
