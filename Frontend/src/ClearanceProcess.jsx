import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClearanceProcess.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";

function ClearanceProcess() {
  const [progress, setProgress] = useState([]);
  const navigate = useNavigate();
  const studentName = localStorage.getItem("studentName") || "Student";

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    navigate("/");
  };

  const fetchProgress = () => {
    // For now, using dummy data until backend API is ready
    const dummyData = [
      { department: "Finance", status: "Approved", remarks: "No pending fees" },
      { department: "Library", status: "Pending", remarks: "" },
      { department: "Hostel", status: "Approved", remarks: "Room checked" },
      { department: "Dean", status: "Rejected", remarks: "Missing signature" },
    ];
    setProgress(dummyData);

    // Later replace with:
    // fetch(`/api/clearance/status/${studentId}`)
    //   .then(res => res.json())
    //   .then(data => setProgress(data));
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  // Calculate overall percentage
  const completed = progress.filter((p) => p.status === "Approved").length;
  const total = progress.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Function to style status
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "status-approved";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-rejected";
      default:
        return "";
    }
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

      <main className="progress-container">
        <h2>Clearance Progress</h2>

        {/* Progress summary */}
        <div className="progress-summary">
          <p>
            Overall Clearance Progress: <strong>{percentage}%</strong>
          </p>
          <progress value={completed} max={total}></progress>
          <button className="refresh-btn" onClick={fetchProgress}>
            Refresh
          </button>
        </div>

        {/* Progress table */}
        <table className="progress-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {progress.map((p, index) => (
              <tr key={index}>
                <td>{p.department}</td>
                <td className={getStatusClass(p.status)}>{p.status}</td>
                <td>{p.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}

export default ClearanceProcess;
