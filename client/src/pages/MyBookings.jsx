import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Calendar, Users, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', 'inquiries'

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'inquiry': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            case 'inquiry': return <Clock size={16} />;
            default: return <AlertCircle size={16} />;
        }
    };

    // Filter bookings based on active tab
    const filteredBookings = bookings.filter(b => {
        const isInquiry = b.type === 'long_stay_inquiry';
        const isPast = new Date(b.checkOut) < new Date() && b.status !== 'cancelled' && !isInquiry;
        const isCancelled = b.status === 'cancelled';

        if (activeTab === 'inquiries') return isInquiry;
        if (activeTab === 'past') return isPast || isCancelled; // Show cancelled in past/history
        return !isPast && !isInquiry && !isCancelled; // Upcoming includes pending/confirmed standard bookings
    });

    const handleCancel = async (bookingId) => {
        if (window.confirm("Are you sure you want to cancel this booking?")) {
            try {
                await api.put(`/bookings/${bookingId}/cancel`);
                setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
            } catch (err) {
                console.error("Failed to cancel booking", err);
                alert("Failed to cancel booking: " + (err.response?.data?.message || err.message));
            }
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gray-50/50">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-serif text-brand-dark mb-2">My Bookings</h1>
                    <p className="text-gray-500">Manage your upcoming stays and inquiries</p>
                </div>

                <div className="flex gap-2 mt-4 md:mt-0 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                    {['upcoming', 'past', 'inquiries'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                ? 'bg-brand-brown text-white shadow'
                                : 'text-gray-600 hover:bg-gray-50'
                                } capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBookings.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
                    <div className="bg-brand-bg p-4 rounded-full mb-4">
                        <Calendar size={48} className="text-brand-brown opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No {activeTab} bookings found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {activeTab === 'inquiries'
                            ? "You haven't made any long stay inquiries yet. Planning a longer vacation?"
                            : "Ready to plan your next escape to paradise?"}
                    </p>
                    <Link to="/#book" className="px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-dark transition shadow-lg flex items-center gap-2">
                        Book Your Stay <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredBookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                            <div className="flex flex-col md:flex-row">
                                {/* Image Section */}
                                <div className="md:w-1/3 lg:w-1/4 relative min-h-[200px] md:min-h-0">
                                    <img
                                        src={booking.roomTypeId?.images?.[0] || "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80"}
                                        alt="Room"
                                        className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition duration-700"
                                    />
                                    <div className="absolute top-4 left-4 md:hidden">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            {booking.status === 'inquiry' ? 'Inquiry Sent' : booking.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-brand-dark mb-1">
                                                    {booking.roomTypeId?.title || (booking.type === 'long_stay_inquiry' ? 'Long Stay Inquiry' : 'Villa Booking')}
                                                </h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <MapPin size={14} /> Unawatuna, Sri Lanka
                                                </p>
                                            </div>
                                            <div className="hidden md:block">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 border ${getStatusColor(booking.status)}`}>
                                                    {getStatusIcon(booking.status)}
                                                    {booking.status === 'inquiry' ? 'Inquiry Sent' : booking.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-6 border-t border-gray-100">
                                            {booking.type === 'long_stay_inquiry' ? (
                                                <>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                            <Clock size={16} className="text-brand-brown" />
                                                            {booking.duration}
                                                        </p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Contact Email</p>
                                                        <p className="font-medium text-gray-800">{booking.contactEmail}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
                                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                            <Calendar size={16} className="text-brand-brown" />
                                                            {new Date(booking.checkIn).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
                                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                            <Calendar size={16} className="text-brand-brown" />
                                                            {new Date(booking.checkOut).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Meal Plan</p>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <Utensils size={16} className="text-brand-brown" />
                                                    <span className="capitalize">{booking.mealPlan?.replace(/_/g, ' ') || 'Bed & Breakfast'}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Guests</p>
                                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <Users size={16} className="text-brand-brown" />
                                                    {booking.guests}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Price</p>
                                                <p className="font-bold text-brand-green text-lg">
                                                    {booking.type === 'long_stay_inquiry' ? 'Pending Quote' : `$${booking.totalPrice}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 italic">
                                            {booking.status === 'pending' && "Your booking is awaiting confirmation."}
                                            {booking.status === 'inquiry' && "We will email you a custom quotation shortly."}
                                            {booking.status === 'confirmed' && "Booking confirmed. See you soon!"}
                                            {booking.status === 'cancelled' && "This booking has been cancelled."}
                                            {booking.status === 'completed' && "Thank you for staying with us!"}
                                        </p>

                                        <div className="flex gap-3">
                                            {(booking.status === 'pending' || booking.status === 'confirmed') && booking.type !== 'long_stay_inquiry' && (
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    className="text-sm font-bold text-red-500 hover:text-red-700 transition"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            <button className="text-sm font-bold text-brand-brown hover:text-brand-dark transition flex items-center gap-1 group/btn">
                                                View Details <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
