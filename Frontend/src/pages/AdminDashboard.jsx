import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { DollarSign, Activity, Plus, Edit, Trash2, Search, Zap } from 'lucide-react';
import AdminMovieForm from '../components/admin/AdminMovieForm';

const AdminDashboard = () => {
    const [earnings, setEarnings] = useState({ totalEarnings: 0, totalTransactions: 0 });
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    const fetchEarnings = async () => {
        try {
            const { data } = await API.get('/payment/earnings');
            setEarnings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMovies = async (query = '') => {
        try {
            const url = query ? `/movies/search?query=${query}` : '/movies';
            const { data } = await API.get(url);
            setMovies(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchEarnings();
        fetchMovies();
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2 || e.target.value === '') {
            setTimeout(() => fetchMovies(e.target.value), 400);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this movie?")) return;
        try {
           await API.delete(`/movies/${id}`);
           fetchMovies(searchQuery);
           alert("Movie deleted. NLP model is updating in background.");
        } catch (err) {
           console.error(err);
           alert("Failed to delete.");
        }
    };

    const handleManualRebuild = async () => {
        try {
            await API.post('http://127.0.0.1:5000/rebuild-recommendations');
            alert("Recommendations manually rebuilt!");
        } catch (err) {
            alert("Error rebuilding: Make sure Python server is running.");
        }
    };

    return (
        <div className="pt-28 pb-16 min-h-screen bg-black text-white px-6">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Header & Rebuild Action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                            Command Center
                        </h1>
                        <p className="text-gray-400 mt-1">Manage global movie platform settings.</p>
                    </div>
                    <button 
                        onClick={handleManualRebuild}
                        className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-red-500 transition px-5 py-2.5 rounded-lg font-medium shadow-2xl"
                    >
                        <Zap className="w-4 h-4 text-emerald-400" />
                        Rebuild AI Matrix
                    </button>
                </div>

                {/* Dashboard Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-gray-400 font-medium tracking-wider text-sm mb-2">GLOBAL REVENUE</h3>
                            <p className="text-5xl font-black text-white tracking-tight">
                                ${Number(earnings.totalEarnings).toLocaleString()}
                            </p>
                            <p className="text-emerald-400 text-sm mt-4 font-semibold flex items-center gap-1">
                                <Activity className="w-4 h-4" /> Lifetime Earnings
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Activity className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-gray-400 font-medium tracking-wider text-sm mb-2">COMPLETED TRANSACTIONS</h3>
                            <p className="text-5xl font-black text-white tracking-tight">
                                {earnings.totalTransactions.toLocaleString()}
                            </p>
                            <p className="text-blue-400 text-sm mt-4 font-semibold flex items-center gap-1">
                                <Zap className="w-4 h-4" /> Total Payments
                            </p>
                        </div>
                    </div>
                </div>

                {/* Movie Database Table */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold">Content Library</h2>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search library..." 
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg pl-10 pr-4 py-2 w-64 focus:ring-1 focus:ring-red-500 focus:outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => { setEditingMovie(null); setIsModalOpen(true); }}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition text-white px-5 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                            >
                                <Plus className="w-5 h-5" /> Add Title
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-900/50 text-gray-400 text-sm border-b border-zinc-800">
                                    <th className="py-4 px-6 font-medium">Poster</th>
                                    <th className="py-4 px-6 font-medium">Title</th>
                                    <th className="py-4 px-6 font-medium">ID</th>
                                    <th className="py-4 px-6 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movies.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">No content found</td>
                                    </tr>
                                ) : (
                                    movies.map(m => (
                                        <tr key={m.movie_id} className="border-b border-zinc-800/50 hover:bg-zinc-900/40 transition">
                                            <td className="py-3 px-6">
                                                <img src={m.poster_url || '/placeholder.png'} alt="poster" className="w-12 h-16 object-cover rounded shadow-md border border-zinc-800" />
                                            </td>
                                            <td className="py-4 px-6 font-semibold">{m.title}</td>
                                            <td className="py-4 px-6 text-gray-500 font-mono text-sm">{m.movie_id}</td>
                                            <td className="py-4 px-6 text-right space-x-3">
                                                <button 
                                                    onClick={async () => {
                                                        const res = await API.get(`/movies/${m.movie_id}`);
                                                        setEditingMovie(res.data);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-lg transition"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(m.movie_id)}
                                                    className="p-2 bg-red-950/30 text-red-500 hover:bg-red-900/50 hover:text-red-400 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <AdminMovieForm 
                        movie={editingMovie} 
                        close={() => { setIsModalOpen(false); fetchMovies(searchQuery); }} 
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
