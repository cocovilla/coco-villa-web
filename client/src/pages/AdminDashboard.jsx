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
    MoreHorizontal,
    Menu,
    X,
    Utensils
} from 'lucide-react';
import AdminImageManager from '../components/AdminImageManager';
import AdminRoomManager from '../components/AdminRoomManager';
import AdminAvailabilityManager from '../components/AdminAvailabilityManager';
import AdminExperienceManager from '../components/AdminExperienceManager';
import AdminFacilityManager from '../components/AdminFacilityManager';
import AdminMealPlanManager from '../components/AdminMealPlanManager';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Confirmation State
    const [confirmation, setConfirmation] = useState({
        show: false,
        bookingId: null,
        newStatus: null,
        message: ''
    });

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

    const handleStatusUpdate = (id, newStatus) => {
        let message = `Are you sure you want to mark this booking as ${newStatus}?`;
        if (newStatus === 'cancelled') message = "Are you sure you want to CANCEL this booking? This action cannot be undone.";
        if (newStatus === 'rejected') message = "Are you sure you want to REJECT this booking request?";

        setConfirmation({
            show: true,
            bookingId: id,
            newStatus: newStatus,
            message: message
        });
    };

    const confirmStatusUpdate = async () => {
        const { bookingId, newStatus } = confirmation;
        setProcessing(true);
        try {
            await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
            setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
            toast.success(`Booking marked as ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        } finally {
            setProcessing(false);
            setConfirmation({ show: false, bookingId: null, newStatus: null, message: '' });
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
            onClick={() => {
                setActiveTab(id);
                setIsSidebarOpen(false); // Close sidebar on mobile when item selected
            }}
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
                                        {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <DollarSign size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Revenue</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        ${bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((sum, b) => sum + (b.totalPrice || 0), 0)}
                                    </p>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {bookings.filter(b => b.status === 'completed').length} completed stays
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
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto">
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
                                                            <div>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</div>
                                                            <div className="text-xs text-gray-400">
                                                                {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} Nights
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-brand-green">
                                                            {booking.roomId?.name || <span className="text-gray-400 italic">Unassigned</span>}
                                                            <div className="text-xs text-gray-500 mt-1 capitalize">
                                                                {booking.mealPlan?.replace(/_/g, ' ') || 'Bed & Breakfast'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
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
                                                                <>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-opacity-90 font-medium transition"
                                                                        title="Mark as completed/stayed"
                                                                    >
                                                                        Complete
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                                        className="text-red-500 hover:text-red-700 text-xs underline ml-2"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {booking.status === 'completed' && (
                                                                <span className="text-gray-400 text-xs italic">Finished</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4">
                                        {bookings.map((booking) => (
                                            <div key={booking._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden">
                                                {/* Status Stripe */}
                                                <div className={`absolute top-0 left-0 bottom-0 w-1 
                                                    ${booking.status === 'confirmed' ? 'bg-green-500' :
                                                        booking.status === 'completed' ? 'bg-blue-500' :
                                                            booking.status === 'pending' ? 'bg-yellow-500' :
                                                                'bg-red-500'}`}></div>

                                                {/* Header */}
                                                <div className="pl-3 flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-lg">{booking.userId?.name || 'Unknown User'}</div>
                                                        <div className="text-xs text-gray-500">{booking.userId?.email}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>

                                                {/* Details Grid */}
                                                <div className="pl-3 grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mt-1">
                                                    <div className="col-span-2 flex items-center gap-2">
                                                        <CalendarCheck size={16} className="text-gray-400 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-800">
                                                                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} Nights
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-2 border-t border-gray-50 pt-2 mt-1">
                                                        <BedDouble size={16} className="text-gray-400 shrink-0" />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-brand-green">
                                                                {booking.roomId?.name || <span className="text-gray-400 italic font-normal">Unassigned Room</span>}
                                                            </span>
                                                            <span className="text-xs text-gray-400 capitalize">
                                                                {booking.mealPlan?.replace(/_/g, ' ') || 'Bed & Breakfast'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="pl-3 pt-3 mt-1 border-t border-gray-100 flex gap-3">
                                                    {booking.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                                                className="flex-1 bg-brand-green text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-opacity-90 transition shadow-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                className="flex-1 bg-white border border-red-200 text-red-600 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition shadow-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking._id, 'completed')}
                                                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition shadow-sm"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                                                className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition shadow-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                    {booking.status === 'completed' && (
                                                        <div className="w-full text-center py-2 bg-gray-50 rounded text-xs text-gray-400 italic">
                                                            Stay Completed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'rooms':
                return <AdminRoomManager />;
            case 'availability':
                return <AdminAvailabilityManager />;
            case 'mealPlans':
                return <AdminMealPlanManager />;
            case 'facilities':
                return <AdminFacilityManager />;
            case 'experience':
                return <AdminExperienceManager />;
            case 'gallery':
                return <AdminImageManager />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-green text-white flex flex-col shadow-xl transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                    <div className="flex flex-col items-center flex-1">
                        <h1 className="text-2xl font-serif font-bold tracking-widest text-center leading-none">
                            COCO VILLA
                        </h1>
                        <span className="text-xs font-sans font-light tracking-[0.3em] text-brand-brown opacity-80 block mt-1">ADMIN PORTAL</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden text-white/70 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
                    <SidebarItem id="availability" label="Availability" icon={CalendarCheck} />
                    <SidebarItem id="mealPlans" label="Meal Plans" icon={Utensils} />
                    <SidebarItem id="facilities" label="Facilities" icon={Wifi} />

                    <div className="pt-6 pb-2 px-4">
                        <span className="text-xs uppercase tracking-wider text-brand-brown font-bold opacity-80">Management</span>
                    </div>

                    <SidebarItem id="rooms" label="Rooms" icon={BedDouble} />
                    <SidebarItem id="experience" label="Experience" icon={Sparkles} />
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
                <header className="bg-white h-20 shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden text-gray-500 hover:text-brand-green transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl md:text-2xl font-serif font-bold text-gray-800 capitalize truncate">
                            {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-brand-green transition-colors relative">
                            <Bell size={24} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="p-4 md:p-8 pb-20">
                    {renderContent()}
                </div>
            </main>

            {/* Confirmation Modal */}
            {confirmation.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="p-6">
                            <h3 className="text-2xl font-serif text-brand-dark mb-2">
                                Confirm Action
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                {confirmation.message}
                            </p>

                            <div className="bg-brand-bg/50 rounded-xl p-4 mb-6 space-y-3 border border-brand-brown/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Action</span>
                                    <span className="font-bold text-brand-dark uppercase tracking-wider">{confirmation.newStatus}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Booking ID</span>
                                    <span className="font-medium text-brand-dark font-mono text-xs">{confirmation.bookingId}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmation({ show: false, bookingId: null, newStatus: null, message: '' })}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmStatusUpdate}
                                    className={`flex-1 px-4 py-3 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors shadow-lg flex justify-center items-center gap-2
                                        ${confirmation.newStatus === 'confirmed' ? 'bg-brand-green hover:bg-green-700' :
                                            confirmation.newStatus === 'completed' ? 'bg-blue-600 hover:bg-blue-700' :
                                                'bg-red-500 hover:bg-red-700'}
                                        ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Confirm</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
