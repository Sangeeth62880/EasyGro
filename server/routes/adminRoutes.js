const express = require("express");
const router = express.Router();
const db = require("../config/db");
const adminAuth = require("../middleware/adminAuth");

// Get Users
router.get("/get-users", adminAuth, (req, res) => {
    const sql = "SELECT id, username, email, role FROM users";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(result);
    });
});

// Delete User
router.delete("/delete-user/:id", adminAuth, (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;
