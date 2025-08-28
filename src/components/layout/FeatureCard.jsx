import { Icon } from "lucide-react";
import { features } from "../../utils/features";
import Flip from "./Flip"
import { useRef } from "react";
import { useState } from "react";


const FeatureCard = ({ icon, title, description }) => {
const divRef = useRef(null);
const [isFocused, setIsFocused] = useState(false);
const [position, setPosition] = useState({ x: 0, y: 0 });
const [opacity, setOpacity] = useState(0);
  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  }
  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  }
  const handleMouseEnter = () => {
    setOpacity(0.6);
  };
  const handleMouseLeave = () => {
    setOpacity(0);
  }
  // FeatureCard component displays a list of features in a card format
  // It uses the Flip component to create a flip animation for each feature card  
  // The features are imported from a utility file
  // The component is styled with Tailwind CSS classes for a modern look
  // The component is responsive and adjusts the layout based on screen size
  return (
  <div ref={divRef}
    onMouseMove={handleMouseMove}
    onFocus={handleFocus}
    onBlur={handleBlur}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    className="relative w-full sm:w-1/2 lg:w-1/4 p-4 transition-transform duration-700 perspective"
  >
   
  
    <div className="relative mt-20 border-b border-neutral-800 min-h-[800px] hover:shadow-xl transition-shadow duration-300">

      {/* Translucent wrapper */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg pointer-events-none"></div>

      <div className="relative z-10 border-b border-neutral-800">

        <div className="text-center p-8">
          <span className="bg-neutral-900/50 text-white rounded-lg
            text-sm font-medium mt-8 p-2  uppercase">
            Feature
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking wide">
            Transforming {" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Academic Management
            </span>
            {" "}
          </h2>
        </div>

        <div className="flex flex-wrap justify-around items-center mt-10 lg:mt-20">
            {features.map((feature) => <Flip key={feature.id} {...feature}/>)}
        </div>
      </div>

    </div>
</div>

  );
};

export default FeatureCard;