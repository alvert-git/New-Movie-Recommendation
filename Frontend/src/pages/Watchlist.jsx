import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FaBookmark, FaRegFrown } from 'react-icons/fa';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWatchlist = async () => {
            try {
                const res = await api.get('/watchlist');
                setWatchlist(res.data);
            } catch (err) {
                console.error("Failed to fetch watchlist:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, []);

    if (loading) {
        return (
            <div className="bg-black min-h-screen text-white flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-black min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-6 text-white">
                <div className="flex items-center gap-3 mb-8">
                    <FaBookmark className="text-red-600 text-3xl" />
                    <h1 className="text-4xl font-bold">My Watchlist</h1>
                </div>

                {watchlist.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {watchlist.map((movie) => (
                            <Link
                                key={movie.watchlist_id}
                                to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                                className="group relative bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 shadow-xl hover:shadow-red-600/20 block"
                            >
                                <img
                                    src={movie.poster_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop"}
                                    alt={movie.title}
                                    className="w-full aspect-[2/3] object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                                        {movie.title}
                                    </h3>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-red-500 font-semibold">{movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</span>
                                        <span className="text-gray-300 border border-gray-600 px-2 py-0.5 rounded text-xs">Movie</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-900/50 rounded-2xl border border-gray-800">
                        <FaRegFrown className="text-6xl text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-300 mb-2">Your watchlist is empty</h2>
                        <p className="text-gray-500 mb-6 max-w-md">
                            Looks like you haven't added any movies to your watchlist yet. Explore our collection and save the ones you want to watch later!
                        </p>
                        <Link
                            to="/"
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg shadow-red-600/20"
                        >
                            Discover Movies
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist;