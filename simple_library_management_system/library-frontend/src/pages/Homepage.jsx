import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../index.css'; // from pages/Homepage.jsx
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const HomePage = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/books/')
            .then(res => setBooks(res.data))
            .catch(err => console.error(err));
    }, []);

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 min-h-screen overflow-hidden">
            <motion.h1
                className="text-3xl md:text-4xl font-bold text-center mb-8 text-blue-800 typing-effect"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                📖 Discover Your Next Favorite Book
            </motion.h1>

            <motion.div
                className="relative mb-8 mx-auto w-full md:w-1/2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by title..."
                    className="w-full pl-10 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-90"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </motion.div>

            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                {filteredBooks.map((book, index) => (
                    <Link to={`/book/${book.id}`} key={book.id}>
                        <motion.div
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            whileHover={{ y: -5 }}
                        >
                            {book.cover_image && (
                                <motion.img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className="w-full h-48 object-cover"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                            <div className="p-4">
                                <motion.h2 className="text-lg font-semibold text-blue-600 hover:underline">
                                    {book.title}
                                </motion.h2>
                                <p className="text-sm text-gray-600">Author: {book.author}</p>
                                <motion.p
                                    className="text-xs text-gray-500 mt-2 line-clamp-2"
                                    whileHover={{ color: "#4b5563" }}
                                >
                                    {book.description}
                                </motion.p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </motion.div>
        </div>
    );
};

export default HomePage;
