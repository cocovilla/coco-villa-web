import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-brand-green text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                    {/* Brand */}
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <img src="/logo.png" alt="Coco Villa Logo" className="h-32 mx-auto md:mx-0 object-contain mb-4" />
                    </div>

                    <div className="flex justify-center space-x-6">
                        <a href="#" className="text-brand-brown/70 hover:text-white transition">Instagram</a>
                        <a href="#" className="text-brand-brown/70 hover:text-white transition">Facebook</a>
                        <a href="#" className="text-brand-brown/70 hover:text-white transition">WhatsApp</a>
                    </div>
                </div>
                <div className="text-center mt-12 pt-8 border-t border-brand-brown/20">
                    <p className="text-sm text-brand-brown/60">&copy; {new Date().getFullYear()} CocoVilla. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
