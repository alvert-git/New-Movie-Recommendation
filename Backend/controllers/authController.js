const jwt = require('jsonwebtoken');
const db = require('../config/connectDB'); // Ensure path matches your database file
const bcrypt = require('bcrypt');

// Helper function to create the JWT
const generateToken = (user) => {
    // Ensure there is a fallback image
    const defaultPic = `${process.env.VITE_FRONTEND_URL}/user.png`;

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            picture: user.profile_pic || defaultPic
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// 1. REGISTER LOCAL USER
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Explicitly set profile_pic as NULL or a default string for local users
        await db.query(
            'INSERT INTO users (email, password_hash, auth_provider, profile_pic) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, 'local', null]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. LOGIN LOCAL USER (JWT)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND auth_provider = "local"', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users[0];

        // Compare Password
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. GOOGLE CALLBACK (JWT)
exports.googleCallback = (req, res) => {
    // Passport strategy already verified/created the user and put it in req.user
    const token = generateToken(req.user);

    // Pass the token to your frontend via URL parameter
    res.redirect(`${process.env.VITE_FRONTEND_URL}/login-success?token=${token}`);
};

// 4. LOGOUT (JWT)
exports.logout = (req, res) => {
    // With JWT, "logging out" is usually handled by the frontend 
    // by deleting the token from localStorage/Cookies.
    res.status(200).json({ message: "Logged out. Please clear your token from storage." });
};