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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [previewFile, setPreviewFile] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nationalId || !birthCert) {
      setMessage({ text: "Please upload both National ID and Birth Certificate.", type: "error" });
      return;
    }

    localStorage.setItem(
      "clearanceDocs",
      JSON.stringify({
        nationalId: nationalId.name,
        birthCert: birthCert.name,
      })
    );

    setMessage({ text: "Documents uploaded successfully!", type: "success" });

    // Navigate after short delay
    setTimeout(() => navigate("/clearance-process"), 2000);
  };

  const openPreview = (file) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
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
        <p>Please upload the required documents to begin your clearance process.</p>

        {message.text && (
          <div className={`notification ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="clearance-form">
          <div className="form-group">
            <label>Upload National ID:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setNationalId(e.target.files[0])}
              required
            />
            {nationalId && (
              <span className="file-link" onClick={() => openPreview(nationalId)}>
                📄 {nationalId.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Upload Birth Certificate:</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setBirthCert(e.target.files[0])}
              required
            />
            {birthCert && (
              <span className="file-link" onClick={() => openPreview(birthCert)}>
                📄 {birthCert.name}
              </span>
            )}
          </div>

          <button type="submit" className="request-btn">
            Submit Request
          </button>
        </form>
      </main>

      {/* ✅ Modal Preview */}
      {previewFile && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closePreview}>✖</button>
            <h3>{previewFile.name}</h3>
            {previewFile.type.includes("image") ? (
              <img
                src={URL.createObjectURL(previewFile)}
                alt="Preview"
                className="preview-image"
              />
            ) : (
              <iframe
                src={URL.createObjectURL(previewFile)}
                title="PDF Preview"
                className="preview-pdf"
              ></iframe>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default RequestClearance;
