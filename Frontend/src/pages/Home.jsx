import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from your Node.js backend
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:9000/api/movies");
        const data = await response.json();
        setMovies(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <main className="pt-24 container mx-auto px-6 text-white">
        <h2 className="text-3xl font-bold mb-8">Popular Movies</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {movies.map((movie) => (
              <div
                key={movie.movie_id}
                className="group relative bg-gray-900 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer shadow-lg"
              >
                {/* Movie Poster */}
                <div className="aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-sm font-bold truncate">{movie.title}</h3>
                  <Link
                    to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                  >
                    <button className="mt-2 text-xs cursor-pointer">
                      View Details
                    </button>
                  </Link>
                </div>

                {/* Standard Title (Visible if not hovering) */}
                <div className="p-3 group-hover:hidden">
                  <h3 className="text-sm font-semibold truncate text-gray-300">
                    {movie.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
