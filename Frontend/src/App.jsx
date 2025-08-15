import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './Login.jsx';
import RequestClearance from './RequestClearance.jsx';
<Route path="/clearance" element={<RequestClearance />} />


function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/clearance" element={<RequestClearance />} />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;