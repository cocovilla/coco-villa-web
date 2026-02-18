import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GardenGallery = ({ images = [] }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            // distinct scroll amount based on card width
            const scrollAmount = current.firstElementChild ? current.firstElementChild.clientWidth + 24 : 320;

            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const displayImages = images;

    return (
        <section id="gallery" className="py-20 bg-brand-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-8 px-2">
                    <div>
                        <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">Immersed in Nature</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-dark">Garden Layouts</h2>
                    </div>

                </div>

                {/* Carousel Container Wrapper */}
                <div className="relative group">
                    {/* Left Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 lg:-ml-6 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl text-brand-brown hover:bg-brand-brown hover:text-white transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-green hidden md:block border border-brand-brown/10"
                        aria-label="Scroll Left"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    {/* Right Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 lg:-mr-6 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl text-brand-brown hover:bg-brand-brown hover:text-white transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-green hidden md:block border border-brand-brown/10"
                        aria-label="Scroll Right"
                    >
                        <ChevronRight size={32} />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {displayImages.map((img, index) => (
                            <div key={index} className="flex-none w-80 md:w-96 aspect-[3/4] snap-start">
                                <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg group relative">
                                    <img
                                        src={typeof img === 'string' ? img : `http://localhost:5000${img.imageUrl}`}
                                        alt={`Gallery Image ${index + 1}`}
                                        className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition duration-500"></div>
                                </div>
                            </div>
                        ))}
                        {displayImages.length === 0 && (
                            <div className="w-full text-center py-10 text-gray-400">No images available</div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GardenGallery;
