const db = require('../config/connectDB');
const axios = require('axios');

// 1. POST - Create a review
exports.addReview = async (req, res) => {
    const { movie_id, rating, review_text } = req.body;
    const user_id = req.user.id;

    try {
        let sentiment = 'neutral'; // Default fallback

        // --- CALL FLASK AI SERVER ---
        try {
            const aiResponse = await axios.post('http://127.0.0.1:5000/predict-sentiment', {
                review: review_text // Flask code uses data.get('review')
            });

            if (aiResponse.data && aiResponse.data.sentiment) {
                sentiment = aiResponse.data.sentiment;
                console.log("✅ AI Response:", sentiment);
            }
        } catch (aiError) {
            // If you see this in your console, Node.js cannot see the Flask terminal
            console.error("❌ AI Connection Error:", aiError.message);
            sentiment = 'neutral';
        }

        // --- SAVE TO DATABASE ---
        const [result] = await db.query(
            "INSERT INTO reviews (movie_id, user_id, rating, review_text, sentiment) VALUES (?, ?, ?, ?, ?)",
            [movie_id, user_id, rating, review_text, sentiment]
        );

        res.status(201).json({
            message: "Review added successfully",
            reviewId: result.insertId,
            sentiment: sentiment // Return this so the frontend can show it immediately
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. GET - Get all reviews for a movie
exports.getMovieReviews = async (req, res) => {
    const { movie_id } = req.params;

    try {
        const [rows] = await db.query(
            `SELECT r.*, u.email as user_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.movie_id = ? 
             ORDER BY r.created_at DESC`,
            [movie_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. PUT - Update a review (Only owner)
exports.updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    const user_id = req.user.id;

    try {
        let sentiment = 'neutral';

        // 1. RE-ANALYZE the new text because the user might have changed their mind
        try {
            const aiResponse = await axios.post('http://127.0.0.1:5000/predict-sentiment', {
                review: review_text // Flask code uses data.get('review')
            });

            if (aiResponse.data && aiResponse.data.sentiment) {
                sentiment = aiResponse.data.sentiment;
                console.log("✅ AI Response:", sentiment);
            }
        } catch (aiError) {
            // If you see this in your console, Node.js cannot see the Flask terminal
            console.error("❌ AI Connection Error:", aiError.message);
            sentiment = 'neutral';
        }

        // 2. Update the database with the NEW rating, text, AND sentiment
        const [result] = await db.query(
            "UPDATE reviews SET rating = ?, review_text = ?, sentiment = ? WHERE id = ? AND user_id = ?",
            [rating, review_text, sentiment, id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "You can only edit your own reviews" });
        }
        res.json({ message: "Review updated", sentiment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. DELETE - Delete a review (Only owner)
exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const [result] = await db.query(
            "DELETE FROM reviews WHERE id = ? AND user_id = ?",
            [id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: "You can only delete your own reviews" });
        }
        res.json({ message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};