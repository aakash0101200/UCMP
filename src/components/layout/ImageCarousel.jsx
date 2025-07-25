import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react'; // Icon buttons

// ✅ Your 3 chosen images
const images = [
  'https://picsum.photos/id/1050/400/200', // Cityscape
  'https://picsum.photos/id/1025/400/200', // Dog portrait
  'https://picsum.photos/id/1018/400/200', // Scenic landscape
];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Previous image (circular)
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Next image (circular)
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      {/* ◀️ Previous Button */}
      <button
        onClick={handlePrev}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        <ArrowLeft className="h-5 w-5 text-black dark:text-white" />
      </button>

      {/* 🖼️ Image Display */}
      <div className="w-[400px] h-[200px] border rounded overflow-hidden shadow">
        <img
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ▶️ Next Button */}
      <button
        onClick={handleNext}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        <ArrowRight className="h-5 w-5 text-black dark:text-white" />
      </button>
    </div>
  );
};

export default ImageCarousel;
