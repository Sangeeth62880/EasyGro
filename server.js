const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 5001;
const SECRET_KEY = "your_secret_key";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public', 'images'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|webp/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg, and .webp formats allowed'));
    }
});

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'easygro'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Serve static files from public directory before routes
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve the login page (MUST be after static middleware)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Auth Routes
app.post('/signup', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err) => {
        if (err) {
            return res.status(500).json({ message: 'User already exists or error occurred' });
        }
        res.json({ message: 'Signup successful!' });
    });
});

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

        const token = jwt.sign({ user_id: user.id, username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token, user_id: user.id, role: user.role });
    });
});

// Middleware for checking JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Protected admin route
app.get('/admin', authenticateToken, (req, res) => {
    if (req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, 'public', 'admin_dash.html'));
    } else {
        res.sendStatus(403);
    }
});

// Protected user route
app.get('/user', authenticateToken, (req, res) => {
    if (req.user.role === 'user') {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.sendStatus(403);
    }
});

// Cart Routes
app.post('/cart', (req, res) => {
    const { user_id, product_id, quantity = 1 } = req.body;

    if (!user_id || !product_id || isNaN(user_id)) {
        return res.status(400).json({ error: 'Invalid user_id or product_id' });
    }

    const checkProduct = 'SELECT id FROM products WHERE id = ?';
    db.query(checkProduct, [product_id], (err, productResults) => {
        if (err) {
            console.error('Product check error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (productResults.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const checkCart = 'SELECT * FROM cart WHERE user_id = ? AND product_id = ?';
        db.query(checkCart, [user_id, product_id], (err, cartResults) => {
            if (err) {
                console.error('Cart check error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (cartResults.length > 0) {
                const updateQuery = 'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?';
                db.query(updateQuery, [quantity, user_id, product_id], (err) => {
                    if (err) {
                        console.error('Update cart error:', err);
                        return res.status(500).json({ error: 'Error updating cart' });
                    }
                    res.json({ message: 'Cart updated successfully' });
                });
            } else {
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

app.post('/api/products', upload.single('image'), (req, res) => {
    const { name, category, price } = req.body;
    const image = req.file ? `images/${req.file.filename}` : 'images/guava.jpg'; // Use default image if none is uploaded

    console.log('Received product data:', { name, category, price, image });

    if (!name || !category || !price) {
        console.error('Missing required fields:', { name, category, price });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO products (name, category, price, image) VALUES (?, ?, ?, ?)';
    db.query(query, [name, category, parseFloat(price), image], (err, result) => {
        if (err) {
            console.error('Database error:', err.sqlMessage || err);
            return res.status(500).json({ error: 'Database error', details: err.sqlMessage || err });
        }

        console.log('Product added successfully with ID:', result.insertId);
        res.status(201).json({
            id: result.insertId,
            message: 'Product added successfully'
        });
    });
});



app.get('/cart/:user_id', (req, res) => {
    const { user_id } = req.params;
    const query = `
        SELECT c.id, c.quantity, p.name, p.price, p.image, c.product_id
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching cart:', err);
            return res.status(500).json({ error: 'Error fetching cart' });
        }
        const cartItems = results.map(item => ({
            ...item,
            price: parseFloat(item.price)
        }));
        res.json(cartItems);
    });
});

app.delete('/cart/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM cart WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: 'Error removing item' });
        res.json({ message: 'Item removed successfully' });
    });
});

app.put('/cart/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    db.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id], (err) => {
        if (err) return res.status(500).json({ error: 'Error updating cart item' });
        res.json({ message: 'Cart updated successfully' });
    });
});

// Product Routes
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error fetching products' });
        res.json(results);
    });
});

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

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.json(results);
    });
});

// Checkout Route
app.post('/checkout/:user_id', (req, res) => {
    const { user_id } = req.params;

    db.beginTransaction(err => {
        if (err) {
            return res.status(500).json({ error: 'Transaction error' });
        }

        const getCartItems = 'SELECT product_id, quantity FROM cart WHERE user_id = ?';
        db.query(getCartItems, [user_id], (err, cartItems) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ error: 'Error fetching cart items' });
                });
            }

            const insertInventory = 'INSERT INTO inventory (user_id, product_id, quantity) VALUES ?';
            const values = cartItems.map(item => [user_id, item.product_id, item.quantity]);

            db.query(insertInventory, [values], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ error: 'Error adding to inventory' });
                    });
                }

                const clearCart = 'DELETE FROM cart WHERE user_id = ?';
                db.query(clearCart, [user_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ error: 'Error clearing cart' });
                        });
                    }

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

// Inventory Route
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

// Admin API Routes
app.get('/api/products', (req, res) => {
    console.log('Fetching products...');
    const query = 'SELECT id, name, price, image, category FROM products ORDER BY id DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        console.log(`Found ${results.length} products`);
        res.json(results);
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, price } = req.body;

    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO products (name, category, price) VALUES (?, ?, ?)';
    db.query(query, [name, category, parseFloat(price)], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: 'Error adding product' });
        }

        res.status(201).json({
            id: result.insertId,
            message: 'Product added successfully'
        });
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, price, stock = 0 } = req.body; // Ensure stock is included

    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)';
    db.query(query, [name, category, parseFloat(price), parseInt(stock)], (err, result) => {
        if (err) {
            console.error('Error adding product:', err);
            return res.status(500).json({ error: 'Error adding product' });
        }

        res.status(201).json({
            id: result.insertId,
            message: 'Product added successfully'
        });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;

    // First, remove the product from all carts
    db.query('DELETE FROM cart WHERE product_id = ?', [id], (err) => {
        if (err) {
            console.error('Error removing product from carts:', err);
            return res.status(500).json({ error: 'Error deleting product from carts' });
        }

        // After removing from carts, delete the product
        db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('Error deleting product:', err);
                return res.status(500).json({ error: 'Error deleting product' });
            }
            res.json({ message: 'Product deleted successfully' });
        });
    });
});


app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, price } = req.body;

    if (!name || !category || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'UPDATE products SET name = ?, category = ?, price = ? WHERE id = ?';
    db.query(query, [name, category, parseFloat(price), id], (err) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Error updating product' });
        }

        res.json({ message: 'Product updated successfully' });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const currentUser = 'Sangeeth62880';
    const currentTimestamp = '2025-03-06 07:24:55';

    // First check if product exists
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, productResults) => {
        if (err) {
            console.error('Error checking product:', err);
            return res.status(500).json({ 
                error: 'Error checking product',
                timestamp: currentTimestamp,
                user: currentUser
            });
        }

        if (productResults.length === 0) {
            return res.status(404).json({
                error: 'Product not found',
                timestamp: currentTimestamp,
                user: currentUser
            });
        }

        // Check if product is referenced in purchases
        db.query('SELECT * FROM purchases WHERE product_id = ?', [id], (err, purchaseResults) => {
            if (err) {
                console.error('Error checking purchases:', err);
                return res.status(500).json({ 
                    error: 'Error checking product usage',
                    timestamp: currentTimestamp,
                    user: currentUser
                });
            }

            if (purchaseResults.length > 0) {
                return res.status(400).json({
                    error: 'Cannot delete product as it has purchase history',
                    details: 'This product has been purchased and cannot be deleted',
                    timestamp: currentTimestamp,
                    user: currentUser
                });
            }

            // Get product image before deletion
            const productImage = productResults[0].image;

            // Delete the product
            db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
                if (err) {
                    console.error('Error deleting product:', err);
                    return res.status(500).json({ 
                        error: 'Error deleting product',
                        details: err.message,
                        timestamp: currentTimestamp,
                        user: currentUser
                    });
                }

                // Delete image file if it exists and is not a default image
                if (productImage && !productImage.includes('placeholder')) {
                    const imagePath = path.join(__dirname, 'public', productImage);
                    try {
                        if (fs.existsSync(imagePath)) {
                            fs.unlinkSync(imagePath);
                            console.log(`Deleted image file: ${imagePath}`);
                        }
                    } catch (error) {
                        console.error('Error deleting image file:', error);
                        // Continue execution even if image deletion fails
                    }
                }

                // Log the successful deletion
                console.log(`Product ${id} deleted by ${currentUser} at ${currentTimestamp}`);

                res.json({
                    message: 'Product deleted successfully',
                    timestamp: currentTimestamp,
                    user: currentUser,
                    deletedProduct: {
                        id: id,
                        name: productResults[0].name,
                        category: productResults[0].category
                    }
                });
            });
        });
    });
});

app.post('/api/products/:id/image', upload.single('image'), (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    db.query('SELECT image FROM products WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error getting current image:', err);
            return res.status(500).json({ error: 'Error updating product image' });
        }

        const imageUrl = `/images/${req.file.filename}`;

        db.query('UPDATE products SET image = ? WHERE id = ?', [imageUrl, id], (err) => {
            if (err) {
                console.error('Error updating product image:', err);
                // Delete uploaded file if database update fails
                try {
                    fs.unlinkSync(path.join(__dirname, 'public', 'images', req.file.filename));
                } catch (unlinkError) {
                    console.error('Error deleting uploaded file:', unlinkError);
                }
                return res.status(500).json({ error: 'Error updating product image' });
            }

            // Delete old image if it exists
            if (results[0] && results[0].image) {
                const oldImagePath = path.join(__dirname, 'public', results[0].image);
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (error) {
                    console.error('Error deleting old image file:', error);
                }
            }

            res.json({
                message: 'Product image updated successfully',
                imageUrl: imageUrl
            });
        });
    });
});

// Get all users
app.get('/api/users', (req, res) => {
    const query = `
        SELECT id, username, role, status, 
        last_login, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Error fetching users' });
        }
        res.json(results);
    });
});


// Add these routes to your server.js
app.get('/api/users', (req, res) => {
    const query = 'SELECT id, username, role FROM users';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ 
                error: 'Error fetching users',
                timestamp: getCurrentDateTime(),
                user: 'Sangeeth62880'
            });
        }
        
        // Transform the results to match the expected format
        const users = results.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            status: 'active', // Default status since it's not in your schema
            last_login: null  // Default last_login since it's not in your schema
        }));
        
        res.json(users);
    });
});

