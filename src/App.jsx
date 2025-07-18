import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/Theme/theme-provider';

//State for values that change over time (e.g form inputs, API data, toggle states) its like notebook for the app
//useState is a hook that allows you to add state to functional components
//useEffect is a hook that allows you to perform side effects in function components its like an assistant that helps you manage side effects in your app
//Effects for side effects (e.g fetching data, subscriptions, timers)

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

//BrowserRouter is a component that uses the HTML5 history API to keep your UI in sync with the URL it's like a GPS for your app that keeps track of the current location

//Routes is a component that renders the first child <Route> that matches the current location
//Route is a component that renders a UI component when its path matches the current location
//Link is a component that renders an anchor tag that navigates to a different route when clicked it's like a hyperlinks but smoother and more powerful
import './App.css'
import { ToastContainer } from 'react-toastify'; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

import LoginPage from './pages/LoginPage';
import Home from './pages/Home';

import AppBar from './components/layout/AppBar'; //the top navigation bar (like a header) of the app
import HeroSection from './components/layout/HeroSection'; //the first section of the home page with specific size and margin (The big banner at the top of the home page)
import FeatureCard from './components/layout/FeatureCard';
import StudentDashboard from './pages/StudentDashboard'; //the student dashboard page (like a room in the house where students can see their information and features of the app)
//FeatureCard is a component that displays a feature of the app with an icon, title, and description



/* THE BLUEPRINT */
export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <>
          <AppBar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/student" element={<StudentDashboard />} />
            {/* add more routes as needed */}
          </Routes>

          <ToastContainer position="top-right" autoClose={3000} />
        </>
      </BrowserRouter>
    </ThemeProvider>
  );
}

/* 
└── BrowserRouter (GPS for whole app)
    ├── AppBar (always visible header)
    ├── Container (centered content)
    │   └── HeroSection (main banner)
    └── FeatureCard (feature boxes) //wrong bcz it is floating outside any page component
*/


//App is the main component of the app that renders the layout and the routes






/*
a) Page Structure:

Think of your app like a house:

App.js = The foundation and layout

pages/ = Different rooms (Home, Login)

components/ = Furniture (AppBar, HeroSection)

b) Navigation:
BrowserRouter = The GPS that helps you navigate through the house
Routes = The signs that tell you which room to go to
Route = The specific path to a room (e.g., /home, /login)

c) Components:
AppBar = The header of the house (like a welcome mat)
Footer = The footer of the house (like a doormat)
HeroSection = The main living area (where you showcase your best features)
FeatureCard = The furniture that highlights specific features of the house
d) Styling:
App.css = The paint and decor that make your house look nice
You can use CSS to style your components and make them visually appealing
e) State Management:
useState = The notebook where you write down important information (like form inputs)
useEffect = The assistant that helps you manage side effects (like fetching data)
f) Example:
In the Home page, you can have a HeroSection that welcomes users and FeatureCards that showcase
the app's features. The LoginPage can have a form for users to log in. 
g) Routing:
When a user clicks on a link, the BrowserRouter updates the URL and renders the corresponding component
(e.g., Home or LoginPage). This allows users to navigate through the app seamlessly.

--------------------------------------------------------------
Important Notes:
<BrowserRouter> must wrap everything that needs routing
Component Order matters - this is how they'll appear on screen


*/