import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/auth/users/', formData);
            setMessage('🎉 User registered successfully!');
        } catch (error) {
            if (error.response && error.response.data) {
                setMessage(JSON.stringify(error.response.data));
            } else {
                setMessage("Something went wrong.");
            }
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-300 via-purple-200 to-pink-200">
            <div className="absolute top-10 right-10 w-80 h-80 bg-purple-300 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
            <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-2xl px-10 py-8 w-full max-w-md space-y-5 backdrop-blur-sm bg-opacity-80"
            >
                <h2 className="text-2xl font-bold text-center text-purple-700">Create Account</h2>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
                >
                    Sign Up
                </motion.button>
                {message && <p className="text-sm text-center text-red-500 mt-2">{message}</p>}
            </motion.form>
        </div>
    );
};

export default RegisterForm;
