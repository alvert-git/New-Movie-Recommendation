import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">CineMatch</h2>
            <p className="text-sm max-w-sm">
              Discover your next favorite movie with our AI-powered recommendation engine.
              Personalized picks based on your unique taste.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-red-500 transition">Trending</a></li>
              <li><a href="#" className="hover:text-red-500 transition">Genres</a></li>
              <li><a href="#" className="hover:text-red-500 transition">Top Rated</a></li>
            </ul>
          </div>

          {/* Contact/Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-red-500 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-500 transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs">
          © {new Date().getFullYear()} CineMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;