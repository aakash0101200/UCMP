import React from "react";

import i1 from "../assets/Scroll/i1.webp";
import i2 from "../assets/Scroll/i2.webp";
import i3 from "../assets/Scroll/i3.webp";
import i4 from "../assets/Scroll/i4.webp";
import i5 from "../assets/Scroll/i5.webp";
import i6 from "../assets/Scroll/i6.webp";
import i7 from "../assets/Scroll/i7.webp";
import i8 from "../assets/Scroll/i8.webp";
import i9 from "../assets/Scroll/i9.webp";
import i10 from "../assets/Scroll/i10.webp";
import i11 from "../assets/Scroll/i11.webp";
import i12 from "../assets/Scroll/i12.webp";
import i13 from "../assets/Scroll/i13.webp";
import i14 from "../assets/Scroll/i14.webp";

const images = [i1, i2, i3, i4, i5, i6, i7, i8, i9, i10, i11, i12, i13, i14];

const Line = () => {
  return (
    <div className="w-full overflow-x-auto px-4 py-4 lg:py-5">
      <div className="flex gap-3 lg:gap-4 items-center">
        {images.map((img, index) => (
          <div
            key={index}
            className="
          flex-shrink-0
          transition-all
          duration-300
          hover:scale-105
          "
          >
            <img
              src={img}
              alt={`img-${index + 1}`}
              className="
            w-[120px]
            h-[75px]
            sm:w-[140px]
            sm:h-[85px]
            lg:w-[150px]
            lg:h-[95px]
            object-cover
            rounded-2xl
            shadow-md
            hover:shadow-lg
            "
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Line;
