import React, { useState } from 'react';

const RoomCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    if (!images || images.length === 0) {
        return <div className="w-full h-[400px] md:h-[500px] mb-8 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">No images available</div>;
    }

    return (
        <div className="relative group w-full h-[400px] md:h-[500px] mb-8">
            {/* Image Container */}
            <div
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
                className="w-full h-full rounded-2xl bg-center bg-cover duration-500 shadow-xl transition-all"
            ></div>

            {/* Left Arrow */}
            <div
                className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition z-10"
                onClick={prevSlide}
            >
                <span className="focus:outline-none select-none">
                    ❮
                </span>
            </div>

            {/* Right Arrow */}
            <div
                className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition z-10"
                onClick={nextSlide}
            >
                <span className="focus:outline-none select-none">
                    ❯
                </span>
            </div>

            {/* Dots */}
            <div className="flex top-4 justify-center py-2 absolute w-full bottom-4">
                {images.map((slide, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`text-2xl cursor-pointer mx-1 ${currentIndex === slideIndex ? 'text-white' : 'text-white/50'}`}
                    >
                        •
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomCarousel;
