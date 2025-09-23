import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './Login.jsx';
import RequestClearance from './RequestClearance.jsx';
import ClearanceProcess from './ClearanceProcess.jsx';
import DepartmentDashboard from './DepartmentDashboard.jsx';
import StaffLogin from './StaffLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/clearance" element={<RequestClearance />} />
                <Route path="/clearance-process" element={<ClearanceProcess />} />
                <Route path="/department/:deptName" element={<DepartmentDashboard />} />
                <Route path="/staff-login" element={<StaffLogin />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;