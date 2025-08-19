// import React from "react";

// // Import images manually
// import i1 from "../../assets/Scroll/i1.webp";
// import i2 from "../../assets/Scroll/i2.webp";
// import i3 from "../../assets/Scroll/i3.webp";
// import i4 from "../../assets/Scroll/i4.webp";
// import i5 from "../../assets/Scroll/i5.webp";
// import i6 from "../../assets/Scroll/i6.webp";
// import i7 from "../../assets/Scroll/i7.webp";
// import i8 from "../../assets/Scroll/i8.webp";
// import i9 from "../../assets/Scroll/i9.webp";
// import i10 from "../../assets/Scroll/i10.webp";
// import i11 from "../../assets/Scroll/i11.webp";
// import i12 from "../../assets/Scroll/i12.webp";
// import i13 from "../../assets/Scroll/i13.webp";
// import i14 from "../../assets/Scroll/i14.webp";

// const images = [
//   { src: i1, alt: "Image 1" },
//   { src: i2, alt: "Image 2" },
//   { src: i3, alt: "Image 3" },
//   { src: i4, alt: "Image 4" },
//   { src: i5, alt: "Image 5" },
//   { src: i6, alt: "Image 6" },
//   { src: i7, alt: "Image 7" },
//   { src: i8, alt: "Image 8" },
//   { src: i9, alt: "Image 9" },
//   { src: i10, alt: "Image 10" },
//   { src: i11, alt: "Image 11" },
//   { src: i12, alt: "Image 12" },
//   { src: i13, alt: "Image 13" },
//   { src: i14, alt: "Image 14" },
// ];

// const ImageShowcase = () => {
//   return (
//     <section className="px-4 py-12 md:px-12 bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-900 dark:to-black">
//       <h2 className="mb-10 text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 dark:from-yellow-400 dark:via-fuchsia-500 dark:to-sky-400">
//         ✨ Innovative Image Showcase
//       </h2>

//       <div className="flex gap-6 px-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
//         {images.map((image, idx) => (
//           <div
//             key={idx}
//             className="relative flex-shrink-0 w-64 h-44 md:w-80 md:h-52 group snap-center"
//           >
//             <div className="w-full h-full rounded-2xl overflow-hidden transition-transform duration-500 transform group-hover:scale-105 group-hover:rotate-1 bg-black p-[2px] shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-transparent hover:border-2 hover:border-amber-400">
//               <div className="w-full h-full overflow-hidden rounded-xl">
//                 <img
//                   src={image.src}
//                   alt={image.alt}
//                   className="object-cover w-full h-full"
//                   loading="lazy"
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ImageShowcase;



import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import images
import i1 from "../../assets/Scroll/i1.webp";
import i2 from "../../assets/Scroll/i2.webp";
import i3 from "../../assets/Scroll/i3.webp";
import i4 from "../../assets/Scroll/i4.webp";
import i5 from "../../assets/Scroll/i5.webp";
import i6 from "../../assets/Scroll/i6.webp";
import i7 from "../../assets/Scroll/i7.webp";
import i8 from "../../assets/Scroll/i8.webp";
import i9 from "../../assets/Scroll/i9.webp";
import i10 from "../../assets/Scroll/i10.webp";
import i11 from "../../assets/Scroll/i11.webp";
import i12 from "../../assets/Scroll/i12.webp";
import i13 from "../../assets/Scroll/i13.webp";
import i14 from "../../assets/Scroll/i14.webp";

const images = [
  i1, i2, i3, i4, i5, i6, i7,
  i8, i9, i10, i11, i12, i13, i14
];

export default function ImageCarousel() {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsRef = useRef([]);
  const [validImages, setValidImages] = useState([]);

  // Filter valid images only (skip broken)
  useEffect(() => {
    const preloadImages = async () => {
      const checks = await Promise.all(
        images.map((src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(src);
            img.onerror = () => resolve(null);
          });
        })
      );
      const filtered = checks.filter((src) => src !== null);
      setValidImages([...filtered, ...filtered, ...filtered]); // Tripled for infinite illusion
    };

    preloadImages();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const center = containerRect.left + containerRect.width / 2;
      let closestIndex = 0;
      let closestDistance = Infinity;

      itemsRef.current.forEach((item, index) => {
        if (!item) return;

        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(center - itemCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }

        const maxDist = containerRect.width / 2;
        const normalized = Math.min(distance / maxDist, 1);
        const scale = 1 - normalized * 0.3;
        const opacity = 1 - normalized * 0.5;

        item.style.transform = `scale(${Math.max(scale, 0.7)})`;
        item.style.opacity = Math.max(opacity, 0.5).toString();
      });

      setActiveIndex(closestIndex);

      // Infinite scroll logic
      const scrollWidth = container.scrollWidth;
      const scrollLeft = container.scrollLeft;
      const clientWidth = container.clientWidth;

      if (scrollLeft < clientWidth) {
        container.scrollLeft += scrollWidth / 3;
      } else if (scrollLeft > scrollWidth - clientWidth * 2) {
        container.scrollLeft -= scrollWidth / 3;
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [validImages]);

  const scrollToItem = (index) => {
    const item = itemsRef.current[index];
    const container = containerRef.current;
    if (!item || !container) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const scrollLeft =
      container.scrollLeft +
      itemRect.left -
      containerRect.left -
      containerRect.width / 2 +
      itemRect.width / 2;

    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  };

  const scrollPrevious = () => scrollToItem(activeIndex - 1);
  const scrollNext = () => scrollToItem(activeIndex + 1);

  if (validImages.length === 0) {
    return <div className="text-center py-10 text-gray-500">Loading images...</div>;
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-indigo-500 mb-2">Gallery</h2>
        {/* <p className="text-gray-600">Smooth infinite scrolling with scaling effect</p> */}
      </div>

      {/* Left Button */}
      <button
        onClick={scrollPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 
                   bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg
                   hover:bg-white hover:scale-110 transition-all duration-200"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>

      {/* Right Button */}
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 
                   bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg
                   hover:bg-white hover:scale-110 transition-all duration-200"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide py-8 px-4 
                   scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {validImages.map((src, index) => (
          <div
            key={index}
            ref={(el) => (itemsRef.current[index] = el)}
            className="flex-shrink-0 w-72 h-56 snap-center transition-all duration-300 ease-out cursor-pointer"
            onClick={() => scrollToItem(index)}
          >
            <div className="w-full h-full overflow-hidden rounded-xl shadow-lg">
              <img
                src={src}
                alt={`Slide ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
























