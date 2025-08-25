// components/navigation/LandingNavBar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { ModeToggle } from '../Theme/ModeToggle';
import { Button } from '../ui/button';
import blogo from '../../assets/logo/bluelogo.png';
import wlogo from '../../assets/logo/whitelogo.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/login', label: 'Login', variant: 'button' },

];

export default function LandingNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 ">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          {/* <Link to="/" className="flex items-center -space-x-9">
            <img src={logo} alt="JECRC Logo" className="h-20 w-38 mt-6" />
            <span className="font-bold text-[#1e40af] font-serif text-xl">JECRC Foundation</span>
          </Link> */}

           {/* Logo */}
        <Link to="/" className="relative flex items-center h-20 w-38 mt-6">
          
          <img
            src={blogo}
            alt="Blue Logo"
            className="absolute top-0 left-0 h-20 w-auto transition-opacity duration-300 dark:opacity-0 opacity-100"
          />
          <img
            src={wlogo}
            alt="White Logo"
            className="absolute top-0 left-10 h-14 w-auto transition-opacity duration-300 opacity-0 dark:opacity-100"
          />
        </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ to, label, variant }) => (
              <Link
                key={to}
                to={to}
                className={variant === 'button'
                    ? 'bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90'
                    : pathname === to
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }>
            
                {label}
              </Link>
            ))}
            <ModeToggle />
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ModeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>


        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background px-4 py-3">
            {navLinks.map(({ to, label, variant }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={
                  variant === 'button'
                    ? 'block bg-primary text-primary-foreground px-4 py-2 rounded-md mb-2'
                    : 'block px-3 py-2 rounded-md hover:bg-muted'
                }
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}