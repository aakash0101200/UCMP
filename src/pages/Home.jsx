import React from "react";

import HeroSection from "../components/layout/HeroSection";
import FeatureCard from "../components/layout/FeatureCard";
import Footer from "../components/layout/Footer";
const Home = () => {

    
    // Home component serves as the main page of the application
    // It includes the HeroSection, FeatureCard, and Footer components

    return (
        <div className="home-page">
          <div className="max-w-7xl mx-auto pt-10 px-10">
            <HeroSection/>
          </div>

          {/* Feature Card below*/}
            <div className="max-w-7xl mx-auto pt-10 px-10">
               <FeatureCard />
            </div>

         <Footer/>
        </div>
    );
};



export default Home;