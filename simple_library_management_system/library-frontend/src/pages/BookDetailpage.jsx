import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import RentalModal from '../components/RentalModal';
import { motion } from 'framer-motion';
import { StarIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';
const BookDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [borrowInfo, setBorrowInfo] = useState(null);
    const [timeLeft, setTimeLeft] = useState(null);

    // Fetch book info
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get(`http://127.0.0.1:8000/api/books/${id}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => setBook(res.data))
            .catch(error => {
                console.error(error);
                if (error.response?.status === 401) {
                    setMessage('Session expired. Please log in again.');
                    localStorage.removeItem('access');
                    navigate('/login');
                } else {
                    setMessage('Failed to load book.');
                }
            });
    }, [id, navigate]);

    // Fetch user's borrowed books
    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) return;

        axios.get('http://127.0.0.1:8000/api/my-books/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                const borrowed = res.data.find(b => b.book.id === parseInt(id));
                if (borrowed) {
                    setBorrowInfo(borrowed);
                    updateCountdown(borrowed);
                }
            })
            .catch(err => console.error('Error fetching borrowed books', err));
    }, [id]);

    // Countdown Timer
    useEffect(() => {
        if (!borrowInfo) return;

        const interval = setInterval(() => {
            updateCountdown(borrowInfo);
        }, 1000);

        return () => clearInterval(interval);
    }, [borrowInfo]);

    const updateCountdown = (borrow) => {
        const borrowedAt = new Date(borrow.borrowed_at).getTime();
        const durationMs = borrow.rental_duration * 1000;
        const deadline = borrowedAt + durationMs;
        const now = new Date().getTime();
        const remaining = Math.max(deadline - now, 0);

        setTimeLeft(remaining > 0 ? remaining : 0);
    };

    const handleAddToBookList = () => {
        setShowModal(true);
    };

    const confirmRental = async (rentalSeconds) => {
        const token = localStorage.getItem('access');
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/rent-book/',
                {
                    book_id: book.id,
                    rental_seconds: rentalSeconds,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setShowModal(false);
            alert('Book rented successfully!');
            window.location.reload(); // reload to fetch new borrowInfo
        } catch (error) {
            console.error(error);
            alert('Failed to rent the book. Please try again.');
        }
    };

    const handleRenew = async () => {
        const token = localStorage.getItem('access');
        try {
            await axios.post(
                `http://127.0.0.1:8000/api/renew-book/${borrowInfo.id}/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Rental renewed!');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Renewal failed.');
        }
    };

    const handleRemove = async () => {
        const token = localStorage.getItem('access');
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/remove-book/${borrowInfo.id}/`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Rental removed.');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Failed to remove rental.');
        }
    };

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    if (!book) return <div className="p-6 text-lg animate-pulse">Loading...</div>;

    // return (
    //     <div className="p-6 bg-gray-50 min-h-screen">
    //         {message && (
    //             <div className="mb-4 text-red-500 font-semibold text-center">{message}</div>
    //         )}

    //         <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto animate-fade-in">
    //             {book.cover_image && (
    //                 <img
    //                     src={book.cover_image}
    //                     alt={book.title}
    //                     className="object-cover rounded-md mb-10 align-middle mx-auto"
    //                 />
    //             )}
    //             <h2 className="text-3xl font-bold mb-2 text-blue-800">{book.title}</h2>
    //             <p className="text-md text-gray-700 mb-1">Author: {book.author}</p>
    //             <p className="text-sm text-gray-600 mb-3">{book.description}</p>
    //             <p className="text-sm text-gray-700">Category: {book.category}</p>
    //             <p className="text-sm text-gray-700">Published: {book.published_date}</p>
    //             <p className="text-sm text-gray-700">Available Copies: {book.available_copies}</p>
    //             <p className="text-sm text-gray-700 mb-3">Total Copies: {book.total_copies}</p>

    //             {borrowInfo ? (
    //                 <>
    //                     <div className="text-green-700 font-semibold mb-2">
    //                         ⏳ Time Left: {formatTime(timeLeft)}
    //                     </div>
    //                     <div className="flex gap-4">
    //                         <button
    //                             onClick={handleRenew}
    //                             className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
    //                         >
    //                             🔁 Renew
    //                         </button>
    //                         {/* <button
    //                             onClick={handleRemove}
    //                             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    //                         >
    //                             ❌ Remove
    //                         </button> */}
    //                     </div>
    //                 </>
    //             ) : (
    //                 <button
    //                     onClick={handleAddToBookList}
    //                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    //                 >
    //                     ➕ Add to Book List
    //                 </button>
    //             )}
    //         </div>

    //         {showModal && (
    //             <RentalModal
    //                 onConfirm={confirmRental}
    //                 onClose={() => setShowModal(false)}
    //             />
    //         )}
    //     </div>
    // );
    // Add these imports at the top
    // import { motion } from 'framer-motion';
    // import { StarIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';

    // Update the return statement with these animations:
    return (
        <div className="p-6 min-h-screen ">
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 text-red-500 font-semibold text-center"
                >
                    {message}
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/60 backdrop-blur-lg rounded-xl shadow-2xl p-6 max-w-3xl mx-auto"
            >
                <div className="flex flex-col md:flex-row gap-8">
                    {book.cover_image && (
                        <motion.img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full md:w-1/3 h-auto object-cover rounded-xl shadow-lg"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        />
                    )}

                    <div className="flex-1">
                        <motion.h2
                            className="text-3xl font-bold mb-2 text-blue-800"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {book.title}
                        </motion.h2>

                        <div className="space-y-3">
                            <motion.p
                                className="flex items-center text-gray-700"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <BookOpenIcon className="h-5 w-5 mr-2 text-blue-500" />
                                Author: {book.author}
                            </motion.p>

                            <motion.p
                                className="text-sm text-gray-600"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {book.description}
                            </motion.p>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {['category', 'published_date', 'available_copies', 'total_copies'].map((field, i) => (
                                    <motion.div
                                        key={field}
                                        className="bg-blue-50 p-3 rounded-lg"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                    >
                                        <p className="text-xs font-semibold text-blue-800 uppercase">{field.replace('_', ' ')}</p>
                                        <p className="text-sm">{book[field]}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {borrowInfo ? (
                            <motion.div
                                className="mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="flex items-center text-green-700 font-semibold mb-4 p-3 bg-green-50 rounded-lg">
                                    <ClockIcon className="h-5 w-5 mr-2" />
                                    ⏳ Time Left: {formatTime(timeLeft)}
                                </div>
                                <div className="flex gap-4">
                                    <motion.button
                                        onClick={handleRenew}
                                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                        Renew
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.button
                                onClick={handleAddToBookList}
                                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <StarIcon className="h-5 w-5 mr-2" />
                                Add to Book List
                            </motion.button>
                        )}
                    </div>
                </div>
            </motion.div>

            {showModal && (
                <RentalModal
                    onConfirm={confirmRental}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default BookDetailPage;
