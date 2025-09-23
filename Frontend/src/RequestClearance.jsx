import React, { useState } from "react";
import "./RequestClearance.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";
import { useNavigate } from "react-router-dom";

function RequestClearance() {
  const navigate = useNavigate();
  const studentName = localStorage.getItem("studentName");

  const hour = new Date().getHours();
  const greetings =
    hour < 12 ? "Good morning" : hour < 16 ? "Good Afternoon" : "Good Evening";

  const [nationalId, setNationalId] = useState(null);
  const [birthCert, setBirthCert] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nationalId || !birthCert) {
      alert("Please upload both National ID and Birth Certificate.");
      return;
    }

    // Save file names in localStorage (temporary, until backend integration)
    localStorage.setItem(
      "clearanceDocs",
      JSON.stringify({
        nationalId: nationalId.name,
        birthCert: birthCert.name,
      })
    );

    // Navigate to clearance process page
    navigate("/clearance-process");
  };

  return (
    <>
      <header className="header-bar">
        <div className="header-bar-left">
          <img src={logo} alt="University Logo" className="logo" />
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
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="page-content">
        <h1 className="greeting-text">
          {greetings}, {studentName}
        </h1>
        <h1>Welcome,</h1>
        <p>Please upload the required documents to begin your clearance process.</p>

        <form onSubmit={handleSubmit} className="clearance-form">
          <div className="form-group">
            <label>Upload National ID:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setNationalId(e.target.files[0])}
              required
            />
          </div>

          <div className="form-group">
            <label>Upload Birth Certificate:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setBirthCert(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="request-btn">
            Submit Request
          </button>
        </form>
      </main>
    </>
  );
}

export default RequestClearance;
