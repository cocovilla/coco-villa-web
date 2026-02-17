import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import AdminImageManager from '../components/AdminImageManager';
import AdminRoomManager from '../components/AdminRoomManager';
import AdminAvailabilityManager from '../components/AdminAvailabilityManager';
import AdminExperienceManager from '../components/AdminExperienceManager';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllBookings = async () => {
            try {
                const res = await api.get('/bookings/all');
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    navigate('/'); // Redirect if not unauthorized
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAllBookings();
    }, [navigate]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus });
            // Optimistic update
            setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-brand-brown mb-8">Admin Dashboard</h1>

            <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Guest</th>
                            <th className="px-6 py-4">Dates</th>
                            <th className="px-6 py-4">Room</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.map((booking) => (
                            <tr key={booking._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{booking.userId?.name || 'Unknown User'}</div>
                                    <div className="text-sm text-gray-500">{booking.userId?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                                    <div className="text-gray-400">to</div>
                                    <div>{new Date(booking.checkOut).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    {booking.roomId ? (
                                        <span className="font-medium text-brand-green">{booking.roomId.name}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                className="bg-brand-green text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 font-medium"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                            className="text-red-500 hover:text-red-700 text-sm underline"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bookings.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No bookings found.</div>
                )}
            </div>
            {/* Room Management Section */}
            <AdminRoomManager />

            {/* Availability Management Section */}
            <AdminAvailabilityManager />

            {/* Experience Management Section */}
            <AdminExperienceManager />

            {/* Image Management Section */}
            <AdminImageManager />

        </div>
    );
};

export default AdminDashboard;
