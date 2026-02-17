import React, { useEffect, useState } from 'react';
import api from '../services/api';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                setBookings(res.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading bookings...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-brand-brown mb-8">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                    <a href="/#book" className="text-brand-green font-bold hover:underline">Book your stay now</a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center bg-white hover:shadow-md transition">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {booking.roomId ? booking.roomId.name : 'Villa (Pending Assignment)'}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="text-gray-600 space-y-1">
                                    <p>📅 <span className="font-medium">Check-in:</span> {new Date(booking.checkIn).toLocaleDateString()} — <span className="font-medium">Check-out:</span> {new Date(booking.checkOut).toLocaleDateString()}</p>
                                    <p>👥 {booking.guests} Guests</p>
                                    <p>💰 Total: ${booking.totalPrice}</p>
                                </div>
                            </div>

                            {booking.status === 'pending' && (
                                <div className="mt-4 md:mt-0 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                                    Awaiting admin approval
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