// User stats endpoint
app.get('/api/users/stats', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
            SUM(CASE WHEN role != 'admin' THEN 1 ELSE 0 END) as regular
        FROM users
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching user stats:', err);
            return res.status(500).json({ 
                error: 'Error fetching user stats',
                timestamp: getCurrentDateTime(),
                user: 'Sangeeth62880'
            });
        }
        
        res.json(results[0]);
    });
});

// Admin info endpoint
app.get('/api/admin/info', (req, res) => {
    res.json({
        username: 'Sangeeth62880',
        currentDateTime: getCurrentDateTime()
    });
});

// Helper function to get current datetime
function getCurrentDateTime() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}



// Get user stats
app.get('/api/users/stats', (req, res) => {
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
            SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular
        FROM users
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching user stats:', err);
            return res.status(500).json({ error: 'Error fetching user stats' });
        }
        res.json(results[0]);
    });
});

// Get single user
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, username, role, status FROM users WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// Create new user
app.post('/api/users', async (req, res) => {
    const { username, password, role, status } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, role || 'user', status || 'active'],
        (err, result) => {
            if (err) {
                console.error('Error creating user:', err);
                return res.status(500).json({ error: 'Error creating user' });
            }
            res.status(201).json({ id: result.insertId, message: 'User created successfully' });
        }
    );
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password, role, status } = req.body;

    let query = 'UPDATE users SET username = ?, role = ?, status = ?';
    let params = [username, role, status];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += ', password = ?';
        params.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.query(query, params, (err) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Error updating user' });
        }
        res.json({ message: 'User updated successfully' });
    });
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    // Prevent deletion of admin users
    db.query('SELECT role FROM users WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (results[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin users' });
        }

        db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('Error deleting user:', err);
                return res.status(500).json({ error: 'Error deleting user' });
            }
            res.json({ message: 'User deleted successfully' });
        });
    });
});

// Toggle user status
app.post('/api/users/:id/toggle-status', (req, res) => {
    const { id } = req.params;

    db.query(
        'UPDATE users SET status = CASE WHEN status = "active" THEN "inactive" ELSE "active" END WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                console.error('Error toggling user status:', err);
                return res.status(500).json({ error: 'Error toggling user status' });
            }
            res.json({ message: 'User status updated successfully' });
        }
    );
});

// Add these routes to your existing server.js file
app.get('/adm_user.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adm_user.html'));
});

app.get('/adm_dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adm_dashboard.html'));
});

app.get('/adm_inventory.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adm_inventory.html'));
});

// API endpoint to get current user and time info
app.get('/api/admin/info', (req, res) => {
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    res.json({
        username: 'Sangeeth62880',
        currentDateTime: currentTime
    });
});

// Error handling middleware for multer and general errors
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
    }

    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Connected routes:');
    console.log('- Authentication: /signup, /login');
    console.log('- Products: /products, /products/filter');
    console.log('- Cart: /cart, /cart/:user_id');
    console.log('- Inventory: /inventory/:user_id');
    console.log('- Admin API: /api/products');
    console.log('- Images: /images/*');
});