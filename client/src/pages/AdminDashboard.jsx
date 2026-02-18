import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import {
    LayoutDashboard,
    BedDouble,
    CalendarCheck,
    Sparkles,
    Wifi,
    Image,
    LogOut,
    Bell,
    Users,
    Clock,
    DollarSign,
    MoreHorizontal
} from 'lucide-react';
import AdminImageManager from '../components/AdminImageManager';
import AdminRoomManager from '../components/AdminRoomManager';
import AdminAvailabilityManager from '../components/AdminAvailabilityManager';
import AdminExperienceManager from '../components/AdminExperienceManager';
import AdminFacilityManager from '../components/AdminFacilityManager';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    // Fetch bookings only when dashboard tab is active or initially
    useEffect(() => {
        if (activeTab === 'dashboard') {
            const fetchAllBookings = async () => {
                try {
                    setLoading(true);
                    const res = await api.get('/bookings/all');
                    setBookings(res.data);
                } catch (err) {
                    console.error("Failed to fetch bookings", err);
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        navigate('/');
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchAllBookings();
        }
    }, [navigate, activeTab]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/bookings/${id}/status`, { status: newStatus });
            setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
            toast.success(`Booking ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
        navigate('/');
    };

    const SidebarItem = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === id
                ? 'bg-white/10 border-l-4 border-brand-brown pl-3 font-semibold text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Bookings</p>
                                    <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {bookings.filter(b => b.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <CalendarCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Confirmed</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {bookings.filter(b => b.status === 'confirmed').length}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Revenue</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ${bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-800">Recent Bookings</h3>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center text-gray-500">Loading bookings...</div>
                            ) : bookings.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No bookings found.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Guest Info</th>
                                                <th className="px-6 py-4">Dates</th>
                                                <th className="px-6 py-4">Room Type</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {bookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{booking.userId?.name || 'Unknown User'}</div>
                                                        <div className="text-xs text-gray-500">{booking.userId?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                        <div className="text-xs text-gray-400">
                                                            {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} Nights
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-brand-green">
                                                        {booking.roomId?.name || <span className="text-gray-400 italic">Unassigned</span>}
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
                                                                    className="bg-brand-green text-white px-3 py-1 rounded text-xs hover:bg-opacity-90 font-medium transition"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-opacity-90 font-medium transition"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {booking.status === 'confirmed' && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                                className="text-red-500 hover:text-red-700 text-xs underline"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'rooms':
                return <AdminRoomManager />;
            case 'availability':
                return <AdminAvailabilityManager />;
            case 'experience':
                return <AdminExperienceManager />;
            case 'facilities':
                return <AdminFacilityManager />;
            case 'gallery':
                return <AdminImageManager />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-green text-white flex flex-col shadow-xl z-20 shrink-0">
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center border-b border-white/10">
                    <h1 className="text-2xl font-serif font-bold tracking-widest text-center leading-none">
                        COCO VILLA<br />
                        <span className="text-xs font-sans font-light tracking-[0.3em] text-brand-brown opacity-80 block mt-1">ADMIN PORTAL</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <SidebarItem id="availability" label="Availability" icon={CalendarCheck} />

                    <div className="pt-6 pb-2 px-4">
                        <span className="text-xs uppercase tracking-wider text-brand-brown font-bold opacity-80">Management</span>
                    </div>

                    <SidebarItem id="rooms" label="Rooms" icon={BedDouble} />
                    <SidebarItem id="experience" label="Experience" icon={Sparkles} />
                    <SidebarItem id="facilities" label="Facilities" icon={Wifi} />
                    <SidebarItem id="gallery" label="Gallery Images" icon={Image} />
                </nav>

                {/* User Profile / Logout */}
                <div className="p-4 border-t border-white/10 bg-black/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider py-3 rounded transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-brand-light">
                {/* Header */}
                <header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-2xl font-serif font-bold text-gray-800 capitalize">
                        {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-brand-green transition-colors relative">
                            <Bell size={24} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="p-8 pb-20">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
