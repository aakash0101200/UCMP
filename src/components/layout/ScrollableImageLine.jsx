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
    <div className="w-full overflow-x-auto px-4 py-6">
      <div className="flex gap-4 items-center">
        {images.map((img, index) => (
          <div
            key={index}
            className="transition-transform duration-300 ease-in-out hover:scale-110 flex-shrink-0"
            style={{ width: "160px", height: "100px" }}
          >
            <img
              src={img}
              alt={`img-${index + 1}`}
              className="w-full h-full object-cover rounded-xl shadow-md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Line;
