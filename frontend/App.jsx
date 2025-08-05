import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './src/components/Home';
import OverviewPage from './src/components/admin/OverviewPage';

function App() {
  return (
    <Router>
      <div id="app-root" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/overview" element={<OverviewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;