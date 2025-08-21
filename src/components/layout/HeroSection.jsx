import vid from '../../assets/education.mp4';

const HeroSection = () => {
  return (

    <div className="flex flex-col items-center mt-4 lg:20">

       <span className="bg-muted px-4 py-1 my-4 rounded-full z-10 text-xs border-2 border-neutral-600">
        🧠 | Learn Together
      </span>

      <h2 className=" z-1 sm:text-6xl lg:text-7xl font-bold text-center mb-4 tracking-wide">
         Welcome to Campus
      </h2>
      <h1 className="z-1  sm:text-6xl lg:text-7xl font-bold text-center mb-5 tracking-wide">
          Unified Academic <span className="text-indigo-600">Management</span>
      </h1>
      <p className="z-1 text-lg sm:text-xl lg:text-2xl text-center text-neutral-800 dark:text-neutral-400 mb-6 max-w-4xl">
       Streamline academic workflows, track attendance, manage assignments,<br/> and stay connected with your 
       college community - all in one place.
      </p>
      <div className="z-1 flex justify-center my-10">

        <button 
          
          className="bg-indigo-600 text-white px-4 py-3 z-1 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">

            Begin Your Journey!
          </button>
      </div>

      <div className="flex mt-10 z-1 justify-center">
        <video 
          autoPlay 
          loop muted 
          className=" rounded-lg w-1/2 shadow-lg border-gray-600 mx-2 my-8 sm:w-3/4 md:w-1/2 lg:w-2/1"
          src= {vid}> 
        </video>

{/* additions stuff at hero section like videos, animation, images etc...  */}
        {/* <video 
          autoPlay 
          loop muted 
          className=" rounded-lg w-1/2 shadow-lg border-gray-600 mx-2 my-8"
          src="https://www.w3schools.com/html/mov_bbb.mp4"> 
        </video> */}


      </div>

    </div>
    
  );
};

export default HeroSection;

//   <div className="hero">
    //     <h1>Welcome </h1>
    //     <p></p>
    //     <p>Manage academics, clubs, and college life in one place.</p>
    //     <div className="buttons">
    //         <button>Login</button>
    //     <div/>
    //     <button className="cta-button">Get Started</button>
    //   </div>
    // </div>