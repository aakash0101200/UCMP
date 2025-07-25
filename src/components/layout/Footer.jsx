import React from 'react';

const Footer = () => {
  return (
    <footer className="
      text-center
      py-4
      bg-gray-50 dark:bg-sidebar/40
      backdrop-blur-md
      transition-colors duration-300
    ">
      <p className="text-xs text-gray-800 dark:text-gray-200 mb-2">
        © 2025 UCMP Website. All rights reserved.
      </p>
      
      <p>
        <a
          href="/privacy-policy"
          className="text-gray-600 dark:text-gray-300 hover:underline"
        >
          Privacy Policy
        </a>
        <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
        <a
          href="/terms-of-service"
          className="text-gray-600 dark:text-gray-300 hover:underline"
        >
          Terms of Service
        </a>
      </p>
    </footer>
  );
};

export default Footer;
