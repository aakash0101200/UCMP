import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images
import i1 from "../../assets/Scroll/i1.webp";
import i2 from "../../assets/Scroll/i2.webp";
import i3 from "../../assets/Scroll/i3.webp";
import i4 from "../../assets/Scroll/i4.webp";
import i5 from "../../assets/Scroll/i5.webp";
import i6 from "../../assets/Scroll/i6.webp";
import i7 from "../../assets/Scroll/i7.webp";
import i8 from "../../assets/Scroll/i8.webp";
import i9 from "../../assets/Scroll/i9.webp";
import i10 from "../../assets/Scroll/i10.webp";
import i11 from "../../assets/Scroll/i11.webp";
import i12 from "../../assets/Scroll/i12.webp";
import i13 from "../../assets/Scroll/i13.webp";
import i14 from "../../assets/Scroll/i14.webp";

const slides = [
  {
    image: i1,
    tag: "HACKATHON • 2026 • INNOVATION",
    title: "CodeRed National Hackathon",
    description: "Over 500 developers collaborating to build next-generation solutions for real-world civic challenges, shaping the future of digital governance.",
    primaryBtn: "View Project Gallery",
    secondaryBtn: "Hackathon Highlights"
  },
  {
    image: i2,
    tag: "RESEARCH • 2026 • ACADEMICS",
    title: "Advanced Artificial Intelligence Lab",
    description: "Fostering cutting-edge research in deep learning, natural language processing, computer vision, and neural network computing.",
    primaryBtn: "Explore Projects",
    secondaryBtn: "Meet Our Researchers"
  },
  {
    image: i3,
    tag: "CULTURE • 2026 • COMMUNITY",
    title: "Renaissance National Fest",
    description: "A vibrant yearly celebration of artistic expression, musical talent, dramatic theater, and collaborative student heritage.",
    primaryBtn: "Festival Lineup",
    secondaryBtn: "Event Showcase"
  },
  {
    image: i4,
    tag: "PLACEMENTS • 2026 • OPPORTUNITY",
    title: "Global Recruiting Partnership Drive",
    description: "Bridging the gap between tier-one technology enterprises and our top-tier computational minds to launch professional careers.",
    primaryBtn: "Placement Statistics",
    secondaryBtn: "Corporate Partners"
  },
  {
    image: i5,
    tag: "ROBOTICS • 2026 • ENGG",
    title: "Autonomous Systems & Controls",
    description: "Designing, manufacturing, and programming intelligent mechanical agents and automated control nodes for modern industrial automation.",
    primaryBtn: "Watch Demo Videos",
    secondaryBtn: "Research Publications"
  },
  {
    image: i6,
    tag: "SPORTS • 2026 • LEADERSHIP",
    title: "Athletic Excellence & Championship",
    description: "Fostering athletic synergy, team coordination, physical endurance, and competitive sportsmanship on state-of-the-art campus grounds.",
    primaryBtn: "Tournament Schedule",
    secondaryBtn: "Sports Clubs"
  },
  {
    image: i7,
    tag: "ENTREPRENEURSHIP • 2026 • INCUBATION",
    title: "JECRC Incubation & Startup Center",
    description: "Nurturing student-led business proposals with funding access, specialized legal guidance, and industrial mentor networks.",
    primaryBtn: "Apply for Funding",
    secondaryBtn: "Featured Startups"
  },
  {
    image: i8,
    tag: "COMMUNITY • 2026 • SOCIAL IMPACT",
    title: "Zarurat Social Outreach Program",
    description: "Promoting digital literacy, educational equality, and green sustainability campaigns in collaboration with local communities.",
    primaryBtn: "Join Social Initiatives",
    secondaryBtn: "Impact Reports"
  },
  {
    image: i9,
    tag: "CAMPUS LIFE • 2026 • LIFE",
    title: "Modern Residential Community",
    description: "Providing comfortable campus housing, advanced libraries, digital study centers, and collaborative spaces for student success.",
    primaryBtn: "Dorm Tour",
    secondaryBtn: "Campus Amenities"
  },
  {
    image: i10,
    tag: "INNOVATION • 2026 • DISCOVERY",
    title: "3D Fabrication & Prototyping Center",
    description: "Where user-centric design principles meet raw additive manufacturing, featuring rapid prototyping tooling and advanced laser cutting.",
    primaryBtn: "Reserve Equipment",
    secondaryBtn: "Design Guidelines"
  },
  {
    image: i11,
    tag: "NETWORKING • 2026 • GLOBAL",
    title: "International Academic Collaborations",
    description: "Expanding boundaries through international student exchanges, shared research publications, and joint degree curriculum programs.",
    primaryBtn: "Study Abroad Programs",
    secondaryBtn: "Partner Universities"
  },
  {
    image: i12,
    tag: "ALUMNI • 2026 • NETWORK",
    title: "Global Alumni Mentorship Meet",
    description: "Reconnecting our global alumni base with undergraduate research groups to provide career insights and industry-oriented feedback.",
    primaryBtn: "Connect with Alumni",
    secondaryBtn: "Become a Mentor"
  },
  {
    image: i13,
    tag: "HACKATHON • 2026 • WOMEN IN TECH",
    title: "Women Empowerment Technology Forum",
    description: "Unifying women leaders in computer science through intensive bootcamps, code-athons, and structured technology mentorship.",
    primaryBtn: "Summit Schedule",
    secondaryBtn: "Keynote Speakers"
  },
  {
    image: i14,
    tag: "LITERATURE • 2026 • CREATIVITY",
    title: "Campus Literary & Debate Society",
    description: "Developing critical thinking, rhetoric skills, persuasive writing, and national parliamentary debate participation among student bodies.",
    primaryBtn: "Debate Schedule",
    secondaryBtn: "Publications Log"
  }
];

