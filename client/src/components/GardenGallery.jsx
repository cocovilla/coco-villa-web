import React, { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cloudinaryUrl } from '../utils/cloudinaryUrl';

const GardenGallery = ({ images = [] }) => {
    const scrollContainerRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);
    const [dragging, setDragging] = useState(false);

    const scroll = (direction) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const cardWidth = el.firstElementChild ? el.firstElementChild.clientWidth + 24 : 320;
        el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
    };

    const onMouseDown = useCallback((e) => {
        const el = scrollContainerRef.current;
        if (!el) return;
        isDragging.current = true;
        startX.current = e.pageX - el.offsetLeft;
        scrollLeftStart.current = el.scrollLeft;
        setDragging(true);
    }, []);

    const onMouseMove = useCallback((e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const el = scrollContainerRef.current;
        if (!el) return;
        const x = e.pageX - el.offsetLeft;
        el.scrollLeft = scrollLeftStart.current - (x - startX.current) * 1.2;
    }, []);

    const stopDrag = useCallback(() => {
        isDragging.current = false;
        setDragging(false);
    }, []);

    return (
        <section id="gallery" className="py-20 bg-brand-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="mb-8 px-2">
                    <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">Immersed in Nature</span>
                    <h2 className="text-3xl md:text-4xl font-serif text-brand-dark">Garden Layouts</h2>
                </div>

                {/* Scroll area with floating arrow buttons */}
                <div className="relative">

                    {/* Left arrow — visible on all screens, floats on left edge */}
                    <button
                        onClick={() => scroll('left')}
                        aria-label="Scroll Left"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
                                   w-10 h-10 flex items-center justify-center
                                   bg-white rounded-full shadow-lg border border-brand-brown/10
                                   text-brand-brown hover:bg-brand-brown hover:text-white
                                   transition-all transform hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {/* Right arrow — visible on all screens, floats on right edge */}
                    <button
                        onClick={() => scroll('right')}
                        aria-label="Scroll Right"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
                                   w-10 h-10 flex items-center justify-center
                                   bg-white rounded-full shadow-lg border border-brand-brown/10
                                   text-brand-brown hover:bg-brand-brown hover:text-white
                                   transition-all transform hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Scrollable track */}
                    <div
                        ref={scrollContainerRef}
                        className={`flex gap-6 overflow-x-auto pb-6 px-6 select-none
                                    ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch',
                        }}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={stopDrag}
                        onMouseLeave={stopDrag}
                    >
                        {images.map((img, index) => (
                            <div
                                key={index}
                                className="flex-none w-64 sm:w-80 lg:w-96 aspect-[3/4]"
                                style={{ pointerEvents: dragging ? 'none' : 'auto' }}
                            >
                                <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg group relative">
                                    <img
                                        src={cloudinaryUrl(typeof img === 'string' ? img : img.imageUrl, { width: 480 })}
                                        alt={`Garden ${index + 1}`}
                                        className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-110"
                                        draggable={false}
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-500" />
                                </div>
                            </div>
                        ))}

                        {images.length === 0 && (
                            <div className="w-full text-center py-10 text-gray-400">No images available</div>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default GardenGallery;
