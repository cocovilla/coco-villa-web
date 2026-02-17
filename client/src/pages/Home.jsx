import React, { useEffect, useState } from 'react';
import BookingForm from '../components/BookingForm';
import GardenGallery from '../components/GardenGallery';
import RoomCarousel from '../components/RoomCarousel';
import api from '../services/api';
import { Wifi, Tv, BedDouble, ParkingCircle, Plane, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Assuming react-router-dom is used
import toast from 'react-hot-toast';

const Home = () => {
    const [experienceContent, setExperienceContent] = useState({
        description: "Nestled in a quiet coconut grove, simply a short stroll from the pristine Unawatuna beach, Coco Villa offers a private escape. Our eco-friendly design harmonizes with nature, providing a serene backdrop for your tropical getaway."
    });
    const [experienceImages, setExperienceImages] = useState([
        "/room_detail.jpg",
        "/beach.jpg"
    ]);
    const [user, setUser] = useState(null);

    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [roomType, setRoomType] = useState(null);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isAvailable, setIsAvailable] = useState(null);
    const [checking, setChecking] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [gardenImages, setGardenImages] = useState([]);
    const [roomImages, setRoomImages] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [nights, setNights] = useState(0);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            if (storedUser.isVerified) setIsVerified(true);
            setEmail(storedUser.email);
        }

        const fetchContent = async () => {
            try {
                // Fetch Experience Content
                const expRes = await api.get('/images/experience');
                if (expRes.data.textContent) {
                    setExperienceContent(prevState => ({
                        ...prevState,
                        description: expRes.data.textContent.content || prevState.description
                    }));
                }
                if (expRes.data.images && expRes.data.images.length > 0) {
                    setExperienceImages(expRes.data.images.map(img => `http://localhost:5000${img.imageUrl}`));
                }

                // ... (existing room/image fetches)
            } catch (err) {
                console.error("Failed to fetch content", err);
            }
        };
        fetchContent();

        const fetchRoomData = async () => {
            try {
                const res = await api.get('/rooms/type');
                setRoomType(res.data);
            } catch (err) {
                console.error("Failed to fetch room data", err);
                // Fallback data
                setRoomType({
                    title: "Deluxe Garden Villa",
                    pricePerNight: 45,
                    amenities: ["WiFi", "AC", "Private Patio", "King Bed"],
                    description: "Nestled in a private coconut grove, CocoVilla offers a perfect blend of modern comfort and natural beauty."
                });
            }
        };
        fetchRoomData();

        // Original image fetching logic (kept for consistency with original file structure, but modified to align with snippet's removal of image states)
        const fetchImages = async () => {
            try {
                const SERVER = 'http://localhost:5000';

                // Hero - (Commented out in original, keeping it that way or ignoring)
                // const heroRes = await api.get('/images/hero');

                // Garden
                const gardenRes = await api.get('/images/garden');
                if (gardenRes.data.images && gardenRes.data.images.length > 0) {
                    setGardenImages(gardenRes.data.images.map(img => `${SERVER}${img.imageUrl}`));
                }

                // Rooms
                const roomImgRes = await api.get('/images/rooms');
                if (roomImgRes.data.images && roomImgRes.data.images.length > 0) {
                    setRoomImages(roomImgRes.data.images.map(img => `${SERVER}${img.imageUrl}`));
                }

            } catch (err) {
                console.error("Failed to fetch images", err);
            }
        };
        fetchImages();
    }, []);

    const handleCheckAvailability = async () => {
        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates");
            return;
        }
        setChecking(true);
        try {
            const res = await api.get(`/bookings/check-availability?checkIn=${checkIn}&checkOut=${checkOut}`);
            setIsAvailable(res.data.available);
            if (!res.data.available) {
                toast.error("Sorry, these dates are not available.");
            } else if (roomType) {
                const n = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
                setNights(n);
                setTotalPrice(n * roomType.pricePerNight);
            }
        } catch (err) {
            console.error("Failed to check availability", err);
            toast.error("Error checking availability");
        } finally {
            setChecking(false);
        }
    };

    const handleSendOtp = async () => {
        if (!email) {
            toast.error("Please enter your email.");
            return;
        }
        setAuthLoading(true);
        try {
            await api.post('/auth/send-otp', { email });
            setShowOtpInput(true);
            toast.success(`Verification code sent to ${email}`);
        } catch (err) {
            console.error("Send OTP failed", err);
            toast.error("Failed to send code. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.error("Please enter the verification code.");
            return;
        }
        setAuthLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, code: otp });
            // Save user and token
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            setIsVerified(true);
            toast.success("Email verified! You can now complete your booking.");
        } catch (err) {
            console.error("Verify OTP failed", err);
            toast.error("Invalid code. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleBooking = async () => {
        if (!isVerified) {
            toast.error("Please verify your email first.");
            return;
        }
        if (!isAvailable) {
            toast.error("Please check availability first.");
            return;
        }

        try {
            // Calculate total price (rough estimate for frontend, backend should validate)
            // const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
            // const totalPrice = nights * roomType.pricePerNight; // Already calculated in state

            await api.post('/bookings', {
                roomTypeId: roomType._id,
                checkIn,
                checkOut,
                guests: adults + children,
                totalPrice,
                message: "Booking request from website"
            });
            toast.success('Booking request sent! Waiting for admin approval.');
            // Reset
            setCheckIn('');
            setCheckOut('');
            setIsAvailable(null);
            // Optional: Don't logout user so they can see their booking
        } catch (err) {
            console.error("Booking failed", err);
            toast.error(err.response?.data?.message || 'Booking failed');
        }
    };

    if (!roomType) return <div className="text-center py-20">Loading...</div>;

    // Adjusted roomImages based on the snippet's logic
    const roomImagesForCarousel = roomType.images && roomType.images.length > 0
        ? roomType.images
        : ["/room_placeholder.jpg"];

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text">

            {/* Hero Section */}
            <div className="relative h-screen">
                <div className="absolute inset-0">
                    <img
                        src="/hero.png"
                        alt="Coco Villa Hero"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
                    <span className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90">Welcome to Paradise</span>
                    <h1 className="text-4xl md:text-7xl font-serif font-bold mb-6 tracking-wide">
                        COCO VILLA
                    </h1>
                    <p className="text-base md:text-xl font-light max-w-2xl mb-10 opacity-90">
                        Experience the perfect blend of luxury and nature in Unawatuna
                    </p>
                    <a href="#book" className="inline-block bg-brand-brown/90 text-white text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:bg-brand-brown transition shadow-lg backdrop-blur-sm border border-white/20">
                        Book Now
                    </a>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">

                {/* Intro Section */}
                <div className="bg-white rounded-t-3xl shadow-xl p-6 md:p-12 mb-8">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">The Experience</span>
                            <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-4 md:mb-6">A Sanctuary for the Soul</h2>
                            <p className="text-gray-600 leading-relaxed mb-6 font-light whitespace-pre-line">
                                {experienceContent.description}
                            </p>
                            <div className="flex gap-4">
                                <div className="text-center px-4 py-2 border border-brand-brown/30 rounded-lg">
                                    <span className="block text-2xl font-serif text-brand-dark">5</span>
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Mins onto Beach</span>
                                </div>
                                <div className="text-center px-4 py-2 border border-brand-brown/30 rounded-lg">
                                    <span className="block text-2xl font-serif text-brand-dark">100%</span>
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500">Private</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {experienceImages.length > 0 ? (
                                <>
                                    <img src={experienceImages[0]} alt="Detail 1" className="rounded-2xl object-cover h-64 w-full transform translate-y-8" />
                                    {experienceImages[1] && <img src={experienceImages[1]} alt="Detail 2" className="rounded-2xl object-cover h-64 w-full" />}
                                </>
                            ) : (
                                <>
                                    <img src="/room_detail.jpg" alt="Detail" className="rounded-2xl object-cover h-64 w-full transform translate-y-8" />
                                    <img src="/beach.jpg" alt="Beach" className="rounded-2xl object-cover h-64 w-full" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Garden Gallery Section */}
                <GardenGallery images={gardenImages} />

                {/* Room & Booking Section */}
                <div id="book" className="py-20">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="grid lg:grid-cols-2">
                            {/* Room Preview */}
                            <div className="p-8 md:p-12 bg-gray-50">
                                <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">Your Stay</span>
                                <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">{roomType?.title}</h2>

                                <RoomCarousel images={roomImagesForCarousel} />

                                <p className="text-gray-600 leading-relaxed mb-8 font-light max-w-md">
                                    Experience ultimate relaxation in our tastefully designed villas. Surrounded by lush greenery, each room is a haven of peace featuring modern amenities and traditional charm.
                                </p>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                            <Coffee size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Breakfast</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                            <ParkingCircle size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Free Parking</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                            <Plane size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Airport Shuttle</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                            <Wifi size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Free Wifi</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                            <Tv size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">TV</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                            <BedDouble size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">King Bed</span>
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-3xl font-bold text-brand-dark">${roomType?.pricePerNight}</span>
                                    <span className="text-gray-500">/ night</span>
                                </div>
                            </div>

                            {/* Booking Form */}
                            <div className="p-6 md:p-12 flex flex-col justify-center bg-brand-green text-white">
                                <h3 className="text-2xl font-serif mb-6">Book Your Escape</h3>
                                <div className="space-y-6">
                                    {/* Date & Guest Inputs */}
                                    <div>
                                        <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Check In</label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => {
                                                setCheckIn(e.target.value);
                                                setIsAvailable(null); // Reset availability on change
                                            }}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-brown"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Check Out</label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => {
                                                setCheckOut(e.target.value);
                                                setIsAvailable(null);
                                            }}
                                            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-brown"
                                        />
                                    </div>
                                    <div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Adults</label>
                                                <select
                                                    value={adults}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setAdults(val);
                                                        // Adjust children if total exceeds 3
                                                        if (val + children > 3) {
                                                            setChildren(3 - val);
                                                        }
                                                    }}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-brown [&>option]:text-gray-900"
                                                >
                                                    {[1, 2, 3].map(num => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Children</label>
                                                <select
                                                    value={children}
                                                    onChange={(e) => setChildren(parseInt(e.target.value))}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-brown [&>option]:text-gray-900"
                                                >
                                                    {[...Array(3 - adults + 1).keys()].map(num => (
                                                        <option key={num} value={num}>{num}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/70 text-center mt-2 mb-2">
                                            (Max: 3 total guests)
                                        </div>
                                    </div>

                                    {/* Availability Logic */}
                                    {isAvailable === null ? (
                                        <button
                                            onClick={handleCheckAvailability}
                                            disabled={checking}
                                            className="w-full bg-white text-brand-green font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-brand-brown hover:text-white transition shadow-lg mt-4 disabled:opacity-50"
                                        >
                                            {checking ? 'Checking...' : 'Check Availability'}
                                        </button>
                                    ) : !isAvailable ? (
                                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-center font-medium">
                                            ✕ Dates Not Available
                                        </div>
                                    ) : (
                                        /* Available - Show Booking/Auth Flow */
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-4 py-3 rounded-lg text-center font-medium mb-4">
                                                ✓ Dates Available
                                            </div>

                                            {/* Price Breakdown */}
                                            <div className="bg-white/10 rounded-lg p-4 mb-4 border border-white/20 backdrop-blur-sm">
                                                <div className="flex justify-between text-sm mb-2 text-white/90">
                                                    <span>{roomType?.title} x {nights} nights</span>
                                                    <span>${roomType?.pricePerNight * nights}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold border-t border-white/20 pt-2 mt-2 text-white">
                                                    <span>Total</span>
                                                    <span>${totalPrice}</span>
                                                </div>
                                            </div>

                                            {/* Auth Section if not verified */}
                                            {!isVerified && (
                                                <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                                                    <p className="text-sm mb-3">Please verify your email to continue:</p>
                                                    {!showOtpInput ? (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="email"
                                                                placeholder="Enter your email"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-brown"
                                                            />
                                                            <button
                                                                onClick={handleSendOtp}
                                                                disabled={authLoading}
                                                                className="bg-brand-brown px-4 py-2 rounded-lg text-sm font-bold hover:bg-white hover:text-brand-green transition"
                                                            >
                                                                {authLoading ? 'Sending...' : 'Verify'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Enter code"
                                                                value={otp}
                                                                onChange={(e) => setOtp(e.target.value)}
                                                                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-brown"
                                                            />
                                                            <button
                                                                onClick={handleVerifyOtp}
                                                                disabled={authLoading}
                                                                className="bg-brand-brown px-4 py-2 rounded-lg text-sm font-bold hover:bg-white hover:text-brand-green transition"
                                                            >
                                                                {authLoading ? 'Verifying...' : 'Confirm'}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Final Booking Button */}
                                            {isVerified && (
                                                <button
                                                    onClick={handleBooking}
                                                    className="w-full bg-brand-brown text-white font-bold uppercase tracking-widest py-4 rounded-lg hover:bg-white hover:text-brand-green transition shadow-lg animate-pulse"
                                                >
                                                    Confirm Booking Request
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-center text-xs opacity-60 mt-4">
                                        No payment required now. We will confirm your stay within 24 hours.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
