import React, { useEffect, useState } from 'react';
import BookingForm from '../components/BookingForm';
import GardenGallery from '../components/GardenGallery';
import RoomCarousel from '../components/RoomCarousel';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays, differenceInCalendarDays, isWithinInterval } from 'date-fns';
import {
    Wifi, Wind, Monitor, Coffee, Car, Waves, Utensils, Info,
    MapPin, Palmtree, BedDouble, Tv, ParkingCircle, Plane, ShieldCheck, Dumbbell, Sparkles
} from 'lucide-react';

const iconMap = {
    Wifi, Wind, Monitor, Coffee, Car, Waves, Utensils, Info,
    MapPin, Palmtree, BedDouble, Tv, ParkingCircle, Plane, ShieldCheck, Dumbbell, Sparkles,
    'AC': Wind, 'TV': Monitor, 'Parking': Car, 'Dining': Utensils, 'Pool': Waves, 'Internet': Wifi
};
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
    const navigate = useNavigate();
    const [experienceContent, setExperienceContent] = useState({
        description: "Nestled in a quiet coconut grove, simply a short stroll from the pristine Unawatuna beach, Coco Villa offers a private escape. Our eco-friendly design harmonizes with nature, providing a serene backdrop for your tropical getaway."
    });
    const [experienceImages, setExperienceImages] = useState([
        "/room_detail.jpg",
        "/beach.jpg"
    ]);
    const [user, setUser] = useState(null);

    // Booking State
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [unavailableDates, setUnavailableDates] = useState([]);

    // Derived Booking State
    const [totalPrice, setTotalPrice] = useState(0);
    const [nights, setNights] = useState(0);
    const [isAvailable, setIsAvailable] = useState(null);

    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [roomType, setRoomType] = useState(null);

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    const [authLoading, setAuthLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [gardenImages, setGardenImages] = useState([]);
    const [roomImages, setRoomImages] = useState([]);

    const [mapQuery, setMapQuery] = useState("6.022760,80.246185"); // Default: Marker (Villa)
    const [displayedAmenities, setDisplayedAmenities] = useState([]);

    // Long Stay Feature State
    const [stayType, setStayType] = useState('short'); // 'short' or 'long'
    const [mealPlans, setMealPlans] = useState([]);
    const [selectedMealPlanId, setSelectedMealPlanId] = useState(null);
    const [stayDuration, setStayDuration] = useState('1 Month');

    const durationOptions = [
        "1 Week", "2 Weeks", "3 Weeks", "1 Month", "2 Months", "3 Months",
        "4 Months", "5 Months", "6 Months", "1 Year"
    ];

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setIsVerified(true);
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

                // Fetch Important Facilities
                const facRes = await api.get('/facilities');
                const important = facRes.data.filter(f => f.isImportant).slice(0, 6);
                if (important.length > 0) {
                    setDisplayedAmenities(important);
                }

                // Fetch Unavailable Dates
                const unavailRes = await api.get('/bookings/unavailable-dates');
                const dates = unavailRes.data.map(d => ({
                    start: new Date(d.start),
                    end: new Date(d.end)
                }));
                const disabled = [];
                dates.forEach(range => {
                    let curr = new Date(range.start);
                    const end = new Date(range.end);
                    while (curr <= end) {
                        disabled.push(new Date(curr));
                        curr.setDate(curr.getDate() + 1);
                    }
                });
                setUnavailableDates(disabled);

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

        // Fetch Meal Plans
        const fetchMealPlans = async () => {
            try {
                const res = await api.get('/meal-plans');
                const activePlans = res.data.filter(p => p.isActive);
                const roomOnlyPlan = {
                    _id: 'room_only',
                    name: 'Room Only',
                    price: 0,
                    description: 'Accommodation only, no meals included'
                };

                // Determine default plan
                // Priority: Admin "Default" > "Room Only" (fallback)
                const adminDefault = activePlans.find(p => p.isDefault);
                const defaultPlanId = adminDefault ? adminDefault._id : 'room_only';

                setMealPlans([roomOnlyPlan, ...activePlans]);
                setSelectedMealPlanId(defaultPlanId);
            } catch (err) {
                console.error("Failed to fetch meal plans", err);
                // Fallback
                const roomOnlyPlan = {
                    _id: 'room_only',
                    name: 'Room Only',
                    price: 0,
                    description: 'Accommodation only, no meals included'
                };
                setMealPlans([roomOnlyPlan]);
                setSelectedMealPlanId('room_only');
            }
        };
        fetchMealPlans();
    }, []);

    // Price Calculation & Availability Logic
    useEffect(() => {
        if (stayType === 'short' && startDate && endDate && roomType) {
            const nightsCount = differenceInCalendarDays(endDate, startDate);
            if (nightsCount > 0) {
                setNights(nightsCount);
                const selectedPlan = mealPlans.find(p => p._id === selectedMealPlanId);
                const mealPrice = selectedPlan ? selectedPlan.price : 0;
                setTotalPrice(nightsCount * (roomType.pricePerNight + mealPrice));
                setIsAvailable(true);
            } else {
                setTotalPrice(0);
                setIsAvailable(false);
            }
        }
    }, [startDate, endDate, roomType, stayType, selectedMealPlanId, mealPlans]);

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

            if (res.data.user.profileIncomplete) {
                toast.success("Email verified! Please complete your profile.");
                navigate('/profile-setup');
            } else {
                toast.success("Email verified! You can now complete your booking.");
            }
        } catch (err) {
            console.error("Verify OTP failed", err);
            toast.error("Invalid code. Please try again.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogleLoginSuccess = async (response) => {
        setAuthLoading(true);
        try {
            const res = await api.post('/auth/google', { token: response.credential });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            setIsVerified(true);

            if (res.data.user.profileIncomplete) {
                toast.success("Signed in! Please complete your profile.");
                navigate('/profile-setup');
            } else {
                toast.success("Signed in successfully!");
            }
        } catch (err) {
            console.error("Google Login Failed", err);
            toast.error("Google sign-in failed.");
        } finally {
            setAuthLoading(false);
        }
    };

    // Google Auth Initialization
    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

        /* global google */
        if (typeof google !== 'undefined' && !isVerified) {
            try {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleLoginSuccess
                });

                const btnDiv = document.getElementById("googleSigninBtn");
                if (btnDiv) {
                    google.accounts.id.renderButton(
                        btnDiv,
                        { theme: "outline", size: "large", width: "100%" }
                    );
                }
            } catch (error) {
                console.error("Google Auth Error:", error);
            }
        }
    }, [isVerified, stayType, isAvailable, showOtpInput]);

    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleBooking = async () => {
        if (!isVerified) {
            toast.error("Please verify your email first.");
            return;
        }

        // Validation for Long Stay
        if (stayType === 'long') {
            if (!email) {
                toast.error("Please enter your email for the quotation.");
                return;
            }
        }
        // Validation for Short Stay
        else {
            if (!startDate || !endDate) {
                toast.error("Please select a date range.");
                return;
            }
        }

        setShowConfirmation(true);
    };

    const confirmBooking = async () => {
        setBookingLoading(true);
        try {
            if (stayType === 'long') {
                await api.post('/bookings', {
                    roomTypeId: roomType._id,
                    guests: adults + children,
                    type: 'long_stay_inquiry',
                    email: email,
                    duration: stayDuration,
                    message: `Long Stay Inquiry for ${stayDuration}`
                });
                toast.success('Quotation request sent! Redirecting...');
            } else {
                const selectedPlan = mealPlans.find(p => p._id === selectedMealPlanId);
                await api.post('/bookings', {
                    roomTypeId: roomType._id,
                    checkIn: startDate,
                    checkOut: endDate,
                    guests: adults + children,
                    mealPlan: selectedPlan ? selectedPlan.name : 'Standard',
                    mealPlanPrice: selectedPlan ? selectedPlan.price : 0,
                    totalPrice,
                    message: "Booking request from website"
                });
                toast.success('Booking request sent! Redirecting...');
            }

            // Reset State
            setDateRange([null, null]);
            setTotalPrice(0);
            setIsAvailable(null);
            setAdults(2);
            setChildren(0);
            setShowConfirmation(false);

            // Redirect to My Bookings
            setTimeout(() => navigate('/my-bookings'), 1500);

        } catch (err) {
            console.error("Booking failed", err);
            toast.error(err.response?.data?.message || 'Request failed');
        } finally {
            setBookingLoading(false);
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
                                    {displayedAmenities.length > 0 ? (
                                        displayedAmenities.map((amenity, index) => {
                                            const Icon = iconMap[amenity.icon] || Wifi;
                                            return (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                                        <Icon size={20} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{amenity.title}</span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        // Fallback if no important amenities
                                        <>
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
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                                                    <Waves size={20} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">Pool Access</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-3xl font-bold text-brand-dark">${roomType?.pricePerNight}</span>
                                    <span className="text-gray-500">/ night</span>
                                </div>

                                <Link
                                    to="/facilities"
                                    className="inline-block relative z-10 text-brand-brown font-bold uppercase tracking-widest text-sm hover:text-brand-green transition-colors border-b-2 border-brand-brown/20 pb-1 hover:border-brand-green cursor-pointer"
                                >
                                    View All Facilities & Services
                                </Link>
                            </div>

                            {/* Booking Form */}
                            <div className="p-6 md:p-12 flex flex-col justify-center bg-brand-green text-white">
                                <h3 className="text-2xl font-serif mb-6">Book Your Escape</h3>
                                <div className="space-y-6">
                                    {/* Stay Type Toggle */}
                                    <div className="flex bg-white/10 rounded-lg p-1 mb-6 relative">
                                        <div
                                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-brown rounded-md transition-all duration-300 ${stayType === 'short' ? 'left-1' : 'left-[calc(50%)]'}`}
                                        ></div>
                                        <button
                                            onClick={() => setStayType('short')}
                                            className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest relative z-10 transition-colors ${stayType === 'short' ? 'opacity-100' : 'opacity-70'}`}
                                        >
                                            Short Stay
                                        </button>
                                        <button
                                            onClick={() => setStayType('long')}
                                            className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest relative z-10 transition-colors ${stayType === 'long' ? 'opacity-100' : 'opacity-70'}`}
                                        >
                                            Long Stay
                                        </button>
                                    </div>

                                    {/* Date Inputs (Short Stay Only) */}
                                    {stayType === 'short' && (
                                        <div className="mb-6">
                                            <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Select Dates</label>
                                            <DatePicker
                                                selectsRange={true}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={(update) => {
                                                    setDateRange(update);
                                                }}
                                                excludeDates={unavailableDates}
                                                minDate={new Date()}
                                                placeholderText="Check-in - Check-out"
                                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-brown"
                                                dateFormat="MMM d, yyyy"
                                            />
                                            {startDate && endDate && isAvailable && (
                                                <p className="text-white/80 text-sm mt-2 flex items-center font-medium">
                                                    <span className="mr-1">✓</span> Dates are available!
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {stayType === 'short' && mealPlans.length > 0 && (
                                        <div className="mb-6">
                                            <div className="space-y-3">
                                                <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Meal Plan</label>
                                                {mealPlans.map(plan => (
                                                    <div
                                                        key={plan._id}
                                                        onClick={() => setSelectedMealPlanId(plan._id)}
                                                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedMealPlanId === plan._id
                                                            ? 'bg-white/20 border-white ring-1 ring-white'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div>
                                                            <span className="font-bold text-sm block text-white">{plan.name}</span>
                                                            <span className="text-xs text-white/60">{plan.description}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            {plan.price > 0 ? (
                                                                <span className="text-sm font-bold text-white">+${plan.price} <span className="text-[10px] font-normal opacity-70">/night</span></span>
                                                            ) : (
                                                                <span className="text-sm font-bold text-white">Included</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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

                                    {/* Availability Logic (Short Stay Only) */}
                                    {stayType === 'short' && startDate && endDate && (
                                        <>
                                            {!isAvailable ? (
                                                <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-center font-medium">
                                                    ✕ Dates Not Available
                                                </div>
                                            ) : (
                                                /* Available - Show Booking/Auth Flow */
                                                <div className="space-y-4 animate-fadeIn">

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
                                                            <p className="text-sm mb-3">Sign in to continue:</p>

                                                            {/* Google Sign In */}
                                                            <div className="mb-4">
                                                                <div id="googleSigninBtn" className="w-full flex justify-center"></div>
                                                            </div>

                                                            <div className="relative flex py-2 items-center">
                                                                <div className="flex-grow border-t border-white/20"></div>
                                                                <span className="flex-shrink-0 mx-4 text-white/50 text-xs uppercase">Or</span>
                                                                <div className="flex-grow border-t border-white/20"></div>
                                                            </div>

                                                            {!showOtpInput ? (
                                                                <div className="flex gap-2 mt-2">
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
                                                                <div className="flex gap-2 mt-2">
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
                                                            disabled={bookingLoading}
                                                            className={`w-full bg-brand-brown text-white font-bold uppercase tracking-widest py-4 rounded-lg transition shadow-lg ${bookingLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-white hover:text-brand-green animate-pulse'}`}
                                                        >
                                                            {bookingLoading ? 'Processing Request...' : 'Confirm Booking Request'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Long Stay Logic */}
                                    {stayType === 'long' && (
                                        <div className="space-y-4 animate-fadeIn">
                                            {/* Helper Text */}
                                            <div className="bg-brand-brown/20 rounded-lg p-4 mb-4 border border-brand-brown/40">
                                                <p className="text-sm font-medium text-center text-white/90">
                                                    Valid for extended stays of 1 week to 1 year.
                                                </p>
                                            </div>

                                            {/* Duration Selection */}
                                            <div className="mb-4">
                                                <label className="block text-sm uppercase tracking-wider mb-2 opacity-80">Duration</label>
                                                <select
                                                    value={stayDuration}
                                                    onChange={(e) => setStayDuration(e.target.value)}
                                                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-brown [&>option]:text-gray-900"
                                                >
                                                    {durationOptions.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Auth Section if not verified */}
                                            {!isVerified && (
                                                <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                                                    <p className="text-sm mb-3">Sign in to continue:</p>

                                                    {/* Google Sign In */}
                                                    <div className="mb-4">
                                                        <div id="googleSigninBtn" className="w-full flex justify-center"></div>
                                                    </div>

                                                    <div className="relative flex py-2 items-center">
                                                        <div className="flex-grow border-t border-white/20"></div>
                                                        <span className="flex-shrink-0 mx-4 text-white/50 text-xs uppercase">Or</span>
                                                        <div className="flex-grow border-t border-white/20"></div>
                                                    </div>

                                                    {/* Manual Email */}
                                                    {!showOtpInput ? (
                                                        <div className="flex gap-2 mt-2">
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
                                                        <div className="flex gap-2 mt-2">
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

                                            {/* Verified User Section */}
                                            {isVerified && (
                                                <div className="space-y-4">
                                                    <button
                                                        onClick={handleBooking}
                                                        disabled={bookingLoading}
                                                        className={`w-full bg-brand-brown text-white font-bold uppercase tracking-widest py-4 rounded-lg transition shadow-lg ${bookingLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-white hover:text-brand-green animate-pulse'}`}
                                                    >
                                                        {bookingLoading ? 'Sending Request...' : 'Request Price Quotation'}
                                                    </button>
                                                    <p className="text-center text-xs opacity-70 text-white">
                                                        Response will be sent to <strong>{email}</strong>
                                                    </p>
                                                </div>
                                            )}

                                            <p className="text-center text-xs opacity-60 mt-4">
                                                No payment required now. We will confirm your stay within 24 hours.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="py-20 border-t border-gray-100">
                    <div className="text-center mb-12">
                        <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">Explore Unawatuna</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-dark">The Perfect Location</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Map */}
                        <div className="h-[500px] w-full relative">
                            <iframe
                                title="Coco Villa Location"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                style={{ border: 0 }}
                                src={`https://maps.google.com/maps?q=${mapQuery}${mapQuery === "6.022760,80.246185" ? "&ll=6.028397,80.237084" : ""}&z=14&output=embed`}
                                allowFullScreen
                                className="transition-all duration-500"
                            ></iframe>
                        </div>

                        {/* Details */}
                        <div className="p-8 md:p-12">
                            <div className="flex items-start gap-4 mb-8">
                                <div className="p-3 bg-brand-green/10 rounded-full text-brand-green shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-dark mb-2">Unawatuna, Sri Lanka</h3>
                                    <p className="text-gray-600 font-light mb-4">
                                        Located in a peaceful coconut grove, nicely tucked away from the busy roads but just minutes from the action.
                                    </p>
                                    <button
                                        onClick={() => setMapQuery("Tourist attractions in Unawatuna")}
                                        className="text-sm text-brand-brown font-bold hover:text-brand-green underline decoration-dotted underline-offset-4 transition-colors"
                                    >
                                        Show All Attractions on Map
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Key Beaches */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className="p-3 border border-brand-brown/20 rounded-xl flex flex-col items-center text-center hover:bg-brand-bg hover:scale-105 transition duration-300 cursor-pointer group"
                                        onMouseEnter={() => setMapQuery("Unawatuna Beach")}
                                        onMouseLeave={() => setMapQuery("6.022760,80.246185")}
                                    >
                                        <div className="text-brand-brown mb-2 group-hover:text-brand-green transition-colors">
                                            <Waves size={24} />
                                        </div>
                                        <span className="block text-lg font-serif text-brand-dark">1 KM</span>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">Unawatuna Beach</span>
                                    </div>

                                    <div
                                        className="p-3 border border-brand-brown/20 rounded-xl flex flex-col items-center text-center hover:bg-brand-bg hover:scale-105 transition duration-300 cursor-pointer group"
                                        onMouseEnter={() => setMapQuery("Jungle Beach, Unawatuna")}
                                        onMouseLeave={() => setMapQuery("6.022760,80.246185")}
                                    >
                                        <div className="text-brand-brown mb-2 group-hover:text-brand-green transition-colors">
                                            <Palmtree size={24} />
                                        </div>
                                        <span className="block text-lg font-serif text-brand-dark">1.5 KM</span>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">Jungle Beach</span>
                                    </div>
                                </div>

                                {/* Other Attractions */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Nearby Highlights</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: "Galle Fort", query: "Galle Dutch Fort" },
                                            { name: "Peace Pagoda", query: "Japanese Peace Pagoda Unawatuna" },
                                            { name: "Turtle Hatchery", query: "Sea Turtle Hatchery Habaraduwa" },
                                            { name: "Dalawella Beach (Swing)", query: "Dalawella Beach Swing" },
                                            { name: "Yatagala Temple", query: "Yatagala Raja Maha Viharaya" }
                                        ].map((spot, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 hover:bg-brand-green hover:text-white rounded-full text-xs font-medium text-gray-600 transition-colors cursor-pointer"
                                                onMouseEnter={() => setMapQuery(spot.query)}
                                                onMouseLeave={() => setMapQuery("6.022760,80.246185")}
                                            >
                                                {spot.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="p-6">
                            <h3 className="text-2xl font-serif text-brand-dark mb-2">
                                {stayType === 'short' ? 'Confirm Booking Request' : 'Confirm Quotation Request'}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm">
                                {stayType === 'short'
                                    ? "Please review your booking details before submitting. We will review your request and confirm availability shortly."
                                    : "Please review your inquiry details. We will send a customized price quotation to your email."
                                }
                            </p>

                            <div className="bg-brand-bg/50 rounded-xl p-4 mb-6 space-y-3 border border-brand-brown/10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Type</span>
                                    <span className="font-bold text-brand-dark uppercase tracking-wider">{stayType === 'short' ? 'Short Stay' : 'Long Stay'}</span>
                                </div>

                                {stayType === 'short' ? (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Dates</span>
                                            <span className="font-medium text-brand-dark">
                                                {startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Meal Plan</span>
                                            <span className="font-medium text-brand-dark capitalize">
                                                {mealPlans.find(p => p._id === selectedMealPlanId)?.name || 'Standard'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Guests</span>
                                            <span className="font-medium text-brand-dark">{adults} Adults, {children} Children</span>
                                        </div>
                                        <div className="flex justify-between text-base pt-2 border-t border-brand-brown/10">
                                            <span className="font-bold text-brand-dark">Total</span>
                                            <span className="font-bold text-brand-green">${totalPrice}</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Duration</span>
                                            <span className="font-medium text-brand-dark">{stayDuration}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-medium text-brand-dark truncate max-w-[200px]">{email}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={bookingLoading}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBooking}
                                    disabled={bookingLoading}
                                    className="flex-1 px-4 py-3 bg-brand-brown text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-brand-dark transition-colors shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {bookingLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Confirm & Submit</span>
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

export default Home;
