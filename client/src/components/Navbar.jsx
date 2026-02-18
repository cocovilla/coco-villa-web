import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import { User } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const location = useLocation();

    // Check if we are on the home page
    const isHome = location.pathname === '/';

    // Navbar style state: 
    // If not home page, always show "scrolled" style (white background)
    // If home page, show scrolled style only when scrolled
    const navScrolled = !isHome || isScrolled;

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

        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
                setIsProfileOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.reload();
    };

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${navScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md border-gray-100 py-0' : 'bg-transparent border-b border-white/20 py-2'}`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/">
                            <img src="/logo.png" alt="Coco Villa Logo" className="h-20 w-auto object-contain" />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center justify-end flex-1 ml-10">
                        {/* Navigation Links */}
                        <div className="flex space-x-8 items-center text-xs font-bold tracking-widest uppercase mr-8">
                            <Link to="/" className={`transition-colors ${navScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Home</Link>
                            <a href="/#gallery" className={`transition-colors ${navScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Experience</a>
                            <a href="/#book" className={`transition-colors ${navScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>Stay</a>

                            {user && (
                                <>
                                    <Link to="/my-bookings" className={`transition-colors ${navScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}>My Bookings</Link>
                                    {user.role === 'admin' && (
                                        <Link to="/admin" className={`font-bold transition-colors ${navScrolled ? 'text-brand-green' : 'text-white'}`}>Admin</Link>
                                    )}
                                </>
                            )}
                        </div>

                        {/* CTA & Profile Group */}
                        <div className="flex items-center gap-6">
                            <Link to="/#book" className={`${navScrolled ? 'bg-brand-btn text-white' : 'bg-white text-brand-text'} px-6 py-3 rounded-full hover:bg-opacity-90 transition font-bold text-xs uppercase tracking-widest`}>
                                Book Now
                            </Link>

                            {user ? (
                                <div className="relative profile-dropdown">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className={`flex items-center gap-2 focus:outline-none transition-opacity hover:opacity-80 pl-6 border-l ${navScrolled ? 'border-gray-200' : 'border-white/20'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {user.avatar && !imageError ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-brand-green/50"
                                                    onError={() => setImageError(true)}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green border-2 border-brand-green/20">
                                                    <User size={16} />
                                                </div>
                                            )}
                                            <span className={`text-xs font-bold uppercase tracking-widest hidden lg:block ${navScrolled ? 'text-brand-text' : 'text-white'}`}>
                                                {user.name.split(' ')[0]}
                                            </span>
                                            <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''} ${navScrolled ? 'text-gray-600' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 border border-gray-100 transform origin-top-right animate-fadeIn z-50">
                                            <Link
                                                to="/profile-setup"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-green transition-colors font-bold uppercase tracking-wider"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors border-t border-gray-100 font-bold uppercase tracking-wider"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowLogin(true)}
                                    className={`text-xs font-bold uppercase tracking-widest transition-colors ${navScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'}`}
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className={`${navScrolled ? 'text-gray-500 hover:text-brand-green' : 'text-white hover:text-white/80'} focus:outline-none`}>
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
                            <>
                                <Link to="/my-bookings" className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>My Bookings</Link>
                                <Link to="/profile-setup" className="block text-sm font-bold tracking-widest uppercase hover:text-brand-green transition-colors" onClick={() => setIsOpen(false)}>Profile</Link>
                            </>
                        )}
                        {user ? (
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 mb-3">
                                    {user.avatar && !imageError ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full"
                                            onError={() => setImageError(true)}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                                            <User size={16} />
                                        </div>
                                    )}
                                    <span className="text-sm font-bold">{user.name}</span>
                                </div>
                                <button onClick={handleLogout} className="block text-sm font-bold tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors w-full text-left">Logout</button>
                            </div>
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
