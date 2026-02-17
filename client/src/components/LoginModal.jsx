import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const LoginModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        // In a real app, this would trigger the Google OAuth flow.
        // For this demo/mock, we will simulate a successful Google Login 
        // by reusing the dev-login endpoint with a "Google-verified" user.
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/dev-login', {
                email: 'teambitcode@gmail.com',
                name: 'Google User',
                role: 'user'
            });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            window.location.reload();
        } catch (err) {
            console.error('Google Login Error', err);
            toast.error('Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDevLogin = async (role) => {
        setLoading(true);
        setError('');
        try {
            const email = role === 'admin' ? 'madsampath94@gmail.com' : 'user@example.com';
            const name = role === 'admin' ? 'Admin User' : 'John Doe';

            const res = await api.post('/auth/dev-login', { email, role, name });

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            window.location.reload();
        } catch (err) {
            console.error(err);
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition">✕</button>

                <h3 className="text-2xl font-bold text-center mb-6 text-brand-dark">Welcome Back</h3>

                <div className="space-y-4">
                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-3 shadow-sm"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or Dev Login</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <button
                        onClick={() => handleDevLogin('user')}
                        disabled={loading}
                        className="w-full bg-brand-green/10 text-brand-green py-3 rounded-lg font-bold hover:bg-brand-green/20 transition"
                    >
                        Guest Login
                    </button>

                    <button
                        onClick={() => handleDevLogin('admin')}
                        disabled={loading}
                        className="w-full text-brand-brown text-sm font-medium hover:underline mt-2"
                    >
                        Login as Admin
                    </button>
                </div>
            </div>
        </div>
        , document.body);
};

export default LoginModal;
