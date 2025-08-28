import { Icon } from "lucide-react";
import { features } from "../../utils/features";
<<<<<<< HEAD
import Flip from "./Flip"
import { useRef } from "react";
import { useState } from "react";

=======
import { BrainCircuit } from "lucide-react";
>>>>>>> 10ff22f718084ca727c40d5a1fd9e6078e15b14d

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
<<<<<<< HEAD
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
=======
    <div className="relative z-10  min-h-[800px] ">
      
>>>>>>> 10ff22f718084ca727c40d5a1fd9e6078e15b14d

        <div className="text-center p-8">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking wide">
            Transforming {" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
              Academic Management
            </span>
            {" "}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 rounded-2xl p-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="bg-white/5 border-2 p-4 shadow-2xl rounded-3xl ">
                <div className="flex justify-center mt-4 mb-2">
                  <div className="flex justify-center items-center w-15 h-15 mb-2 mx-auto bg-black/10 dark:bg-white/10 rounded-full ">
                    <Icon className="w-8 h-8" />
                  </div>


                </div>
                <h5 className="text-xl text-black dark:text-white font-semibold text-center">{feature.title}</h5>
                <p className="text-center text-neutral-800 dark:text-neutral-200 p-1 mx-5 mb-2">{feature.description}</p>

              </div>
            )
          }

          )}
        </div>
      </div>

<<<<<<< HEAD
    </div>
</div>
=======
    

>>>>>>> 10ff22f718084ca727c40d5a1fd9e6078e15b14d

  );
};

export default FeatureCard;