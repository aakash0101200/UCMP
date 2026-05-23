import { useNavigate } from 'react-router-dom';
const HeroSection = () => {
  const navigate = useNavigate();

  const handleBeginJourney = () => {
    const token = localStorage.getItem("token");
    const activeRole = localStorage.getItem("activeRole") || localStorage.getItem("role");
    if (token && activeRole) {
      navigate(`/${activeRole.toLowerCase()}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="
    flex flex-col items-center
    mt-8 sm:mt-12 lg:mt-16
    px-4 sm:px-6
    text-center
    max-w-7xl
    mx-auto
  ">

      <span className="
      bg-muted
      px-4 py-1
      mb-5
      rounded-xl
      text-sm sm:text-base
      border border-neutral-300
      z-10
    ">
        🧠 | Learn Together
      </span>

      <h2 className="
      text-3xl
      sm:text-5xl
      lg:text-7xl
      font-bold
      tracking-tight
      mb-2
      z-10
      leading-tight
    ">
        Welcome to Campus
      </h2>

      <h1 className="
      text-3xl
      sm:text-5xl
      lg:text-7xl
      font-bold
      tracking-tight
      mb-5
      leading-tight
      z-10
    ">
        Unified Academic{" "}
        <span className="text-indigo-600">
          Management
        </span>
      </h1>

      <p className="
      text-base
      sm:text-lg
      lg:text-2xl
      text-neutral-800
      dark:text-neutral-400
      mb-8
      max-w-3xl
      leading-relaxed
      z-10
    ">
        Streamline academic workflows,
        track attendance, manage assignments,
        and stay connected with your college
        community — all in one place.
      </p>

      <div className="
      flex justify-center
      w-full
      z-10
    ">
        <button
          onClick={handleBeginJourney}
          className="
          w-full sm:w-auto
          bg-indigo-600
          hover:bg-indigo-700
          text-white
          px-6 sm:px-8
          py-3
          rounded-xl
          shadow-md
          hover:shadow-lg
          transition-all
          duration-200
          text-sm sm:text-base
        "
        >
          Begin Your Journey!
        </button>
      </div>

    </div>
  );
};

export default HeroSection;
