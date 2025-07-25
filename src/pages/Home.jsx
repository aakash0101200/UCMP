import React from "react";

import HeroSection from "../components/layout/HeroSection";
import FeatureCard from "../components/layout/FeatureCard";
import Footer from "../components/layout/Footer";
import ImageCarousel from '../components/layout/ImageCarousel';
import Line from '../components/layout/Line';
const Home = () => {

    
    // Home component serves as the main page of the application
    // It includes the HeroSection, FeatureCard, and Footer components

    return (
        <div className="bg-gradient-to-b 
        from-[#fefefe] via-[#fdfbf2] to-[#faf7f3] 
         dark:from-[#0d1117] dark:via-[#3c3c98a2] dark:to-[#1f0644]">
          <div className="max-w-7xl mx-auto pt-10 px-10">
            <HeroSection/>
          </div>
          
         <div> <Line/></div> 

          {/* Feature Card below*/}
            <div className="max-w-7xl mx-auto pt-10 px-10">
               <FeatureCard />
            </div>
          
         <Footer/>
        </div>
    );
};



export default Home;