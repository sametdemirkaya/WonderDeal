import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import ScoutPage from './pages/ScoutPage';
import LandingPage from './pages/LandingPage';

import ShortlistPage from './pages/ShortlistPage';
import HeadToHeadPage from './pages/HeadToHeadPage';
import DiscoverPage from './pages/DiscoverPage';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/scout" element={<ScoutPage />} />
          <Route path="/h2h" element={<HeadToHeadPage />} />
          <Route path="/shortlist" element={<ShortlistPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
