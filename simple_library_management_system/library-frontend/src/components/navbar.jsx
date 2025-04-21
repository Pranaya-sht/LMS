import { Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    LibraryBig,
    User,
    LogIn,
    LogOut,
    UserPlus,

} from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem('access');

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        navigate('/login');
    };

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-indigo-600 to-pink-500 p-4 shadow-lg text-white sticky top-0 z-50 flex justify-between items-center"
        >
            {/* Brand */}
            <div className="text-2xl font-extrabold tracking-wide flex items-center gap-2 cursor-pointer hover:text-yellow-300 transition"
                onClick={() => navigate('/')}>
                📚 My Library
            </div>

            {/* Centered Links */}
            <div className="flex gap-8 items-center text-lg font-semibold">
                <Link to="/" className="flex items-center gap-1 hover:text-yellow-200 transition">
                    <Home className="w-5 h-5" />
                    Home
                </Link>
                <Link to="/books" className="flex items-center gap-1 hover:text-yellow-200 transition">
                    < LibraryBig className="w-5 h-5" />
                    Books
                </Link>
            </div>

            {/* Right-side Auth/Profile */}
            <div className="flex gap-4 items-center">
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="flex items-center gap-1 hover:text-yellow-200 transition">
                            <User className="w-5 h-5" />
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 px-3 py-1 rounded bg-red-500 hover:bg-red-600 transition text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/register" className="flex items-center gap-1 hover:text-yellow-200 transition">
                            <UserPlus className="w-5 h-5" />
                            Sign Up
                        </Link>
                        <Link to="/login" className="flex items-center gap-1 hover:text-yellow-200 transition">
                            <LogIn className="w-5 h-5" />
                            Login
                        </Link>
                    </>
                )}
            </div>
        </motion.nav>
    );
}
