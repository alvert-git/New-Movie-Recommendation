import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', { email, password });
            alert("Success! Your seat is reserved.");
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black">
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-30" 
                style={{ backgroundImage: "url(/movie2.png)" }}
            ></div>
            
            <div className="relative z-10 w-full max-w-md p-8 bg-black/80 rounded-xl border border-gray-800">
                <h2 className="text-2xl text-white font-bold mb-2">Create Account</h2>
                <p className="text-gray-400 mb-6">Get personalized movie recommendations.</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-600 focus:outline-none transition"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Create Password" 
                        className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700 focus:border-red-600 focus:outline-none transition"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full py-3 mt-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="mt-6 text-gray-400 text-center text-sm">
                    Already a member? <Link to="/login" className="text-white hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;