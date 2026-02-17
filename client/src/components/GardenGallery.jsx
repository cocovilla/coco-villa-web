import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GardenGallery = ({ images = [] }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 320; // Approx width of one card + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    const displayImages = images;

    return (
        <section id="gallery" className="py-20 bg-brand-bg overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex justify-between items-end mb-8 px-2">
                    <div>
                        <span className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-2 block">Immersed in Nature</span>
                        <h2 className="text-3xl md:text-4xl font-serif text-brand-dark">Garden Layouts</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full border border-brand-brown/30 text-brand-brown hover:bg-brand-brown hover:text-white transition active:scale-95"
                            aria-label="Scroll Left"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full border border-brand-brown/30 text-brand-brown hover:bg-brand-brown hover:text-white transition active:scale-95"
                            aria-label="Scroll Right"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Carousel Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0"
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
        </section>
    );
};

export default GardenGallery;
