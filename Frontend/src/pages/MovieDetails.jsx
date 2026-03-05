import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReviewSection from "../components/page_component/ReviewSection";
import { FaStar, FaBookmark, FaRegBookmark } from "react-icons/fa";
import api from "../api/axios";

const getEmbedUrl = (url) => {
  if (!url) return "";
  // If it's already an embed link, return it
  if (url.includes("/embed/")) return url;

  // If it's a standard watch link, extract the ID and convert it
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

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true); // Reset loading when ID changes
      try {
        // 1. Fetch both Movie Details and Recommendations in parallel
        // Checking watchlist requires an authenticated request
        const [movieRes, recRes] = await Promise.all([
          fetch(`http://localhost:9000/api/movies/${id}`),
          fetch(
            `http://localhost:9000/api/movies/recommend?title=${encodeURIComponent(title)}`,
          ),
        ]);

        const movieData = await movieRes.json();
        const recData = await recRes.json();

        // 2. Set the data
        setMovie(movieData);
        setRecommendations(recData);

        // 3. Check Watchlist status if user is logged in
        const token = localStorage.getItem('token');
        if (token && movieData?.movie_id) {
          try {
            const watchRes = await api.get(`/watchlist/check/${movieData.movie_id}`);
            setInWatchlist(watchRes.data.inWatchlist);

            // Payment access check
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
        setLoading(false); // This stops the loading spinner
        setCheckingAccess(false);
      }
    };

    fetchAllData();
    window.scrollTo(0, 0); // Scroll to top when moving to a new movie
  }, [id, title]); // Re-run when user clicks a recommended movie

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="bg-black min-h-screen text-white flex justify-center items-center">
        Movie not found.
      </div>
    );
  }

  const refreshMovie = async () => {
    try {
      const res = await fetch(`http://localhost:9000/api/movies/${id}`);
      const data = await res.json();
      setMovie(data); // This refreshes averageRating at the top!
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
      alert("Failed to update watchlist.");
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handlePayment = async (method) => {
    setPaymentLoading(true);
    try {
      const response = await api.post("/payment/initiate", {
        method,
        amount: movie.price || 500, // NPR 500 default
        productName: movie.title,
        transactionId: movie.movie_id
      });

      const paymentData = response.data;

      if (method === "esewa") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        const esewaPayload = {
          amount: paymentData.esewaConfig.amount,
          tax_amount: paymentData.esewaConfig.tax_amount,
          total_amount: paymentData.esewaConfig.total_amount,
          transaction_uuid: paymentData.esewaConfig.transaction_uuid,
          product_code: paymentData.esewaConfig.product_code,
          product_service_charge: paymentData.esewaConfig.product_service_charge,
          product_delivery_charge: paymentData.esewaConfig.product_delivery_charge,
          success_url: paymentData.esewaConfig.success_url,
          failure_url: paymentData.esewaConfig.failure_url,
          signed_field_names: paymentData.esewaConfig.signed_field_names,
          signature: paymentData.esewaConfig.signature,
        };


        console.log("Submitting to eSewa with payload:", esewaPayload);

        Object.entries(esewaPayload).forEach(([key, value]) => {
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
      alert("Payment initiation failed. Please try again. " + (error.response?.data?.error || ""));
      setPaymentLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Backdrop Hero Section */}
      <div className="relative h-[60vh] w-full">
        <img
          src={movie.backdrop_url}
          className="w-full h-full object-cover opacity-40"
          alt="backdrop"
        />
        <div className="absolute bottom-0 left-0 p-10 bg-gradient-to-t from-black to-transparent w-full">
          <div className="container mx-auto flex gap-8 items-end">
            <img
              src={movie.poster_url}
              className="w-48 rounded-lg shadow-xl hidden md:block"
              alt="poster"
            />
            <div>
              <h1 className="text-5xl font-bold">{movie.title}</h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500 text-2xl" />
                  <span className="text-2xl font-bold">
                    {movie.averageRating || "0.0"}
                  </span>
                  <span className="text-gray-400 text-sm mt-1">
                    ({movie.totalReviews || 0} reviews)
                  </span>
                </div>

                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all shadow-lg ${inWatchlist
                    ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                    : "bg-red-600 hover:bg-red-700 text-white"
                    } ${watchlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {inWatchlist ? (
                    <><FaBookmark /> Remove from Watchlist</>
                  ) : (
                    <><FaRegBookmark /> Add to Watchlist</>
                  )}
                </button>
              </div>
              <p className="text-gray-300 font-medium italic mt-4 text-lg">{movie.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info Section */}
      <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-8">
            {movie.overview}
          </p>

          {/* Enhanced Video Player or Purchase Gateway Output */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-2 mb-8 shadow-2xl relative overflow-hidden">
            {checkingAccess ? (
              <div className="flex justify-center items-center py-20 min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : hasAccess ? (
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/50">
                {movie.video_url ? (
                  <iframe
                    src={getEmbedUrl(movie.video_url)}
                    title={movie.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center min-h-[300px]">
                    <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    <p className="font-semibold text-lg text-white mb-1">Video Stream Not Found</p>
                    <p className="text-sm border border-gray-700 bg-gray-800 px-3 py-1 rounded inline-block">The creator hasn't uploaded a video file for this movie yet.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 text-red-500 mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h3 className="text-3xl font-bold mb-3 text-white">Unlock Full Movie</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                  Purchase "{movie.title}" to unlock instant access to stream this title in full HD on any device.
                </p>

                <div className="flex justify-center items-center mb-8">
                  <div className="text-3xl font-black text-white mr-2">NPR {movie.price || "500"}</div>
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">One-time payment</div>
                </div>

                {paymentLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    <span className="ml-3 font-semibold text-gray-300">Redirecting to gateway...</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={() => handlePayment('esewa')}
                      className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-green-600 px-8 py-3.5 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-green-500"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Pay with eSewa
                      </span>
                    </button>

                    <button
                      onClick={() => handlePayment('khalti')}
                      className="group relative w-full sm:w-auto overflow-hidden rounded-full bg-purple-600 px-8 py-3.5 font-bold text-white shadow-xl transition-all hover:scale-105 hover:bg-purple-500"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Pay with Khalti
                      </span>
                    </button>
                  </div>
                )}

                <div className="mt-8 flex justify-center gap-4 text-xs text-gray-500 font-medium">
                  <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.95 11.95 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> Secure Transaction</span>
                  <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Instant Delivery</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-6 text-sm">
            <div>
              <p className="text-gray-500">Runtime</p>
              <p>{movie.runtime} min</p>
            </div>
            <div>
              <p className="text-gray-500">Release Date</p>
              <p>{movie.release_date}</p>
            </div>
            <div>
              <p className="text-gray-500">Budget</p>
              <p>${movie.budget?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Sidebar - Genres */}
        <div className="bg-gray-900 p-6 rounded-lg h-fit">
          <h3 className="font-bold mb-4">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {movie?.genres?.map((g, index) => (
              <span
                key={g.id || index}
                className="bg-red-600/20 border border-red-600 px-3 py-1 rounded-full text-xs"
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* More Like This Section */}
      <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8">More Like This</h2>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {recommendations.map((rec) => (
              <Link
                key={rec.movie_id}
                to={`/movie/${rec.movie_id}/${encodeURIComponent(rec.title)}`}
                className="group"
              >
                <img
                  src={rec.poster_url}
                  className="rounded-lg transition-transform group-hover:scale-105"
                  alt={rec.title}
                />
                <p className="mt-2 text-sm font-medium truncate">{rec.title}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No recommendations found for this title.
          </p>
        )}
      </div>

      <div className="container mx-auto px-6 py-10">
        <ReviewSection movieId={movie.movie_id} onReviewChange={refreshMovie} />
      </div>
    </div>
  );
};

export default MovieDetails;
