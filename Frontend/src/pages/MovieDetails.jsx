import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReviewSection from "../components/page_component/ReviewSection";
import PaymentModal from "../components/page_component/PaymentModal"; // Import the new component
import { FaStar, FaBookmark, FaRegBookmark, FaPlay, FaLock } from "react-icons/fa";
import api from "../api/axios";

const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const videoId = url.split("v=")[1]?.split("&")[0];
  return `https://www.youtube.com/embed/${videoId}`;
};

const MovieDetails = () => {
  const { id, title } = useParams();
  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal State

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [movieRes, recRes] = await Promise.all([
          fetch(`http://localhost:9000/api/movies/${id}`),
          fetch(`http://localhost:9000/api/movies/recommend?title=${encodeURIComponent(title)}`),
        ]);

        const movieData = await movieRes.json();
        const recData = await recRes.json();

        setMovie(movieData);
        setRecommendations(recData);

        const token = localStorage.getItem('token');
        if (token && movieData?.movie_id) {
          try {
            const watchRes = await api.get(`/watchlist/check/${movieData.movie_id}`);
            setInWatchlist(watchRes.data.inWatchlist);

            const accessRes = await api.get(`/payment/access/${movieData.movie_id}`);
            setHasAccess(accessRes.data.hasAccess);
            if (accessRes.data.hasAccess && accessRes.data.video_url) {
              setMovie(prev => ({ ...prev, video_url: accessRes.data.video_url }));
            }
          } catch (err) {
            console.error("Failed to check status:", err);
          }
        }
      } catch (err) {
        console.error("Error loading movie page:", err);
      } finally {
        setLoading(false);
        setCheckingAccess(false);
      }
    };

    fetchAllData();
    window.scrollTo(0, 0);
  }, [id, title]);

  const refreshMovie = async () => {
    try {
      const res = await fetch(`http://localhost:9000/api/movies/${id}`);
      const data = await res.json();
      setMovie(data);
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  const toggleWatchlist = async () => {
    if (!localStorage.getItem('token')) {
      alert("Please log in to use the watchlist.");
      return;
    }
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await api.delete(`/watchlist/${movie.movie_id}`);
        setInWatchlist(false);
      } else {
        await api.post('/watchlist', { movie_id: movie.movie_id });
        setInWatchlist(true);
      }
    } catch (err) {
      console.error("Failed to toggle watchlist:", err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handlePayment = async (method) => {
    setPaymentLoading(true);
    try {
      const response = await api.post("/payment/initiate", {
        method,
        amount: movie.price || 500,
        productName: movie.title,
        transactionId: movie.movie_id
      });

      const paymentData = response.data;

      if (method === "esewa") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.entries(paymentData.esewaConfig).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else if (method === "khalti") {
        window.location.href = paymentData.khaltiPaymentUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment initiation failed.");
      setPaymentLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-black min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section */}
      <div className="relative h-[65vh] w-full">
        <img src={movie.backdrop_url} className="w-full h-full object-cover opacity-30" alt="backdrop" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-10 w-full">
          <div className="container mx-auto flex gap-8 items-end">
            <img src={movie.poster_url} className="w-44 rounded-xl shadow-2xl hidden md:block border border-gray-800" alt="poster" />
            <div className="flex-1">
              <h1 className="text-5xl font-black mb-2 tracking-tight">{movie.title}</h1>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  <FaStar className="text-yellow-500" />
                  <span className="font-bold">{movie.averageRating || "0.0"}</span>
                </div>
                <button
                  onClick={toggleWatchlist}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${inWatchlist ? "bg-gray-800 text-white" : "bg-red-600 hover:bg-red-700"
                    }`}
                >
                  {inWatchlist ? <FaBookmark /> : <FaRegBookmark />}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4 text-gray-400 uppercase tracking-widest">Overview</h2>
            <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
          </section>

          {/* Player / Purchase Area */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            {checkingAccess ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
              </div>
            ) : hasAccess ? (
              <div className="aspect-video bg-black">
                {movie.video_url ? (
                  <iframe
                    src={getEmbedUrl(movie.video_url)}
                    title={movie.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <FaPlay size={40} className="mb-4 opacity-20" />
                    <p>Video currently unavailable</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 px-8 text-center bg-gradient-to-b from-gray-900 to-black">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600/10 text-red-500 mb-6">
                  <FaLock size={24} />
                </div>
                <h3 className="text-3xl font-bold mb-2">Premium Content</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Unlock this title to watch in full HD on any device.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <span className="text-4xl font-black">NPR {movie.price || "500"}</span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={paymentLoading}
                    className="bg-white text-black hover:bg-gray-200 font-black py-4 px-12 rounded-full transition-all hover:scale-105"
                  >
                    {paymentLoading ? "Processing..." : "Buy Now"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
            <h3 className="font-bold mb-4 text-sm uppercase text-gray-500">Details</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <span className="text-gray-500">Runtime</span>
              <span className="text-right">{movie.runtime} min</span>
              <span className="text-gray-500">Release</span>
              <span className="text-right">{movie.release_date}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {movie?.genres?.map((g, i) => (
                <span key={i} className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tighter">
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations & Reviews */}
      <div className="container mx-auto px-6 py-12 border-t border-gray-900">
        <h2 className="text-2xl font-bold mb-8">More Like This</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {recommendations.slice(0, 5).map((rec) => (
            <Link key={rec.movie_id} to={`/movie/${rec.movie_id}/${encodeURIComponent(rec.title)}`} className="group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-gray-800">
                <img src={rec.poster_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={rec.title} />
              </div>
              <p className="text-sm font-semibold truncate group-hover:text-red-500 transition-colors">{rec.title}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 border-t border-gray-900">
        <ReviewSection movieId={movie.movie_id} onReviewChange={refreshMovie} />
      </div>

      {/* Payment Modal Integration */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        price={movie.price || 500}
        movieTitle={movie.title}
        onSelectMethod={(method) => {
          setIsModalOpen(false);
          handlePayment(method);
        }}
      />
    </div>
  );
};

export default MovieDetails;