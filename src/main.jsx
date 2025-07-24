// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import React from 'react'
// import './index.css' // Import your global CSS file
// import 'bootstrap/dist/css/bootstrap.min.css';

// import App from './App.jsx'
// // import {App2} from './App.jsx' 

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
  
    
// );
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'            // Tailwind + your CSS variables
import App from './App.jsx'
import { ThemeProvider } from './components/Theme/theme-provider'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Wrap entire App in ThemeProvider */}
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
