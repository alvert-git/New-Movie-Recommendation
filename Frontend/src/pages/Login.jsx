import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

 const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const { data } = await API.post('/auth/login', { email, password });
        
        // SAVE BOTH HERE
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // This has the ID!
        
        navigate('/dashboard');
    } catch (err) {
        alert("Invalid credentials. Try again!");
    }
};

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:9000/api/auth/google';
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-black">
            {/* Background Image with Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-center opacity-40" 
                style={{ backgroundImage: "url(/movie1.png)" }}
            ></div>
            
            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md p-8 bg-black/70 backdrop-blur-md rounded-xl border border-gray-800 shadow-2xl">
                <h1 className="text-3xl font-bold text-red-600 text-center mb-8 uppercase tracking-widest">
                    Movie<span className="text-white">Rec</span>
                </h1>
                
                <h2 className="text-xl text-white font-semibold mb-6">Sign In</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full p-3 rounded bg-gray-700 text-white border border-transparent focus:border-red-600 focus:outline-none transition"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-full p-3 rounded bg-gray-700 text-white border border-transparent focus:border-red-600 focus:outline-none transition"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button 
                        type="submit" 
                        className="w-full py-3 mt-4 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>

                <div className="relative my-8 text-center">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-gray-700"></span>
                    <span className="relative bg-black/70 px-4 text-gray-400 text-sm">OR</span>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
                >
                    <img src="/google.png" className="w-7" alt="Google" />
                    Sign in with Google
                </button>

                <p className="mt-8 text-gray-400 text-center">
                    New here? <Link to="/register" className="text-white hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;