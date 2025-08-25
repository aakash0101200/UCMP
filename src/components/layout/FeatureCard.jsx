import { Icon } from "lucide-react";
import { features } from "../../utils/features";
import { BrainCircuit } from "lucide-react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="relative z-10  min-h-[800px] ">
      

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

    


  );
};

export default FeatureCard;