import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "../../assets/hero-campuss.png";
import { DotPattern } from "../../components/magicui/dot-pattern";
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
    <div className="relative w-full min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <DotPattern className={cn("opacity-30")} glow />
      </div>

      {/* Main Hero Card Container */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-7xl bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] rounded-[48px] lg:rounded-[56px] overflow-hidden"
      >
        <div className="grid lg:grid-cols-2 items-center min-h-[70vh] lg:min-h-[80vh] px-8 py-12 lg:px-20 lg:py-0 gap-12">

          {/* Left Content Section */}
          <div className="flex flex-col items-start z-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-600 text-xs font-bold tracking-wide mb-8 border border-indigo-600/5"
            >
              <span className="text-sm">✦</span> CAMPUS OS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold text-[#1A1A1A] leading-[1.05] tracking-[-0.04em]"
            >
              Academic <br />
              Management <br />
              <span className="text-[#5B4CFF]">Simplified</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg text-slate-500 max-w-[440px] leading-relaxed font-medium"
            >
              Attendance, academics, assignments and campus life — unified into one intelligent workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-[#5B4CFF] hover:bg-[#4A3DDB] text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Begin Journey
              </button>
              <button className="px-8 py-4 bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-semibold transition-all duration-300 active:scale-95">
                Explore
              </button>
            </motion.div>
          </div>

          {/* Right Visual Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative flex items-center justify-center w-full lg:h-full group"
          >
            {/* Soft inner glow behind image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-3xl scale-75 group-hover:scale-90 transition-transform duration-1000" />

            <motion.img
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              src={heroImg}
              alt="Campus OS Ecosystem"
              className="relative z-10 w-full max-w-[500px] lg:max-w-none lg:scale-125 object-contain transition-transform duration-700 group-hover:rotate-1"
            />

            {/* Decorative Floating Card Elements (Optional Visual Polish) */}
            <div className="absolute -bottom-4 right-10 w-24 h-24 bg-white/40 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl z-20 hidden lg:block animate-pulse" />
          </motion.div>
        </div>
      </motion.main>

      {/* Footer / Scroll Indicator (Optional) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <div className="w-[1px] h-12 bg-gradient-to-b from-indigo-600 to-transparent" />
      </div>
    </div>
  );
};

export default Home;