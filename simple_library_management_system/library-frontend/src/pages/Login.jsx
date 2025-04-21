import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/auth/jwt/create/', {
                username,
                password
            });

            const { access, refresh } = res.data;
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);
            setMessage('Login successful!');
            navigate('/dashboard');
        } catch (error) {
            setMessage("Invalid credentials, please try again.");
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300">
            <div className="absolute w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-300 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
            <motion.form
                onSubmit={handleLogin}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white shadow-2xl rounded-2xl px-10 py-8 w-full max-w-md space-y-5 backdrop-blur-sm bg-opacity-80"
            >
                <h2 className="text-2xl font-bold text-center text-indigo-700">Login</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                    Login
                </motion.button>
                {message && <p className="text-sm text-center text-red-500">{message}</p>}
            </motion.form>
        </div>
    );
}

export default Login;
