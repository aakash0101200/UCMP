import React from "react";

// Import images manually
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
  { src: i1, alt: "Image 1" },
  { src: i2, alt: "Image 2" },
  { src: i3, alt: "Image 3" },
  { src: i4, alt: "Image 4" },
  { src: i5, alt: "Image 5" },
  { src: i6, alt: "Image 6" },
  { src: i7, alt: "Image 7" },
  { src: i8, alt: "Image 8" },
  { src: i9, alt: "Image 9" },
  { src: i10, alt: "Image 10" },
  { src: i11, alt: "Image 11" },
  { src: i12, alt: "Image 12" },
  { src: i13, alt: "Image 13" },
  { src: i14, alt: "Image 14" },
];

const ImageShowcase = () => {
  return (
    <section className="px-4 py-12 md:px-12 bg-gradient-to-b from-neutral-100 to-white dark:from-neutral-900 dark:to-black">
      <h2 className="mb-10 text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 dark:from-yellow-400 dark:via-fuchsia-500 dark:to-sky-400">
        ✨ Innovative Image Showcase
      </h2>

      <div className="flex gap-6 px-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {images.map((image, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 w-64 h-44 md:w-80 md:h-52 group snap-center"
          >
            <div className="w-full h-full rounded-2xl overflow-hidden transition-transform duration-500 transform group-hover:scale-105 group-hover:rotate-1 bg-black p-[2px] shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-transparent hover:border-2 hover:border-amber-400">
              <div className="w-full h-full overflow-hidden rounded-xl">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ImageShowcase;