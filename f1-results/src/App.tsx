import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import './table.css';

import './App.css';
import Standings from './Standings';
import Admin from './Admin';

function App() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Standings />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
