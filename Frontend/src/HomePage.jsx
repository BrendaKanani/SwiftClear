// src/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";  

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
    <div className="background" />
    
      <header className="header-bar">
        <div className="header-bar-left">
          <img src={logo} alt="University Logo" className="logo" />
          <div className="university-name">
            <h2>Dedan Kimathi University of Technology</h2>
            <p>Better Life through Technology</p>
          </div>
        </div>
      </header>

      <main className="home-content">
        <div className="welcome-card">
          <h1 className="home-title">🎓 Online Clearance Portal</h1>
          <p className="home-subtitle">
            Welcome to the official graduation clearance system of
            <br />
            <strong>Dedan Kimathi University of Technology</strong>.
          </p>
          <p className="home-subtext">
            Begin your graduation journey by submitting clearance documents
            or approving student requests as a staff member.
          </p>

          <div className="home-buttons">
            <button
              className="student-btn"
              onClick={() => navigate("/student-login")}
            >
              🎓 Student Login
            </button>
            <button
              className="staff-btn"
              onClick={() => navigate("/staff-login")}
            >
              🧑‍💼 Staff Login
            </button>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>
          © {new Date().getFullYear()} Dedan Kimathi University of Technology — All Rights Reserved
        </p>
      </footer>
    </>
  );
}

export default HomePage;
