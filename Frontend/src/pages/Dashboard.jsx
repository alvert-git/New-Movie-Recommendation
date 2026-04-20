import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaHistory, FaStar, FaPlay } from 'react-icons/fa';
import api from '../api/axios';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/user/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  const { purchases, watchlist, recommendations, user } = data || {};

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white pt-24 pb-20">
      <div className="container mx-auto px-6">

        {/* Welcome Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Welcome back, <span className="text-red-600">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-gray-400">Here's what we've picked for you today.</p>
        </div>

        {/* Personalized Recommendations Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <FaStar className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Recommended for You</h2>
            </div>
          </div>

          {recommendations?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {recommendations.map((movie) => (
                <Link
                  key={movie.movie_id}
                  to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                  className="group relative"
                >
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative">
                    <img
                      src={`http://localhost:9000${movie.poster_url}`}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-40"
                    />
                    <div className="absolute inset-0 flex items-center justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-red-600 p-4 rounded-full shadow-lg">
                        <FaPlay className="text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-4 font-bold text-sm truncate group-hover:text-red-600 transition-colors">
                    {movie.title}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/50 border border-dashed border-gray-800 rounded-3xl p-12 text-center">
              <p className="text-gray-500 italic">No recommendations yet. Start watching to see your personalized picks!</p>
            </div>
          )}
        </section>

        {/* Two Column Layout for Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Watchlist Preview */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FaHeart className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Recent Watchlist</h2>
              <Link to="/watchlist" className="ml-auto text-xs text-blue-500 font-bold uppercase tracking-widest hover:text-white transition-colors">See All</Link>
            </div>

            <div className="space-y-4">
              {watchlist?.length > 0 ? (
                watchlist.slice(0, 4).map((movie) => (
                  <Link
                    key={movie.movie_id}
                    to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                    className="flex items-center gap-4 bg-gray-900/30 p-3 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group"
                  >
                    <img src={`http://localhost:9000${movie.poster_url}`} alt="imag" className="w-16 h-20 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-bold group-hover:text-blue-500 transition-colors">{movie.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">{movie.release_date?.split('-')[0]}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-600 text-sm italic">Your watchlist is empty.</p>
              )}
            </div>
          </section>

          {/* Library / Purchases */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-green-600 p-2 rounded-lg">
                <FaHistory className="text-white" />
              </div>
              <h2 className="text-2xl font-bold">Your Library</h2>
            </div>

            <div className="space-y-4">
              {purchases?.length > 0 ? (
                purchases.slice(0, 4).map((movie) => (
                  <Link
                    key={movie.movie_id}
                    to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                    className="flex items-center gap-4 bg-gray-900/30 p-3 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group"
                  >
                    <img src={`http://localhost:9000${movie.poster_url}`} alt="" className="w-16 h-20 object-cover rounded-lg" />
                    <div>
                      <h4 className="font-bold group-hover:text-green-500 transition-colors">{movie.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-tighter">Purchased</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-600 text-sm italic">You haven't purchased any movies yet.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;