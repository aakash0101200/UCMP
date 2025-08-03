import React from "react";

import HeroSection from "../components/layout/HeroSection";
import FeatureCard from "../components/layout/FeatureCard";
import Footer from "../components/layout/Footer";
import ImageShowcase from '../components/layout/ImageShowcase';
import { DotPattern } from "./../components/magicui/dot-pattern"
import { cn } from "@/lib/utils";



const Home = () => {


  // Home component serves as the main page of the application
  // It includes the HeroSection, FeatureCard, and Footer components

  return (
    <div className="bg-white dark:bg-black">

      <DotPattern
        className={cn(
          "absolute inset-0 z-0 [mask-image:radial-gradient(50vw_circle_at_center,white,transparent)] dark:[mask-image:radial-gradient(50vw_circle_at_center,black,transparent)]"
        )}
      />
      <div className="px-10 pt-10 mx-auto max-w-7xl">
        <HeroSection />
      </div>

      <div className="my-8"> 
          <ImageShowcase/>
          </div> 

      {/* Feature Card below*/}
      <div className="px-10 pt-10 mx-auto max-w-7xl">
        <FeatureCard />
      </div>

      <Footer />
    </div>
  );
};



export default Home;