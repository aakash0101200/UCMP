import { Icon } from "lucide-react";
import { features } from "../../utils/features";
import Flip from "./Flip"

const FeatureCard = ({ icon, title, description }) => {
  return (
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


  );
};

export default FeatureCard;