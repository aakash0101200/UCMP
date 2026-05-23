import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, BarChart3 } from "lucide-react";

import heroImg from "../../assets/hero-campuss.png";

import { DotPattern } from "../../components/magicui/dot-pattern";
import { cn } from "../../lib/utils";

const Hotspot = ({ left, top, title, description, icon: Icon, color, popupClass }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const active = isHovered || isClicked;

  return (
    <div
      style={{
        position: "absolute",
        left: left,
        top: top,
      }}
      className="z-30 pointer-events-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setIsClicked(!isClicked);
      }}
    >
      <button
        type="button"
        className="relative flex h-6 w-6 items-center justify-center focus:outline-none cursor-pointer group"
      >
        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-40 animate-ping`}></span>
        <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${color} border-2 border-white shadow-lg transition-transform duration-200 group-hover:scale-125`}></span>
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`
              absolute
              ${popupClass}
              w-60
              p-4
              rounded-2xl
              bg-background/95
              dark:bg-card/95
              backdrop-blur-xl
              border border-border/80
              shadow-xl
              pointer-events-none
              flex flex-col gap-2
              z-50
            `}
          >
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg text-white ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const hotspotsData = [
  {
    id: 1,
    left: "22%",
    top: "42%",
    title: "Dynamic Timetable",
    description: "Real-time class schedules, cancellations, and substitutions mapped instantly.",
    icon: Calendar,
    color: "bg-indigo-500",
    popupClass: "bottom-8 -left-12",
  },
  {
    id: 2,
    left: "68%",
    top: "25%",
    title: "Smart Attendance",
    description: "Session-based attendance check-ins, warning systems, and real-time reports.",
    icon: Clock,
    color: "bg-emerald-500",
    popupClass: "bottom-8 -left-44",
  },
  {
    id: 3,
    left: "66%",
    top: "54%",
    title: "Academic Analytics",
    description: "Personalized dashboard tracks GPA progression, core course statuses, and tasks.",
    icon: BarChart3,
    color: "bg-amber-500",
    popupClass: "bottom-8 -left-36",
  },
];

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const activeRole =
      localStorage.getItem("activeRole") ||
      localStorage.getItem("role");

    if (token && activeRole) {
      navigate(`/${activeRole.toLowerCase()}`, {
        replace: true,
      });
    }
  }, [navigate]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerHeight >= 720) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="
    bg-background
    text-foreground
    relative
    overflow-x-hidden
    w-full
    min-h-[calc(100vh-64px)]
    lg:h-[calc(100vh-64px)]
    lg:overflow-hidden
  ">

      {/* ambient */}
      <div className="
      absolute
      top-[-5%]
      right-0
      w-[500px]
      h-[500px]
      bg-indigo-500/10
      blur-[140px]
      rounded-full
      pointer-events-none
    "/>

      <DotPattern
        className={cn(
          "absolute inset-0 opacity-40"
        )}
        glow
      />

      {/* HERO */}
      <section
        className="
      w-full
      min-h-[calc(100vh-64px)]
      lg:h-[calc(100vh-64px)]
      flex
      items-center
      justify-center
      px-4
      py-4
      lg:py-0
      lg:px-8
      relative
      z-10
      "
      >

        <div
          className="
    grid
    lg:grid-cols-[0.95fr_1.05fr]
    items-center

    gap-10
    lg:gap-2

    min-h-[78vh]

    px-8
    lg:px-16

    py-12
    lg:py-0
  "
        >

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-[520px] z-10"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="
                inline-flex
                px-5
                py-2
                rounded-full
                bg-neutral-100
                dark:bg-neutral-800
                border
                mb-8
                cursor-pointer
                text-sm
                font-medium
                shadow-sm
                transition-all
                hover:shadow-md
              "
            >
              ✦ Campus OS
            </motion.div>

            <h1
              className="
                text-5xl
                lg:text-7xl
                font-bold
                leading-[0.92]
                tracking-[-0.04em]
              "
            >
              Academic
              <br />
              Management
              <span className="block text-indigo-600 dark:text-indigo-400 mt-2">
                Simplified
              </span>
            </h1>

            <p
              className="
                mt-8
                text-lg
                text-muted-foreground
                max-w-[460px]
                leading-relaxed
              "
            >
              Attendance, academics, assignments
              and campus life — unified into one
              intelligent workspace. A Unified College Management Platform.
            </p>

            <div
              className="
                flex
                flex-wrap
                gap-3
                sm:gap-4
                mt-8
                sm:mt-10
              "
            >
              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="
                  px-5
                  py-3
                  sm:px-8
                  sm:py-4
                  rounded-xl
                  sm:rounded-2xl
                  bg-indigo-600
                  hover:bg-indigo-500
                  text-white
                  text-sm
                  sm:text-base
                  font-semibold
                  min-w-[150px]
                  sm:min-w-fit
                  shadow-lg shadow-indigo-600/20
                  cursor-pointer
                  transition-colors
                "
              >
                Begin Journey
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="
                  px-5
                  py-3
                  sm:px-8
                  sm:py-4
                  rounded-xl
                  sm:rounded-2xl
                  border
                  text-sm
                  sm:text-base
                  font-medium
                  min-w-[120px]
                  sm:min-w-fit
                  hover:bg-neutral-100
                  dark:hover:bg-neutral-800/50
                  cursor-pointer
                  transition-colors
                "
              >
                Explore
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="
              relative
              h-auto
              flex
              items-center
              justify-center
              w-full
            "
          >
            {/* floating bg */}
            <div
              className="
                absolute
                right-0
                w-[95%]
                h-[82%]
                rounded-[52px] overflow-hidden
                bg-neutral-100/30 backdrop-blur-sm
                dark:bg-neutral-900/30 backdrop-blur-sm
                shadow-2xl shadow-indigo-500/5
              "
            />

            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [0, 0.5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }}
              className="
                relative
                z-10
                w-[100%]
                lg:w-[120%]
                max-w-[450px]
                lg:max-w-none
                -translate-x-2
                -translate-y-4
                lg:-translate-x-4
                lg:-translate-y-8
                group
              "
            >
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-sm whitespace-nowrap">
                ✦ Interactive and Realtime Features
              </span>

              <img
                src={heroImg}
                alt="Workspace Illustration"
                className="w-full h-auto object-contain"
              />

              {hotspotsData.map((hotspot) => (
                <Hotspot key={hotspot.id} {...hotspot} />
              ))}
            </motion.div>
          </motion.div>

        </div>

      </section>

    </div>
  );
};

export default Home;