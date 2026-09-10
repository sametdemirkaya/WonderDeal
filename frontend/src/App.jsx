import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScoutPage from './pages/ScoutPage';

import LandingPage from './pages/LandingPage';
import PlayerComparisonPage from './pages/PlayerComparisonPage';
import ShortlistPage from './pages/ShortlistPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="/scout" element={<ScoutPage />} />
          <Route path="/compare" element={<PlayerComparisonPage />} />
          <Route path="/shortlist" element={<ShortlistPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
