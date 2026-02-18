import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoginModal from './LoginModal';

const BookingForm = () => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        checkIn: '',
        checkOut: '',
        guests: 1,
        mealPlan: 'bed_and_breakfast',
        message: ''
    });

    // Email Verification State
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);

    // General UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setIsVerified(true);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- OTP Logic ---
    const handleSendOTP = async () => {
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setVerificationLoading(true);
        setError('');
        try {
            await api.post('/auth/send-otp', { email });
            setShowOtpInput(true);
            setSuccess('Verification code sent to ' + email);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) {
            setError('Please enter the verification code.');
            return;
        }
        setVerificationLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/verify-otp', { email, code: otp });

            // Set user in local storage so they stay logged in
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            setUser(res.data.user);
            setIsVerified(true);
            setSuccess('Email verified successfully!');
            setShowOtpInput(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Invalid code.');
        } finally {
            setVerificationLoading(false);
        }
    };
    // -----------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isVerified && !user) {
            setError('Please verify your email or sign in to book.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Re-check auth token if needed, or rely on axios interceptor
            const typeRes = await api.get('/rooms/type');
            const roomTypeId = typeRes.data._id;
            const pricePerNight = typeRes.data.pricePerNight;

            const start = new Date(formData.checkIn);
            const end = new Date(formData.checkOut);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const totalPrice = diffDays * pricePerNight;

            if (diffDays <= 0) throw new Error("Invalid dates");

            await api.post('/bookings', {
                roomTypeId,
                ...formData,
                totalPrice
            });

            setSuccess('Booking request sent! We will contact you at ' + (user?.email || email));
            setFormData({ checkIn: '', checkOut: '', guests: 1, message: '' });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-brand-dark mb-6">Request Booking</h3>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-brand-green p-3 rounded-lg mb-4 text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-In</label>
                        <input
                            type="date"
                            name="checkIn"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                            value={formData.checkIn}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-Out</label>
                        <input
                            type="date"
                            name="checkOut"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                            value={formData.checkOut}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                    <select
                        name="guests"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                        value={formData.guests}
                        onChange={handleChange}
                    >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                    </select>
                </div>

                {/* Meal Plan Selection */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Meal Plan</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.mealPlan === 'bed_and_breakfast'
                            ? 'bg-brand-green/10 border-brand-green text-brand-green ring-1 ring-brand-green'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-green/50'
                            }`}>
                            <input
                                type="radio"
                                name="mealPlan"
                                value="bed_and_breakfast"
                                checked={formData.mealPlan === 'bed_and_breakfast'}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="font-bold text-sm">Bed & Breakfast</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.mealPlan === 'room_only'
                            ? 'bg-brand-green/10 border-brand-green text-brand-green ring-1 ring-brand-green'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-brand-green/50'
                            }`}>
                            <input
                                type="radio"
                                name="mealPlan"
                                value="room_only"
                                checked={formData.mealPlan === 'room_only'}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="font-bold text-sm">Room Only</span>
                        </label>
                    </div>
                </div>

                {/* --- Verification Section --- */}
                {!isVerified ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <label className="block text-sm font-bold text-gray-700">Verify Identity to Book</label>

                        {/* Option 1: Google */}
                        <button
                            type="button"
                            onClick={() => setShowLogin(true)}
                            className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-4 h-4" />
                            Sign in with Google
                        </button>

                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or use Email</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {/* Option 2: Email OTP */}
                        {!showOtpInput ? (
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={verificationLoading}
                                    className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 disabled:opacity-50"
                                >
                                    {verificationLoading ? '...' : 'Verify'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-brand-green">Code sent to {email}</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        className="flex-1 px-4 py-2 border border-brand-green rounded-lg focus:ring-2 focus:ring-brand-green outline-none text-sm"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOTP}
                                        disabled={verificationLoading}
                                        className="bg-brand-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-opacity-90 disabled:opacity-50"
                                    >
                                        {verificationLoading ? '...' : 'Confirm'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowOtpInput(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                                >
                                    Change Email
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                disabled
                                value={user?.email || email}
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                            <span className="text-green-500 text-xl">✓</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                    <textarea
                        name="message"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition"
                        placeholder="Any special requests?"
                        value={formData.message}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={!isVerified || loading}
                    className="w-full bg-brand-green text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? 'Processing...' : 'Send Booking Request'}
                </button>
            </form>

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </div>
    );
};

export default BookingForm;
