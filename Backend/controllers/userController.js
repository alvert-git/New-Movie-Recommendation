const db = require('../config/connectDB');

exports.logInteraction = async (req, res) => {
    const { movie_id, interaction_type } = req.body;
    const user_id = req.user.id; // From auth middleware

    if (!movie_id || !interaction_type) {
        return res.status(400).json({ message: 'Missing movie_id or interaction_type' });
    }

    try {
        await db.query(
            'INSERT INTO user_interactions (user_id, movie_id, interaction_type) VALUES (?, ?, ?)',
            [user_id, movie_id, interaction_type]
        );
        res.status(200).json({ message: 'Interaction logged successfully' });
    } catch (err) {
        console.error('Error logging interaction:', err);
        res.status(500).json({ message: 'Error logging interaction' });
    }
};

exports.getDashboardData = async (req, res) => {
    const user_id = req.user.id;

    try {
        // 1. Fetch user info
        const [user] = await db.query('SELECT id, email FROM users WHERE id = ?', [user_id]);

        // 2. Fetch purchase history
        const [purchases] = await db.query(
            'SELECT m.* FROM purchases p JOIN movies m ON p.movie_id = m.movie_id WHERE p.user_id = ? AND p.status = "COMPLETED"',
            [user_id]
        );

        // 3. Fetch watchlist
        const [watchlist] = await db.query(
            'SELECT m.* FROM watchlist w JOIN movies m ON w.movie_id = m.movie_id WHERE w.user_id = ?',
            [user_id]
        );

        // 4. Fetch personalized recommendations (from Flask API)
        let recommendations = [];
        try {
            const flaskResponse = await fetch(`http://localhost:5000/recommend/personalized`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id })
            });
            
            if (flaskResponse.ok) {
                const flaskData = await flaskResponse.json();
                const recommendedIds = flaskData.recommendations; // List of IDs

                if (recommendedIds && recommendedIds.length > 0) {
                    // Fetch full movie details for these IDs
                    const [movieDetails] = await db.query(
                        'SELECT * FROM movies WHERE movie_id IN (?) ORDER BY FIELD(movie_id, ?)',
                        [recommendedIds, recommendedIds]
                    );
                    recommendations = movieDetails;
                }
            }
        } catch (error) {
            console.error('Flask API Error:', error.message);
            // Fallback: If Flask is down, we could fetch trending movies manually here
        }

        res.json({
            user: user[0],
            purchases,
            watchlist,
            recommendations
        });
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
};
