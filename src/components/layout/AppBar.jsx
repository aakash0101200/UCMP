import { Menu, X } from "lucide-react";
//to make it dynamic use useState to toggle the menu
import React, { useState } from "react";

import { ModeToggle } from '@/components/Theme/ModeToggle';

import { Link } from "react-router-dom"; //add navigation links using the Link component from react-router-dom
import logo from "../../assets/logo.png";
import StudentDashboard from "../../pages/StudentDashboard";
const AppBar = () => {

  // State to manage the open/close state of the mobile menu
  //useState is a hook that allows you to add state to functional components
  
  const [isOpen, setIsOpen] = useState(false); //state to manage the menu toggle
  const toggleMenu = () => {
    setIsOpen(!isOpen); //toggle the menu state
  };

  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg bg-white/20 dark:bg-neutral-900/20 border-b border-neutral-700/60">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">

          {/* Logo + Title */}
          <div className="flex items-center flex-shrink-0">
            <img src={logo} alt="Logo" className="h-10 w-10 mr-2" />
            <span className="text-xl tracking-tight">UCMP</span>
          </div>

          {/* Desktop Nav Links */}
          <ul className="hidden lg:flex ml-14 space-x-12">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/login" className="hover:underline">Login</Link></li>
            <li><Link to="/student" className="hover:underline">Student</Link></li>
            <li><Link to="/faculty" className="hover:underline">Faculty</Link></li>
            <li><Link to="/about" className="hover:underline">About</Link></li>
          </ul>

          {/* Desktop Actions + Theme Toggle */}
          <div className="hidden lg:flex items-center space-x-4">
            <ModeToggle />                            {/* ← Your toggle goes here */}
            <a href="#" className="py-2 px-3 rounded-md">Sign In</a>
            <a href="#" className="bg-gradient-to-r from-green-700 to-green-900 py-2 px-3 rounded-md">
              Log In
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="fixed right-0 z-20 bg-neutral-900 w-full flex flex-col justify-center items-center p-12 lg:hidden">
            <ul className="space-y-4 text-white">
              <li><Link to="/" onClick={toggleMenu} className="hover:underline py-4">Home</Link></li>
              <li><Link to="/login" onClick={toggleMenu} className="hover:underline py-4">Login</Link></li>
              <li><Link to="/about" onClick={toggleMenu} className="hover:underline py-4">About</Link></li>
            </ul>
            <div className="flex justify-center space-x-6 items-center mt-4">
              <ModeToggle />                       {/* ← optional: put it here too */}
              <a href="#" className="py-2 px-3 rounded-md">Sign In</a>
              <a href="/login" className="bg-gradient-to-r from-green-600 to-green-900 py-2 px-3 rounded-md">
                Log In
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AppBar;