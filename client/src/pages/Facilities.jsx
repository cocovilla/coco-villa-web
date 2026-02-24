import React, { useState, useEffect } from 'react';
import { Wifi, Tv, BedDouble, ParkingCircle, Plane, Coffee, MapPin, Waves, Palmtree, Utensils, Car, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { cloudinaryUrl } from '../utils/cloudinaryUrl';

// Icon mapping for dynamic rendering
const iconMap = {
    Wifi, Tv, BedDouble, ParkingCircle, Plane, Coffee, MapPin, Waves, Palmtree, Utensils, Car, ShieldCheck, Dumbbell, Sparkles
};

// Skeleton loader for featured sections
const SectionSkeleton = () => (
    <div className="flex flex-col md:flex-row items-center gap-12 animate-pulse">
        <div className="w-full md:w-1/2 h-[400px] bg-gray-200 rounded-3xl" />
        <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-1 bg-gray-200 rounded w-16" />
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
        </div>
    </div>
);

const Facilities = () => {
    const navigate = useNavigate();
    const [standardFacilities, setStandardFacilities] = useState([]);
    const [featuredSections, setFeaturedSections] = useState([]);
    const [loadingSections, setLoadingSections] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await api.get('/facilities');
                setStandardFacilities(res.data);
            } catch (err) {
                console.error("Failed to fetch facilities", err);
            }
        };

        const fetchFeaturedSections = async () => {
            try {
                const res = await api.get('/facility-sections');
                setFeaturedSections(res.data);
            } catch (err) {
                console.error("Failed to fetch facility sections", err);
            } finally {
                setLoadingSections(false);
            }
        };

        fetchFacilities();
        fetchFeaturedSections();
    }, []);

    const IconComponent = ({ name }) => {
        const Icon = iconMap[name] || Wifi;
        return <Icon size={24} />;
    };

    return (
        <div className="bg-brand-bg min-h-screen font-sans text-brand-text">
            {/* Hero Section */}
            <div className="relative h-[60vh]">
                <div className="absolute inset-0">
                    <img
                        src="/hero.png"
                        alt="Facilities Hero"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 animate-fadeIn">
                    <span className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 opacity-90">Experience Luxury</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-wide">
                        Facilities &amp; Services
                    </h1>
                    <p className="text-base md:text-xl font-light max-w-2xl opacity-90">
                        Everything you need for a perfect tropical getaway.
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                {/* Intro */}
                <div className="text-center mb-20 animate-fadeIn delay-100">
                    <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">Our Amenities</span>
                    <h2 className="text-3xl md:text-4xl font-serif text-brand-dark mb-6">Designed for Your Comfort</h2>
                    <p className="text-gray-600 font-light max-w-2xl mx-auto leading-relaxed text-lg">
                        At Coco Villa, we believe in providing a seamless experience. From modern conveniences to personalized services, every detail is curated to ensure your stay is relaxing and memorable.
                    </p>
                </div>

                {/* Featured Sections (Zigzag) — dynamic from admin */}
                <div className="space-y-20 mb-20 animate-fadeIn delay-200">
                    {loadingSections ? (
                        <>
                            <SectionSkeleton />
                            <SectionSkeleton />
                        </>
                    ) : featuredSections.length > 0 ? (
                        featuredSections.map((section, index) => (
                            <div
                                key={section._id}
                                className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                <div className="w-full md:w-1/2 overflow-hidden rounded-3xl shadow-2xl group">
                                    {section.imageUrl ? (
                                        <img
                                            src={cloudinaryUrl(section.imageUrl, { width: 900 })}
                                            alt={section.title}
                                            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-[400px] bg-gray-100 flex items-center justify-center text-gray-300">
                                            <span className="text-sm">No image added yet</span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-1/2 text-center md:text-left">
                                    <h3 className="text-3xl font-serif font-bold text-brand-dark mb-4">{section.title}</h3>
                                    <div className="w-16 h-1 bg-brand-green mb-6 mx-auto md:mx-0"></div>
                                    <p className="text-gray-600 leading-relaxed text-lg font-light whitespace-pre-line">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-400 italic">
                            Facility sections will appear here once added by the admin.
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-brand-brown/20 my-20"></div>

                {/* Standard Amenities (Grid) */}
                <div className="text-center mb-12 animate-fadeIn delay-300">
                    <h3 className="text-2xl font-serif text-brand-dark mb-8">More Amenities</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fadeIn delay-300">
                    {standardFacilities.map((facility, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group bg-opacity-80 backdrop-blur-sm">
                            <div className="text-brand-brown mb-3 group-hover:text-brand-green transition-colors">
                                <IconComponent name={facility.icon} />
                            </div>
                            <h4 className="text-lg font-bold text-brand-dark mb-1">{facility.title}</h4>
                            <p className="text-gray-500 text-xs font-light">
                                {facility.description}
                            </p>
                        </div>
                    ))}
                    {standardFacilities.length === 0 && (
                        <div className="col-span-full text-center text-gray-500 italic pb-8">
                            Admin can add amenities from the dashboard.
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <div className="mt-20 text-center bg-brand-brown/5 rounded-3xl p-12 border border-brand-brown/10 animate-fadeIn delay-300">
                    <h2 className="text-3xl font-serif text-brand-dark mb-4">Ready to Experience It?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Book your stay today and enjoy all these premium amenities in the heart of Unawatuna.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-brand-brown text-white font-bold uppercase tracking-widest px-10 py-4 rounded-full hover:bg-brand-green transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Book Your Stay Now
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Facilities;
