import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RentalModal from '../components/RentalModal';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, ClockIcon, CurrencyDollarIcon, BookOpenIcon } from '@heroicons/react/24/outline';

function BooksList() {
    const [books, setBooks] = useState([]);
    const [message, setMessage] = useState('');
    const [totalDue, setTotalDue] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('access');

    const calculateRemainingTime = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        return Math.max(0, Math.floor((due - now) / 1000));
    };

    const calculateDue = (dueDate) => {
        const now = new Date();
        const due = new Date(dueDate);
        const overdueSeconds = Math.max(0, (now - due) / 1000);
        const daysLate = Math.ceil(overdueSeconds / 86400);
        return daysLate * 10;
    };

    const fetchUserBooks = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        // =>Accumlate fine
        // -> Renew Garda (accumulate) fine badnuparyo 
        // -> Return Garda (accumlate) fine badnuparyo
        // -> Book Bujaxaina front end ma database ma vako + dynamic fine [duedate-current time] fine 

        try {
            const res = await axios.get('http://localhost:8000/api/my-books/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const updatedBooks = res.data.map(book => ({
                ...book,
                remaining: calculateRemainingTime(book.due_date),
                due: parseFloat(book.fine_amount) + calculateDue(book.due_date)
            }));

            setBooks(updatedBooks);
            setMessage('');
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) {
                setMessage('Session expired. Please log in again.');
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                navigate('/login');
            } else {
                setMessage('Failed to load your rented books.');
            }
        }
    };

    useEffect(() => {
        fetchUserBooks();

        const interval = setInterval(() => {
            setBooks(prev =>
                prev.map(book => ({
                    ...book,
                    remaining: calculateRemainingTime(book.due_date),
                    due: parseFloat(book.fine_amount) + calculateDue(book.due_date),
                }))
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const total = books.reduce((sum, book) => sum + book.due, 0);
        setTotalDue(total);
    }, [books]);

    const handleRenew = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const handleRemove = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/remove-book/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBooks(books.filter(b => b.id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to remove book.");
        }
    };

    const handleRenewConfirmation = async (newDurationInSeconds) => {
        if (!selectedBook) return;

        try {
            const response = await fetch(`http://localhost:8000/api/renew-book/${selectedBook.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rental_seconds: newDurationInSeconds }),
            });

            if (!response.ok) throw new Error('Failed to renew book');

            setShowModal(false);
            setSelectedBook(null);
            fetchUserBooks(); // ✅ re-fetch after renewal
        } catch (error) {
            console.error('Renew error:', error);
            alert('Failed to renew book. Please try again.');
        }
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const filteredBooks = books.filter(book =>
        book?.book_title?.toLowerCase().includes(search.toLowerCase())
    );

    const heading = (
        <motion.h2
            className="text-2xl md:text-3xl font-bold mb-8 text-center inline-flex items-center justify-center"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        >
            <motion.span
                className="inline-flex items-center mr-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <BookOpenIcon className="h-8 w-8 text-blue-800" />
            </motion.span>
            {"Your Rented Books".split(" ").map((word, i) => (
                <span key={i} className="inline-flex">
                    {word.split("").map((char, j) => (
                        <motion.span
                            key={j}
                            className="inline-block"
                            variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: {
                                    y: 0,
                                    opacity: 1,
                                    transition: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                        delay: (i + j) * 0.05,
                                    },
                                },
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                    <span>&nbsp;</span>
                </span>
            ))}
        </motion.h2>
    );

    return (
        <div className="min-h-screen py-10 px-4">
            <motion.h2 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-500 to-purple-600">
                {heading}
            </motion.h2>

            <motion.div className="relative mb-8 mx-auto w-full md:w-1/2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by title..."
                    className="w-full pl-10 p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </motion.div>

            {message && (
                <motion.p className="text-red-600 mb-4 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {message}
                </motion.p>
            )}

            {filteredBooks.length ? (
                <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {filteredBooks.map((book, index) => (
                            <motion.div
                                key={book.id}
                                className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="font-semibold text-xl mb-2">{book.book_title}</div>
                                <div className="text-gray-500 text-sm mb-3">by {book.book_author}</div>
                                {book.cover_image && (
                                    <motion.img
                                        src={book.cover_image}
                                        alt={book.book_title}
                                        className="w-full rounded-lg h-48 object-cover mb-3"
                                        whileHover={{ scale: 1.03 }}
                                    />
                                )}
                                <div className="flex items-center text-blue-700 mb-2">
                                    <ClockIcon className="h-5 w-5 mr-2" />
                                    ⏳ Time Left: {formatTime(book.remaining)}
                                </div>
                                <div className="flex items-center text-red-600 mb-4">
                                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                                    💰 Due: Rs. {book.due}
                                </div>
                                <div className="flex gap-3">
                                    <motion.button
                                        onClick={() => handleRenew(book)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        🔁 Renew
                                    </motion.button>
                                    <motion.button
                                        onClick={() => handleRemove(book.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        ❌ Remove
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div
                        className="mt-8 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl max-w-md mx-auto text-center font-bold text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: books.length * 0.1 + 0.3 }}
                    >
                        💵 Total Due: Rs. {totalDue}
                    </motion.div>
                </>
            ) : !message ? (
                <motion.p className="text-center text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    No rented books found.
                </motion.p>
            ) : (
                <motion.p className="text-center text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    No books match your search.
                </motion.p>
            )}

            {showModal && selectedBook && (
                <RentalModal
                    book={selectedBook}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleRenewConfirmation}
                />
            )}
        </div>
    );
}

export default BooksList;