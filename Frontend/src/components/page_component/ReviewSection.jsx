import React, { useState, useEffect } from "react";
import { FaStar, FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";
import API from "../../api/axios";

const ReviewSection = ({ movieId, onReviewChange }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const hasReviewed = reviews.some(r => Number(r.user_id) === Number(user?.id));

  const totalReviews = reviews.length;
  const positiveCount = reviews.filter(r => r.sentiment === 'pos').length;
  const negativeCount = reviews.filter(r => r.sentiment === 'neg').length;
  const neutralCount = reviews.filter(r => r.sentiment === 'neutral').length;
  
  const positivePercent = totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0;
  const negativePercent = totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0;
  const neutralPercent = totalReviews > 0 ? Math.round((neutralCount / totalReviews) * 100) : 0;

  const getScoreColor = () => {
    if (positivePercent >= 70) return "text-green-500";
    if (positivePercent >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  useEffect(() => {
    if (token) fetchReviews();
  }, [movieId, token]);

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${movieId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleEditClick = (review) => {
    setEditId(review.id);
    setRating(review.rating);
    setText(review.review_text);
    window.scrollTo({
      top: document.getElementById("review-form").offsetTop - 100,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || text.trim() === "") {
      alert("Please provide both a rating and a review.");
      return;
    }

    setIsSubmitting(true);
    try {
      // --- AI SENTIMENT VALIDATION ---
      try {
        const aiCheck = await axios.post("http://localhost:5000/predict-sentiment", { review: text });
        const sentiment = aiCheck.data.sentiment;

        if (sentiment === "neg" && rating >= 4) {
          if (!window.confirm("AI detects a negative sentiment in your review, but you've given a high rating. Do you still want to proceed?")) {
            setIsSubmitting(false);
            return;
          }
        } else if (sentiment === "pos" && rating <= 2) {
          if (!window.confirm("AI detects a positive sentiment in your review, but you've given a low rating. Do you still want to proceed?")) {
            setIsSubmitting(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Sentiment check bypassed due to connection error.");
      }

      if (editId) {
        await API.put(`/reviews/${editId}`, { rating, review_text: text });
      } else {
        await API.post(`/reviews`, { movie_id: movieId, rating, review_text: text });
      }

      setText("");
      setRating(0);
      setEditId(null);
      fetchReviews();

      if (onReviewChange) onReviewChange();
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.error || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      fetchReviews();
      if (onReviewChange) onReviewChange();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="mt-12 bg-gray-900/30 p-10 rounded-xl border border-dashed border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-200">Reviews & Ratings</h2>
        <Link to="/login" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all inline-block">
          Please Login to read and write reviews
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-gray-900/50 p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6">User Reviews</h2>

      {/* --- AI SENTIMENT SUMMARY DASHBOARD --- */}
      {totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-1">Community Pulse</p>
            <h3 className="text-4xl font-black text-white">{totalReviews} Reviews</h3>
          </div>

          <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 text-center">
            <p className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-1">AI Approval Score</p>
            <h3 className={`text-4xl font-black ${getScoreColor()}`}>{positivePercent}%</h3>
          </div>

          <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 flex flex-col justify-center px-8">
            <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-tighter">
              <span className="text-green-400">Pos ({positiveCount})</span>
              <span className="text-gray-400">Neu ({neutralCount})</span>
              <span className="text-red-400">Neg ({negativeCount})</span>
            </div>
            <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden flex border border-gray-700">
              <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${positivePercent}%` }} />
              <div className="bg-gray-500 h-full transition-all duration-1000" style={{ width: `${neutralPercent}%` }} />
              <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${negativePercent}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      {!hasReviewed || editId ? (
        <form id="review-form" onSubmit={handleSubmit} className="mb-10 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="mb-2 font-medium text-red-400">
            {editId ? "Updating your review..." : "Share your experience"}
          </p>
          <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className="cursor-pointer transition-colors"
                color={i + 1 <= (hover || rating) ? "#ffc107" : "#374151"}
                size={28}
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
              />
            ))}
          </div>
          <textarea
            className="w-full bg-gray-900 text-white p-4 rounded-lg focus:ring-2 focus:ring-red-600 outline-none border border-gray-700"
            rows="3"
            placeholder="Tell us what you liked or disliked..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-3 mt-3">
            <button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 px-8 py-2 rounded-lg font-bold transition-all disabled:opacity-50">
              {isSubmitting ? "Saving..." : editId ? "Update Review" : "Post Review"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setText(""); setRating(0); }} className="bg-gray-700 hover:bg-gray-600 px-8 py-2 rounded-lg font-bold">
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="p-4 mb-10 bg-gray-800/50 rounded-lg text-gray-400 italic text-center border border-gray-700">
          You have already reviewed this movie. You can edit or delete your existing review below.
        </div>
      )}

      {/* List Section */}
      <div className="space-y-6">
        {reviews.map((r) => (
          <div key={r.id} className="bg-gray-800/40 p-6 rounded-lg border border-gray-800 flex justify-between items-start transition-all hover:bg-gray-800/60 relative">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-lg text-white">
                  {r.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-100">{r.user_name}</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} size={12} color={i < r.rating ? "#ffc107" : "#4b5563"} />
                      ))}
                    </div>
                    {r.sentiment && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          r.sentiment === 'pos' ? 'bg-green-500/20 text-green-400' : 
                          r.sentiment === 'neutral' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                        {r.sentiment === 'pos' ? '😊 Positive' : 
                         r.sentiment === 'neutral' ? '😐 Neutral' : 
                         '😞 Negative'}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 leading-relaxed italic">"{r.review_text}"</p>
            </div>
            {Number(user?.id) === Number(r.user_id) && (
              <div className="flex gap-3 ml-4">
                <button onClick={() => handleEditClick(r)} className="text-gray-400 hover:text-blue-400 transition-colors"><FaEdit size={18} /></button>
                <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-500 transition-colors"><FaTrash size={18} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;