

const HeroSection = () => {
  return (

    <div className="flex flex-col items-center mt-6 lg:20">

      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-center mb-4 tracking-wide">
         U'r HERE...
         <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          {" "}
          <br />
          Unified Academic Management
         </span>

      </h1>
      <p className="mt-10 text-lg sm:text-xl lg:text-2xl text-center text-neutral-500 mb-6 max-w-4xl">
       Streamline academic workflows, track attendance, manage assignments, and stay connected with your 
       college community - all in one place.
      </p>
      <div className="flex justify-center my-10">

        <a 
          href="#"
          className="bg-gradient-to-b from-blue-500 to-purple-500  px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">

            Begin Your Journey!
          </a>
      </div>

      <div className="flex mt-10 justify-center">
        <video 
          autoPlay 
          loop muted 
          className=" rounded-lg w-1/2 shadow-lg border-gray-600 mx-2 my-8"
          src="https://www.w3schools.com/html/mov_bbb.mp4"> 
        </video>

{/* additions stuff at hero section like videos, animation, images etc...  */}
        <video 
          autoPlay 
          loop muted 
          className=" rounded-lg w-1/2 shadow-lg border-gray-600 mx-2 my-8"
          src="https://www.w3schools.com/html/mov_bbb.mp4"> 
        </video>


      </div>

    </div>
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
  );
};

export default HeroSection;