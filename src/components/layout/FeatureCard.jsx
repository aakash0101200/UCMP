import { Icon } from "lucide-react";
import { features } from "../../utils/features";
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="relative mt-20 border-b border-neutral-800 min-h-[800px] hover:shadow-xl transition-shadow duration-300">
      <div className="text-center">
        <span className="bg-neutral-900 text-white rounded-full h-6
          text-sm font-medium px-2 py-1 uppercase">
            feature
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl mt-10 lg:mt-20 tracking wide">
           Transforming 
           <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
             {" "}
             
             Academic Management
           </span>
        </h2>
      </div>
      <div className="flex flex-wrap items-center mt-10 lg:mt-20">
        {features.map((feature) => (
          <div key={feature.id} className="w-full sm:w-1/2 lg:w-1/3 p-4">
            <div className="flex">
              <div className="flex mx-6 h-10 w-10 p-2 bg-neutral-900
               text-white justify-center items-center rounded-full ">
                {feature.icon}
              </div>
              <div>
                <h5 className="mt-1 mb-6 text-xl">{feature.title}</h5>
                <p className="text-md p-2 mb-20 text-neutral-400">
                  {feature.description}
                </p>
              </div>
              
        
            </div>
          </div>
        ))}

      </div>

        
      
    </div>
  );
};

// Essential export
export default FeatureCard;