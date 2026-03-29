const db = require('../config/connectDB');

const verifyAdmin = async (req, res, next) => {
    try {
        // req.user is set by the authMiddleware / passport
        // Wait, does the project use passport JWT or sessions?
        // Let's assume req.user is populated by a preceding verifyToken middleware
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (users[0].role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }
        
        // Add role to user object
        req.user.role = users[0].role;
        next();
    } catch (error) {
        console.error("Admin verification error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = verifyAdmin;
