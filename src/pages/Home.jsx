import React from "react";

import HeroSection from "../components/layout/HeroSection";
import FeatureCard from "../components/layout/FeatureCard";
import Footer from "../components/layout/Footer";
import ImageCarousel from '../components/layout/ImageCarousel';
import { DotPattern } from "./../components/magicui/dot-pattern"
import { cn } from "@/lib/utils";

import LightRays from "./LightRays";




const Home = () => {


  // Home component serves as the main page of the application
  // It includes the HeroSection, FeatureCard, and Footer components

  return (
    <div className="bg-white dark:bg-black">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={80}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays z-0 not-dark:hidden not-sm:hidden"
      />


      <DotPattern
        className={cn(
          " absolute z-0 inset-0 [mask-image:radial-gradient(50vw_circle_at_center,white,transparent)] dark:[mask-image:radial-gradient(50vw_circle_at_center,black,transparent)]"
        )}
        glow={true}
      />
      <div className="px-10 pt-10 mx-auto max-w-7xl">

        <HeroSection />
      </div>

      <div className=" my-8">
        <ImageCarousel/>
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