import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // 1. Load user data from JWT and handle scroll effect
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid Token");
        localStorage.removeItem('token');
      }
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Search Logic with Debouncing
  useEffect(() => {
    const fetchSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        // Calling your Node.js backend
        const { data } = await axios.get(`http://localhost:9000/api/movies/search?query=${searchQuery}`);
        setSearchResults(data);
        setShowResults(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const timeoutId = setTimeout(fetchSearch, 400); // Wait 400ms after user stops typing
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 3. Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 py-3 shadow-2xl' : 'bg-transparent py-5'
      }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">

        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer group">
          <Film className="text-red-600 w-8 h-8 group-hover:scale-110 transition-transform" />
          <h1 className="text-white text-2xl font-bold tracking-tighter uppercase">
            Movie<span className="text-red-600">Rec</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-gray-300 font-medium">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/watchlist" className="hover:text-white transition-colors">Watch List</Link>
        </nav>

        {/* Search and Profile */}
        <div className="flex items-center gap-6">

          {/* --- SEARCH BAR --- */}
          <div className="relative hidden lg:block" ref={searchRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search movies..."
              className="bg-zinc-900/80 text-white text-sm rounded-md pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all border border-zinc-700"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

            {/* --- SEARCH RESULTS DROPDOWN --- */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-md shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {searchResults.map((movie) => (
                  <Link
                    key={movie.movie_id}
                    to={`/movie/${movie.movie_id}/${encodeURIComponent(movie.title)}`}
                    onClick={() => {
                      setShowResults(false);
                      setSearchQuery("");
                    }}
                    className="block px-4 py-3 hover:bg-zinc-800 border-b border-zinc-800 last:border-0 transition-colors"
                  >
                    <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Login Section */}
          <div className="relative group">
            {user ? (
              <div className="flex items-center gap-2 cursor-pointer py-2">
                <img
                  src={user.picture || '/user.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-md object-cover border border-zinc-700"
                  onError={(e) => e.target.src = '/user.png'}
                />
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-black border border-zinc-800 rounded shadow-xl w-56 overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-xs text-gray-500 uppercase font-bold">Account</p>
                      <p className="text-sm text-white truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-zinc-900 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out of MovieRec
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors bg-red-600 px-4 py-1.5 rounded text-sm font-bold">
                Sign In
              </Link>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;