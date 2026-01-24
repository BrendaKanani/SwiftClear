import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin.jsx'; 
import StaffLogin from './pages/auth/StaffLogin.jsx';

// Student Pages 
import StudentClearance from './pages/student/StudentClearance.jsx';

// Staff Pages
import DepartmentDashboard from './pages/staff/DepartmentDashboard.jsx';
import AdminDashboard from './pages/staff/AdminDashboard.jsx';

// Home
import HomePage from './pages/home/HomePage.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Home */}
                <Route path="/" element={<HomePage />} />

                {/* Authentication */}
                <Route path="/student-login" element={<StudentLogin />} />
                <Route path="/staff-login" element={<StaffLogin />} />

                {/* Student Workflow */}
                <Route path="/clearance" element={<StudentClearance />} />

                {/* Staff Workflow */}
                <Route path="/department/:deptName" element={<DepartmentDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* Catch-All: Redirect unknown paths to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;