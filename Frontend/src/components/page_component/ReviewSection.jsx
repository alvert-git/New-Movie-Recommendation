import React, { useState, useEffect } from "react";
import { FaStar, FaTrash, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../api/axios"; // Use your custom axios instance

const ReviewSection = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const hasReviewed = reviews.some(r => Number(r.user_id) === Number(user?.id));

  useEffect(() => {
    if (token) fetchReviews();
  }, [movieId, token]);

  const fetchReviews = async () => {
    try {
      // No need for headers, your interceptor handles it!
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
    // Smooth scroll back to form
    window.scrollTo({
      top: document.getElementById("review-form").offsetTop - 100,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e) => {
        e.preventDefault();
        // ... logic ...
        try {
            if (editId) {
                await API.put(`/reviews/${editId}`, { rating, review_text: text });
            } else {
                await API.post(`/reviews`, { movie_id: movieId, rating, review_text: text });
            }
            
            // RESET AND REFRESH
            setText("");
            setRating(0);
            setEditId(null);
            fetchReviews(); // Refreshes the review list
            
            if (onReviewChange) onReviewChange(); // Trigger the Top-Level refresh!
        } catch (err) {
            // If you added the Unique Key, this will catch the duplicate error
            alert(err.response?.data?.message || "Submission failed");
        }
    };

  const handleDelete = async (id) => {
        if (!window.confirm("Delete this review?")) return;
        try {
            await API.delete(`/reviews/${id}`);
            fetchReviews();
            if (onReviewChange) onReviewChange(); // Trigger the Top-Level refresh!
        } catch (err) {
            console.error(err);
        }
    };

  if (!token) {
    return (
      <div className="mt-12 bg-gray-900/30 p-10 rounded-xl border border-dashed border-gray-700 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-200">
          Reviews & Ratings
        </h2>
        <Link
          to="/login"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all inline-block"
        >
          Please Login to read and write reviews
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-gray-900/50 p-8 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6">
        User Reviews ({reviews.length})
      </h2>

      {/* Form Section */}
      {!hasReviewed || editId ? (
      <form
        id="review-form"
        onSubmit={handleSubmit}
        className="mb-10 bg-gray-800 p-6 rounded-lg border border-gray-700"
      >
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
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 bg-red-600 hover:bg-red-700 px-8 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : editId
                ? "Update Review"
                : "Post Review"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setText("");
                setRating(0);
              }}
              className="mt-3 bg-gray-700 hover:bg-gray-600 px-8 py-2 rounded-lg font-bold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>) : (
    <div className="p-4 bg-gray-800 rounded-lg text-gray-400 italic text-center border border-gray-700">
        You have already reviewed this movie. You can edit or delete your existing review below.
    </div>
)}

      {/* List Section */}
      <div className="space-y-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-gray-800/40 p-6 rounded-lg border border-gray-800 flex justify-between items-start transition-all hover:bg-gray-800/60 relative"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-lg text-white">
                  {r.user_name?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4 className="font-bold text-gray-100">{r.user_name}</h4>
                  {/* Star Display */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={12}
                        color={i < r.rating ? "#ffc107" : "#4b5563"}
                      />
                    ))}
                  </div>
                </div>

                <span className="text-xs text-gray-500 ml-auto mr-12 md:mr-0">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>

              <p className="text-gray-300 leading-relaxed italic">
                "{r.review_text}"
              </p>
            </div>

            {/* --- ICONS PLACEMENT --- */}
            {Number(user?.id) === Number(r.user_id) && (
              <div className="flex gap-3 ml-4 bg-gray-900/50 p-2 rounded-md shadow-sm">
                <button
                  onClick={() => handleEditClick(r)}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                  title="Edit Review"
                >
                  <FaEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Review"
                >
                  <FaTrash size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
