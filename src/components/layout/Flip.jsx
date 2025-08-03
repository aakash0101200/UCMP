import { Icon } from "lucide-react"
import { useState } from "react"
import "../../index.css"
export default function Flip(feature) {

    const [flipped, setFlipped] = useState(false);
    return (

        <div className="w-full sm:w-1/2 lg:w-1/4 p-4">
            <div
                className="perspective"
                onClick={() => setFlipped(!flipped)}
            >
                <div
                    className={`relative w-full h-100 transition-transform duration-700 preserve-3d ${flipped ? '-rotate-y-180' : ''
                        }`}
                >
                    {/* Front Side */}
                    <div className="absolute w-full h-full backface-hidden 
                         text-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center
                         bg-gradient-to-bl from-[#e2dcdc] via-[#adacaa] to-[#4b4945] 
                         dark:from-blue-950/80 dark:via-indigo-950/80 dark:to-purple-950/80">
                        <div className="text-5xl mb-4">{feature.icon}</div>
                        <h5 className="text-xl font-semibold text-center">{feature.title}</h5>
                    </div>

                    {/* Back Side */}
                    <div className="absolute w-full h-full backface-hidden -rotate-y-180 bg-neutral-800 text-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center
                        bg-gradient-to-bl from-[#e2dcdc] via-[#adacaa] to-[#4b4945] 
                        dark:from-blue-600/80 dark:via-indigo-500/80 dark:to-purple-500/80">
                    
                        <h5 className="text-xl font-semibold mb-2">{feature.title}</h5>
                        <p className="text-sm text-neutral-100">{feature.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
