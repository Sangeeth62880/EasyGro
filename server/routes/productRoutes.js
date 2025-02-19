const express = require("express");
const router = express.Router();
const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");

// Get Products
router.get("/get-products", adminAuth, (req, res) => {
    const sql = "SELECT id, name, price, stock FROM products";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
});

// Add Product
router.post("/add-product", adminAuth, (req, res) => {
    const { name, price, stock } = req.body;
    const sql = "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)";
    db.query(sql, [name, price, stock], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Product added successfully" });
    });
});

// Delete Product
router.delete("/delete-product/:id", adminAuth, (req, res) => {
    const productId = req.params.id;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [productId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Product deleted successfully" });
    });
});

module.exports = router;
