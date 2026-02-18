import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
    const location = useLocation();

    // Pages that have a hero section or handle their own top spacing/transparency
    const isHeroPage = location.pathname === '/' || location.pathname === '/facilities';

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className={`flex-grow ${!isHeroPage ? 'pt-24' : ''}`}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
