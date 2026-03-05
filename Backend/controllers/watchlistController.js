const db = require('../config/connectDB');

// 1. Add movie to watchlist
exports.addToWatchlist = async (req, res) => {
    const { movie_id } = req.body;
    const user_id = req.user.id;

    if (!movie_id) {
        return res.status(400).json({ message: "movie_id is required" });
    }

    try {
        await db.query(
            "INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)",
            [user_id, movie_id]
        );
        res.status(201).json({ message: "Added to watchlist" });
    } catch (error) {
        // Handle duplicate entry gracefully (Error Code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Movie is already in your watchlist" });
        }
        res.status(500).json({ error: error.message });
    }
};

// 2. Remove movie from watchlist
exports.removeFromWatchlist = async (req, res) => {
    const { movie_id } = req.params;
    const user_id = req.user.id;

    try {
        const [result] = await db.query(
            "DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?",
            [user_id, movie_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Movie not found in watchlist" });
        }
        res.json({ message: "Removed from watchlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Get user's complete watchlist
exports.getWatchlist = async (req, res) => {
    const user_id = req.user.id;

    try {
        const [rows] = await db.query(
            `SELECT w.id as watchlist_id, w.created_at as saved_at, m.* 
             FROM watchlist w
             JOIN movies m ON w.movie_id = m.movie_id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC`,
            [user_id]
        );

        // Append base url to posters just like movieController does
        const formattedResults = rows.map(movie => ({
            ...movie,
            poster_url: movie.poster_url ? `${process.env.VITE_BACKEND_URL}${movie.poster_url}` : null,
            backdrop_url: movie.backdrop_url ? `${process.env.VITE_BACKEND_URL}${movie.backdrop_url}` : null,
        }));

        res.json(formattedResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Check if a specific movie is in the watchlist
exports.checkWatchlistStatus = async (req, res) => {
    const { movie_id } = req.params;
    const user_id = req.user.id;

    try {
        const [rows] = await db.query(
            "SELECT id FROM watchlist WHERE user_id = ? AND movie_id = ?",
            [user_id, movie_id]
        );

        res.json({ inWatchlist: rows.length > 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