export default function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  // Touch swipe support state
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      handleNext();
    }, 6500); // 6.5-second slide transitions

    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  // Touch listeners
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 80) {
      handleNext(); // swipe left
    }
    if (touchStart - touchEnd < -80) {
      handlePrev(); // swipe right
    }
  };

  const handleCTA = () => {
    const token = localStorage.getItem("token");
    const activeRole = localStorage.getItem("activeRole") || localStorage.getItem("role");
    if (token && activeRole) {
      navigate(`/${activeRole.toLowerCase()}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-[#12141C] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Inline Styles for Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes kenburns {
          0% { transform: scale(1) translate3d(0, 0, 0); }
          100% { transform: scale(1.08) translate3d(0, 0, 0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translate3d(0, 15px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-kenburns {
          animation: kenburns 7s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite alternate;
        }
        .animate-fade-up {
          animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Background Image Layer */}
      <div className="absolute inset-0 w-full h-full z-0 bg-[#12141C]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {index === currentIndex && (
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover animate-kenburns"
              />
            )}
          </div>
        ))}
      </div>

      {/* Cinematic Left-Heavy Dark Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#12141C]/95 via-[#12141C]/80 to-transparent z-10 pointer-events-none" />
      {/* Bottom Mask to blend into page sections */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#12141C] via-[#12141C]/10 to-transparent z-10 pointer-events-none" />

      {/* Left-Aligned Constrained Content Layer */}
      <div className="absolute inset-0 flex items-center z-20 px-6 sm:px-12 md:px-24 max-w-7xl mx-auto w-full">
        <div className="max-w-2xl text-left">
          {slides.map((slide, index) => {
            if (index !== currentIndex) return null;
            return (
              <div key={index} className="space-y-4">
                {/* Overline Tag */}
                <div
                  className="animate-fade-up text-xs md:text-sm font-semibold tracking-widest text-[#6366F1] uppercase"
                  style={{ animationFillMode: 'both' }}
                >
                  {slide.tag}
                </div>

                {/* Display Heading */}
                <h1
                  className="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#F8FAFC] leading-tight"
                  style={{ animationDelay: '150ms', animationFillMode: 'both' }}
                >
                  {slide.title}
                </h1>

                {/* Narrative Paragraph */}
                <p
                  className="animate-fade-up text-sm sm:text-base md:text-lg text-[#94A3B8] leading-relaxed max-w-xl"
                  style={{ animationDelay: '300ms', animationFillMode: 'both' }}
                >
                  {slide.description}
                </p>

                {/* Dual Action Buttons */}
                <div
                  className="animate-fade-up flex flex-wrap gap-4 pt-4"
                  style={{ animationDelay: '450ms', animationFillMode: 'both' }}
                >
                  <button
                    onClick={handleCTA}
                    className="bg-[#6366F1] hover:bg-[#5053C9] text-[#F8FAFC] px-6 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:scale-[1.02]"
                  >
                    {slide.primaryBtn}
                  </button>
                  <button
                    onClick={handleCTA}
                    className="border border-[#94A3B8]/30 hover:border-[#94A3B8]/60 bg-[#1E2230]/40 hover:bg-[#1E2230]/70 text-[#F8FAFC] px-6 py-3 font-semibold rounded-xl backdrop-blur-md transition-all duration-300"
                  >
                    {slide.secondaryBtn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows (Subtle, Glassmorphic) */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/5 bg-[#12141C]/30 hover:bg-[#1E2230]/75 text-[#94A3B8] hover:text-[#F8FAFC] backdrop-blur-md transition-all duration-300 hover:scale-105"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full border border-white/5 bg-[#12141C]/30 hover:bg-[#1E2230]/75 text-[#94A3B8] hover:text-[#F8FAFC] backdrop-blur-md transition-all duration-300 hover:scale-105"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Progress Indicators / Pagination (Minimal Dash Bars) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? 'w-8 bg-[#6366F1]'
                : 'w-2.5 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
