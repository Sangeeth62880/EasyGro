// Express Backend for Admin Dashboard
const express = require("express");
const router = express.Router();
const db = require("../config/db"); // MySQL connection
const adminAuth = require("../middleware/adminAuth");

// Get Product Count
router.get("/product-count", adminAuth, (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM products";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ count: result[0].count });
    });
});

// Get User Count
router.get("/user-count", adminAuth, (req, res) => {
    const sql = "SELECT COUNT(*) AS count FROM users";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ count: result[0].count });
    });
});

// Logout Route
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login.html");
    });
});

module.exports = router;
