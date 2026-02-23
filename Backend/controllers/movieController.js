const db = require('../config/connectDB');
const axios = require('axios');
exports.getAllMovies = async (req, res) => {
    try {
        // Just get data from DB. No TMDB API calls here!
        const [rows] = await db.query("SELECT movie_id, title, poster_url FROM movies LIMIT 20");
        
        // Add your local backend URL to the path stored in DB
        const moviesWithLocalPosters = rows.map(movie => ({
            ...movie,
            poster_url: `${process.env.VITE_BACKEND_URL}${movie.poster_url}`
        }));

        res.status(200).json(moviesWithLocalPosters);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getMovieById = async (req, res) => {
    const { id } = req.params;

    try {
        // Updated Query: Joined with reviews table
        const [rows] = await db.query(
            `SELECT m.*, 
                    IFNULL(AVG(r.rating), 0) as averageRating, 
                    COUNT(r.id) as totalReviews
             FROM movies m
             LEFT JOIN reviews r ON m.movie_id = r.movie_id
             WHERE m.movie_id = ?
             GROUP BY m.id`, 
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Movie not found" });
        }

        const movie = rows[0];

        // --- ROBUST GENRE PARSING ---
        let formattedGenres = [];
        if (movie.genres) {
            if (movie.genres.startsWith('[') || movie.genres.startsWith('{')) {
                try {
                    const parsed = JSON.parse(movie.genres);
                    formattedGenres = parsed.map(g => typeof g === 'object' ? g.name : g);
                } catch (e) {
                    formattedGenres = movie.genres.split(',').map(g => g.trim());
                }
            } else {
                formattedGenres = movie.genres.split(',').map(g => g.trim());
            }
        }

        // Final response object
        const movieDetails = {
            ...movie,
            // Clean up the rating to 1 decimal place (e.g., 4.3333 -> 4.3)
            averageRating: parseFloat(movie.averageRating).toFixed(1),
            totalReviews: movie.totalReviews,
            poster_url: movie.poster_url ? `${process.env.VITE_BACKEND_URL}${movie.poster_url}` : null,
            backdrop_url: movie.backdrop_url ? `${process.env.VITE_BACKEND_URL}${movie.backdrop_url}` : null,
            genres: formattedGenres.map((name, index) => ({ id: index, name: name }))
        };

        res.json(movieDetails);
    } catch (error) {
        console.error("Database Error:", error.message);
        res.status(500).json({ error: "Failed to fetch movie details" });
    }
};

exports.searchMovies = async (req, res) => {
    const { query } = req.query;
    try {
        const [rows] = await db.query(
            "SELECT movie_id, title FROM movies WHERE title LIKE ? LIMIT 10", 
            [`%${query}%`]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
};

// --- movieController.js ---
exports.getRecommendations = async (req, res) => {
    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ message: "Title parameter is missing" });
    }

    try {
        // 1. Get IDs from Flask
        const flaskResponse = await axios.get(`http://127.0.0.1:5000/recommend`, {
            params: { title: title }
        });
        const recommendedIds = flaskResponse.data;

        if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
            return res.json([]);
        }

        // 2. Query MySQL using await (NO CALLBACKS)
        const sql = "SELECT movie_id, title, poster_url FROM movies WHERE movie_id IN (?) ORDER BY FIELD(movie_id, ?)";
        
        // Destructure 'rows' from the promise result
        const [rows] = await db.query(sql, [recommendedIds, recommendedIds]);

        // 3. Format and send response
        const formattedResults = rows.map(movie => ({
            ...movie,
            poster_url: `http://localhost:9000${movie.poster_url}`
        }));

        res.json(formattedResults);

    } catch (error) {
        console.error("Error in getRecommendations:", error.message);
        res.status(500).json({ error: "Recommendation engine error" });
    }
};

