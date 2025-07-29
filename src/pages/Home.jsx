import React from "react";

import HeroSection from "../components/layout/HeroSection";
import FeatureCard from "../components/layout/FeatureCard";
import Footer from "../components/layout/Footer";
import ImageShowcase from '../components/layout/ImageShowcase';

const Home = () => {

    
    // Home component serves as the main page of the application
    // It includes the HeroSection, FeatureCard, and Footer components

    return (
        <div className="bg-gradient-to-b 
        from-[#fefefe] via-[#fdfbf2] to-[#faf7f3] 
         dark:from-[#0d1117] dark:via-[#3c3c98a2] dark:to-[#1f0644]">
          <div className="px-10 pt-10 mx-auto max-w-7xl">
            <HeroSection/>
          </div>
          
         <div className="mt-2 border  border-orange-500 shadow-[0_0_40px_5px_rgba(255,115,0,0.4)]"> 
          <ImageShowcase/>
          </div> 

          {/* Feature Card below*/}
            <div className="px-10 pt-10 mx-auto max-w-7xl">
               <FeatureCard />
            </div>
          
         <Footer/>
        </div>
    );
};



export default Home;