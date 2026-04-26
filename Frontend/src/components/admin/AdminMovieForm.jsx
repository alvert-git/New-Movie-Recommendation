import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { X, Save, UploadCloud } from 'lucide-react';

const AdminMovieForm = ({ movie, close }) => {
    const isEdit = !!movie;

    // States
    const [formData, setFormData] = useState({
        title: '', tagline: '', overview: '', runtime: '',
        release_date: '', budget: '', price: '9.99',
        genres: '', cast: '', crew: ''
    });

    const [files, setFiles] = useState({
        poster: null,
        backdrop: null
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            // When getting movie by ID, genres might come back as parsed array, we need a string
            const genresStr = Array.isArray(movie.genres)
                ? movie.genres.map(g => g.name).join(', ')
                : (movie.genres || '');

            setFormData({
                title: movie.title || '',
                tagline: movie.tagline || '',
                overview: movie.overview || '',
                runtime: movie.runtime || '',
                release_date: movie.release_date ? new Date(movie.release_date).toISOString().split('T')[0] : '',
                budget: movie.budget || '',
                price: movie.price || '9.99',
                genres: genresStr,
                cast: movie.cast || '',
                crew: movie.crew || ''
            });
        }
    }, [movie]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleNumericKeyDown = (e) => {
        // Prevent 'e', '-', '+', and '.' if not needed (price needs '.')
        if (['e', '-', '+'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleNoZeroInput = (e) => {
        if (e.target.value === '0') {
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Additional Validations
        const numberRegex = /\d/;
        if (numberRegex.test(formData.genres)) {
            alert("Genres cannot contain numbers.");
            return;
        }
        if (numberRegex.test(formData.cast)) {
            alert("Cast cannot contain numbers.");
            return;
        }
        if (numberRegex.test(formData.crew)) {
            alert("Crew cannot contain numbers.");
            return;
        }

        if (Number(formData.runtime) <= 0 || Number(formData.budget) <= 0 || Number(formData.price) <= 0) {
            alert("Runtime, Budget, and Price must be greater than zero.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (files.poster) data.append('poster', files.poster);
            if (files.backdrop) data.append('backdrop', files.backdrop);

            if (isEdit) {
                await API.put(`/movies/${movie.movie_id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Movie updated!");
            } else {
                await API.post(`/movies`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert("Movie added!");
            }
            close();
        } catch (err) {
            console.error(err);
            alert("Error saving movie.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-8 relative">

                <button onClick={close} className="absolute top-6 right-6 text-gray-400 hover:text-white transition">
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mb-8">
                    {isEdit ? 'Edit Title / Metadata' : 'Create New Title'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Title <span className="text-red-500">*</span></label>
                            <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="Inception" />
                        </div>
                        {/* Tagline */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Tagline <span className="text-red-500">*</span></label>
                            <input type="text" name="tagline" required value={formData.tagline} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="Your mind is the scene of the crime." />
                        </div>
                    </div>

                    <div className="space-y-2 text-left">
                        <label className="text-xs uppercase font-bold text-gray-500">Overview <span className="text-red-500">*</span></label>
                        <textarea name="overview" rows="3" required value={formData.overview} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition resize-none" placeholder="A thief who steals corporate secrets..." />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Runtime (min) <span className="text-red-500">*</span></label>
                            <input type="number" name="runtime" required min="1" onKeyDown={handleNumericKeyDown} onInput={handleNoZeroInput} value={formData.runtime} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="148" />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Release Date <span className="text-red-500">*</span></label>
                            <input type="date" name="release_date" required value={formData.release_date} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Budget Rs.<span className="text-red-500">*</span></label>
                            <input type="number" name="budget" required min="1" onKeyDown={handleNumericKeyDown} onInput={handleNoZeroInput} value={formData.budget} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="160000000" />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Price ($) <span className="text-red-500">*</span></label>
                            <input type="number" step="0.01" name="price" required min="0.01" onKeyDown={(e) => { if (['e', '-', '+'].includes(e.key)) e.preventDefault(); }} onInput={handleNoZeroInput} value={formData.price} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="9.99" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Genres (Comma separated) <span className="text-red-500">*</span></label>
                            <input type="text" name="genres" required value={formData.genres} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="Action, Thriller, Sci-Fi" />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Cast (Top 3 Comma separated) <span className="text-red-500">*</span></label>
                            <input type="text" name="cast" required value={formData.cast} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="Leo DiCaprio, Elliot Page..." />
                        </div>
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-gray-500">Crew / Director <span className="text-red-500">*</span></label>
                            <input type="text" name="crew" required value={formData.crew} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 focus:border-red-500 focus:outline-none text-white text-sm transition" placeholder="Christopher Nolan" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
                        {/* Poster Upload */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Poster Upload (Vertical)</label>
                            <input type="file" name="poster" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 transition" />
                            {isEdit && movie.poster_url && !files.poster && (
                                <p className="text-xs text-blue-400 mt-2">Currently using existing database image.</p>
                            )}
                        </div>

                        {/* Backdrop Upload */}
                        <div className="space-y-2 text-left">
                            <label className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Backdrop Upload (Horizontal)</label>
                            <input type="file" name="backdrop" onChange={handleFileChange} accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 transition" />
                            {isEdit && movie.backdrop_url && !files.backdrop && (
                                <p className="text-xs text-blue-400 mt-2">Currently using existing database image.</p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 flex items-center justify-end gap-4 border-t border-zinc-800">
                        <button type="button" onClick={close} className="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition text-white px-8 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50">
                            {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save to Database</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminMovieForm;
