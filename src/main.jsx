import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'
import './index.css' // Import your global CSS file
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.jsx'
// import {App2} from './App.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
  
    
);
