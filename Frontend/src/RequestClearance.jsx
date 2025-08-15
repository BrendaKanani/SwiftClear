import React from "react";
import './RequestClearance.css';
import logo from './assets/DeKUT-Online-Clearance-Portal.png';
import { useNavigate } from "react-router-dom";

function RequestClearance() {
    const navigate = useNavigate();
    const studentName = localStorage.getItem("studentName");
    const hour = new Date().getHours();
    const greetings = 
      hour < 12 ? "Good morning" :
      hour < 18 ? "Good Afternoon" : "Good Evening";

    const handleLogout = () => {
        localStorage.removeItem("studentName");
        navigate("/");
    };

    return (
        <>
        <header className="header-bar">
            <div className="header-bar-left">
            <img src={logo} alt="University Logo" className="logo"/>
            <div className="university-name">
                <h2>Dedan Kimathi University of Technology</h2>
                <p>Better Life through Technology</p>
            </div>
            </div>

            <div className="user-section">
                <div className="student-avatar">
                    {studentName.charAt(0).toUpperCase()}
                </div>
                <span className="student-name">{studentName}</span>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </header>
        <main className="page-content">
            <h1 className="greeting-text">{greetings}, {studentName}</h1>
            <h1>Welcome,</h1>
            <p>Ready to start your clearance process?</p>
            <button className="request-btn">Request Clearance</button>
        </main>
        </>
    );
}

export default RequestClearance;