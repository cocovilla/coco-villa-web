import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);

        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.reload();
    };

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md border-gray-100 py-0' : 'bg-transparent border-b border-white/20 py-2'}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/">
                            <img src="/logo.png" alt="Coco Villa Logo" className="h-20 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-10 items-center text-xs font-bold tracking-widest uppercase">
                        <Link to="/" className={`transition-colors ${isScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Home</Link>
                        <a href="/#gallery" className={`transition-colors ${isScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Experience</a>
                        <a href="/#book" className={`transition-colors ${isScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Stay</a>

                        {user ? (
                            <>
                                <Link to="/my-bookings" className={`transition-colors ${isScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>My Bookings</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className={`font-bold transition-colors ${isScrolled ? 'text-brand-green' : 'text-white'}`}>Admin</Link>
                                )}
                                <button onClick={handleLogout} className={`transition-colors ${isScrolled ? 'text-gray-400 hover:text-brand-text' : 'text-white/70 hover:text-white'}`}>Logout</button>
                            </>
                        ) : (
                            <button onClick={() => setShowLogin(true)} className={`transition-colors ${isScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Login</button>
                        )}

                        <Link to="/#book" className={`${isScrolled ? 'bg-brand-btn text-white' : 'bg-white text-brand-text'} px-6 py-3 rounded-full hover:bg-opacity-90 transition font-bold`}>Book Now</Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className={`${isScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'} focus:outline-none`}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg absolute w-full left-0 top-20 border-t border-gray-100 animate-fadeIn">
                    <div className="px-6 py-4 space-y-4 text-gray-800">
                        <Link to="/" className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
                        <a href="/#gallery" className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Experience</a>
                        <a href="/#book" className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Stay</a>
                        {user && (
                            <Link to="/my-bookings" className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>My Bookings</Link>
                        )}
                        {user ? (
                            <button onClick={handleLogout} className="block text-sm font-bold tracking-widest uppercase text-gray-400 hover:text-brand-text transition-colors w-full text-left">Logout</button>
                        ) : (
                            <button onClick={() => { setShowLogin(true); setIsOpen(false); }} className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green w-full text-left transition-colors">Login</button>
                        )}
                    </div>
                </div>
            )}

            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </nav>
    );
};

export default Navbar;
