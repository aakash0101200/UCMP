import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import HeroSection from "../../components/layout/HeroSection";
import FeatureCard from "../../components/layout/FeatureCard";
import Footer from "../../components/layout/Footer";
import ImageCarousel from '../../components/layout/ImageCarousel';
import { DotPattern } from "./../../components/magicui/dot-pattern"
import { cn } from "../../lib/utils";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const activeRole = localStorage.getItem("activeRole") || localStorage.getItem("role");
    if (token && activeRole) {
      navigate(`/${activeRole.toLowerCase()}`, { replace: true });
    }
  }, [navigate]);

  return (
    <div className="bg-background text-foreground relative overflow-hidden min-h-screen transition-colors duration-300">
      {/* Elegant Ambient Background Glow instead of disco lights */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <DotPattern
        className={cn(
          " absolute z-0 inset-0 [mask-image:radial-gradient(60vw_circle_at_top,white,transparent)] dark:[mask-image:radial-gradient(60vw_circle_at_top,black,transparent)] opacity-60"
        )}
        glow={true}
      />
      <div className="px-10 pt-10 mx-auto max-w-7xl relative z-10">

        <HeroSection />
      </div>

      <div className=" my-4 lg:my-6 relative z-10">
        <ImageCarousel />
      </div>

      {/* Feature Card below*/}
      <div className="px-10 pt-10 mx-auto max-w-7xl relative z-10">
        <FeatureCard />
      </div>

      <Footer />
    </div>
  );
};

export default Home;