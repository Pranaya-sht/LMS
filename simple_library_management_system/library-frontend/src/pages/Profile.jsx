import React, { useEffect, useState } from 'react';
import axios from 'axios';

const svgPaths = [
    '/undraw_road-to-knowledge_f9zn.svg',
    '/undraw_bibliophile_sbt0.svg',
    '/undraw_reading-time_gcvc.svg',
    '/undraw_book_lover_re_rw8g.svg',
];

const Profile = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        memberSince: "",
        contact: "",
        address: "",
        totalDue: 0.0
    });

    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        address: "",
    });

    const [currentIndex, setCurrentIndex] = useState(0);


    // Fetch user profile data from the backend
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // const response = await axios.get('http://localhost:8000/api/api/profile');
                //  // Replace with actual API endpoint

                const token = localStorage.getItem('access');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const response = await axios.get(`http://localhost:8000/api/api/profile/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                console.log(response.data);
                setUser(response.data);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    contact: response.data.contact,
                    address: response.data.address,
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % svgPaths.length);
        }, 6000); // Change every 6 seconds
        return () => clearInterval(interval);
    }, []);

    const handleEditToggle = () => {
        setEditing((prev) => !prev);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await axios.put('http://localhost:8000/api/api/profile/', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }); // Replace with actual API endpoint

            setUser(response.data);
            setEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 overflow-hidden">
            {/* Fullscreen Animated SVG Background */}
            <img
                src={svgPaths[currentIndex]}
                alt="Background illustration"
                className="absolute inset-0 w-full h-full object-cover opacity-10 transition-opacity duration-1000 ease-in-out pointer-events-none z-0"
                key={svgPaths[currentIndex]}
            />

            {/* Profile Card */}
            <div className="z-10 max-w-md bg-white shadow-xl rounded-2xl p-8 backdrop-blur-md bg-opacity-90">
                <h2 className="text-3xl font-bold mb-6 text-indigo-700 flex items-center gap-2">
                    <span>👤</span> Profile
                </h2>
                <form onSubmit={handleSubmit}>
                    <p className="mb-4">
                        <strong className="text-gray-700">Name:</strong>
                        {/* <p>{JSON.stringify(formData)}</p> */}
                        {editing ? (
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="ml-2 border rounded p-2"
                            />
                        ) : (
                            ` ${user.name}`
                        )}
                    </p>
                    <p className="mb-4">
                        <strong className="text-gray-700">Email:</strong>
                        {editing ? (
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="ml-2 border rounded p-2"
                            />
                        ) : (
                            ` ${user.email}`
                        )}
                    </p>
                    <p className="mb-4">
                        <strong className="text-gray-700">Contact:</strong>
                        {editing ? (
                            <input
                                type="text"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                className="ml-2 border rounded p-2"
                            />
                        ) : (
                            ` ${user.contact}`
                        )}
                    </p>
                    <p className="mb-4">
                        <strong className="text-gray-700">Address:</strong>
                        {editing ? (
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="ml-2 border rounded p-2 w-full"
                            />
                        ) : (
                            ` ${user.address}`
                        )}
                    </p>
                    <p className="mb-4">
                        <strong className="text-gray-700">Member Since:</strong> {user.memberSince}
                    </p>
                    <p className="mb-4">
                        <strong className="text-gray-700">Total Due:</strong> ₹{user.totalDue}
                    </p>
                    <button
                        type="button"
                        onClick={handleEditToggle}
                        className="bg-blue-500 text-white rounded p-2 mr-4"
                    >
                        {editing ? 'Cancel' : 'Edit Profile'}
                    </button>
                    {editing && (
                        <button
                            type="submit"
                            className="bg-green-500 text-white rounded p-2"
                        >
                            Save Changes
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
