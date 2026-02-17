import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminRoomManager = () => {
    const [roomType, setRoomType] = useState(null); // The actual data object from API
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pricePerNight: '',
        maxGuests: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoomData();
    }, []);

    const fetchRoomData = async () => {
        try {
            const res = await api.get('/rooms/type');
            if (res.data) {
                setRoomType(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch room type", err);
            setError("Failed to load room data.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        if (roomType) {
            setFormData({
                title: roomType.title || '',
                description: roomType.description || '',
                pricePerNight: roomType.pricePerNight || '',
                maxGuests: roomType.maxGuests || ''
            });
            setIsEditing(true);
            setMessage(null);
            // Scroll to form
            setTimeout(() => {
                document.getElementById('edit-room-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            const res = await api.put('/rooms/type', formData);
            setRoomType(res.data); // Update local view with new server data
            setMessage("Room details updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update room type", err);
            setError("Failed to update. Please try again.");
        }
    };

    if (loading) return <div className="p-4 text-center">Loading Room Details...</div>;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Manage Room Details</h2>

            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {/* Table Section */}
            <div className="overflow-x-auto mb-8">
                <table className="min-w-full text-left border rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Room Type</th>
                            <th className="px-6 py-3">Price / Night</th>
                            <th className="px-6 py-3">Max Guests</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 border-t">
                        {roomType ? (
                            <tr className="hover:bg-gray-50 transition group">
                                <td className="px-6 py-4 font-medium text-gray-900">{roomType.title}</td>
                                <td className="px-6 py-4 text-brand-green font-bold">${roomType.pricePerNight}</td>
                                <td className="px-6 py-4 text-gray-600">{roomType.maxGuests}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={handleEditClick}
                                        className="text-white bg-brand-green px-3 py-1 rounded text-sm hover:bg-brand-dark transition shadow-sm"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No room types found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Edit Form Section (Conditional) */}
            {isEditing && (
                <div id="edit-room-form" className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-gray-800">Edit Room: <span className="text-brand-green">{roomType?.title}</span></h3>
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Night ($)</label>
                                <input
                                    type="number"
                                    name="pricePerNight"
                                    value={formData.pricePerNight}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                            <input
                                type="number"
                                name="maxGuests"
                                value={formData.maxGuests}
                                onChange={handleChange}
                                className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                                required
                                min="1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-brand-btn text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminRoomManager;
