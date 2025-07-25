import React, { useEffect, useRef } from "react";

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

const images = [i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14];

const Line = () => {
  const scrollRef = useRef(null);

  
  useEffect(() => {
    const container = scrollRef.current;
    let scrollAmount = 0;

    const scroll = () => {
      if (!container) return;

      container.scrollLeft += 1;
      scrollAmount += 1;

     
      if (scrollAmount >= container.scrollWidth / 2) {
        container.scrollLeft = 0;
        scrollAmount = 0;
      }

      requestAnimationFrame(scroll);
    };

    scroll();
  }, []);

  
  const loopedImages = [...images, ...images];

  return (
    <div className="w-full overflow-hidden py-3 bg-white dark:bg-[#0d1117]/10  rounded-xl">
      <div
        ref={scrollRef}
        className="py-3 flex gap-4 items-center scroll-smooth whitespace-nowrap no-scrollbar"
        style={{ overflowX: "auto" }}
      >
        {loopedImages.map((img, index) => (
          <div
            key={index}
            className="transition-transform duration-300 ease-in-out hover:scale-110 flex-shrink-0 h-60 "
            
          >
            <img
              src={img}
              alt={`img-${index + 1}`}
              className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
};




























// // export default Line;

// import React, { useRef, useState, useEffect } from "react";

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

// var number = 14;

// import { ChevronLeft, ChevronRight } from "lucide-react"; // icon package

// const images = [i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14];

// const Line = () => {
//   const scrollRef = useRef(null);
//   const [scrollLeft, setScrollLeft] = useState(0);
//   const [hovering, setHovering] = useState(null); // 'left' or 'right'
//   const loopedImages = [...images, ...images];

//   useEffect(() => {
//     let scrollInterval;

//     if (hovering && scrollRef.current) {
//       scrollInterval = setInterval(() => {
//         scrollRef.current.scrollLeft += hovering === "right" ? 2 : -2;
//         setScrollLeft(scrollRef.current.scrollLeft);
//       }, 10);
//     }

//     return () => clearInterval(scrollInterval);
//   }, [hovering]);

//   const getCenter = () => {
//     const container = scrollRef.current;
//     return container ? container.offsetWidth / 2 : 0;
//   };

//   return (
//     <div className="w-full relative py-6 bg-white dark:bg-[#0d1117]">
//       {/* Left arrow */}
//       <div
//         className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 dark:bg-black/30 p-2 rounded-full cursor-pointer hover:scale-110 transition"
//         onMouseEnter={() => setHovering("left")}
//         onMouseLeave={() => setHovering(null)}
//       >
//         <ChevronLeft size={28} className="text-black dark:text-white" />
//       </div>

//       {/* Right arrow */}
//       <div
//         className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/70 dark:bg-black/30 p-2 rounded-full cursor-pointer hover:scale-110 transition"
//         onMouseEnter={() => setHovering("right")}
//         onMouseLeave={() => setHovering(null)}
//       >
//         <ChevronRight size={28} className="text-black dark:text-white" />
//       </div>

//       {/* Scrollable image line */}
//       <div
//         ref={scrollRef}
//         className="flex gap-4 items-center scroll-smooth whitespace-nowrap no-scrollbar"
//         style={{ overflowX: "auto" }}
//       >
//         {loopedImages.map((img, index) => {
//           const itemWidth = 160;
//           const containerCenter = getCenter();
//           const itemOffset = index * (itemWidth + 16);
//           const distanceFromCenter = Math.abs(itemOffset - scrollLeft - containerCenter);
//           const maxDistance = containerCenter;
//           const scale = 1 + (1 - distanceFromCenter / maxDistance) * 0.5;

//           return (
//             <div
//               key={index}
//               className="transition-transform duration-200 ease-in-out flex-shrink-0"
//               style={{
//                 width: "160px",
//                 height: "140px",
//                 transform: `scale(${Math.max(1, Math.min(scale, 1.5))})`,
//               }}
//             >
//               <img
//                 src={img}
//                 alt={`img-${index + 1}`}
//                 className="w-full h-full object-cover rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
//               />
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Line;




// // ImageGallery.jsx
// import React, { useState, useEffect, useRef } from 'react';
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

// const images = [i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14];

// const ImageCard = ({ image, index }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const cardRef = useRef(null);

//   return (
//     <div 
//       ref={cardRef}
//       className="relative flex-shrink-0 w-64 h-80 md:w-80 md:h-96 overflow-hidden rounded-xl shadow-lg transition-all duration-500 transform hover:scale-105"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//     >
//       <img 
//         src={image} 
//         alt={`Gallery Image ${index + 1}`} 
//         className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
//       />
      
//       <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500 flex flex-col justify-end p-6 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
//         <h3 className="text-white text-xl font-bold mb-2">Image {index + 1}</h3>
//         <p className="text-gray-200 text-sm">Discover the beauty of this moment</p>
//       </div>
//     </div>
//   );
// };

// const  = () => {
//   const [scrollY, setScrollY] = useState(0);
//   const containerRef = useRef(null);

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrollY(window.scrollY);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <div className="relative min-h-screen py-20 bg-gradient-to-b from-indigo-900 to-purple-900 overflow-hidden">
//       <div 
//         ref={containerRef}
//         className="relative flex items-center justify-center min-h-screen"
//         style={{
//           transform: `translateY(${scrollY * 0.3}px)`,
//         }}
//       >
//         <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto px-4">
//           {images.map((image, index) => (
//             <ImageCard key={index} image={image} index={index} />
//           ))}
//         </div>
//       </div>

//       <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
//         <div className="animate-bounce bg-white/20 backdrop-blur-md p-4 rounded-full">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//           </svg>
//         </div>
//         <p className="text-white mt-4 text-lg">Scroll for more magic</p>
//       </div>
//     </div>
//   );
// };

// export default Line;