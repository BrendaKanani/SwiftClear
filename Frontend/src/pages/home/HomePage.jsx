import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import logo from "../../assets/DeKUT-Online-Clearance-Portal.png"; 

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-layout">
      {/* Background Image Layer */}
      <div className="background-overlay" />
      
      <header className="header-bar">
        <div className="header-content">
          <img src={logo} alt="DeKUT Logo" className="logo" />
          <div className="university-name">
            <h2>Dedan Kimathi University of Technology</h2>
            <p>Better Life through Technology</p>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="welcome-card">
          <div className="card-content">
            <h1 className="home-title">🎓 Graduation Clearance</h1>
            <p className="home-subtitle">
              Welcome to the official online clearance portal for
              <br />
              <strong>Dedan Kimathi University of Technology</strong>.
            </p>
            <p className="home-description">
              Streamline your graduation journey. Submit documents, track your status, 
              and get cleared from the comfort of your home.
            </p>

            <div className="action-buttons">
              <button
                className="btn-primary student-btn"
                onClick={() => navigate("/student-login")}
              >
                <span>🎓</span> Student Portal
              </button>
              <button
                className="btn-secondary staff-btn"
                onClick={() => navigate("/staff-login")}
              >
                <span>🧑‍💼</span> Staff Portal
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>
          &copy; {new Date().getFullYear()} Dedan Kimathi University of Technology • ISO 9001:2015 Certified
        </p>
      </footer>
    </div>
  );
}

export default HomePage;