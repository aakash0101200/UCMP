import { Icon } from "lucide-react"
import { useState } from "react"
import "../../index.css"
export default function Flip(feature) {

    
    return (

        <div className="w-full sm:w-1/2 lg:w-1/4 p-4">
            <div
                className="perspective"
                
            >
                <div
                    className={`relative w-full h-100 transition-transform duration-700 preserve-3d 
                        }`}
                >
                    {/* Front Side */}
                    <div className="absolute w-full h-full 
                         text-neutral-600 rounded-xl shadow-md p-6 flex flex-col items-center justify-center
                           bg-white/10 "
                    
                         >
                            
                        <div className="text-5xl mb-4">
                            {typeof feature.icon === "string" && feature.icon.endsWith(".png") ? (
                                <img src={feature.icon} alt={feature.title}  className=" rounded-xl shadow-md" />
                            ) : (
                                feature.icon
                            )}

                        </div>
                        <h5 className="text-xl text-black font-semibold text-center">{feature.title}</h5>
                        <p className="text-center">{feature.description}</p>
                        
                    </div>

                    
                    
                </div>
            </div>
        </div>
    )
}