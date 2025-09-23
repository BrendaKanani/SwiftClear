import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DepartmentDashboard.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";

function DepartmentDashboard() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const { deptName } = useParams();

  const staffName = localStorage.getItem("staffName");
  const storedDept = localStorage.getItem("deptName");

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!staffName || !storedDept || storedDept !== deptName) {
      navigate("/staff-login");
    }
  }, [staffName, storedDept, deptName, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("staffName");
    localStorage.removeItem("deptName");
    navigate("/staff-login"); // ✅ back to staff login
  };

  useEffect(() => {
    // Dummy data for now
    const dummyStudents = [
      { id: 1, name: "John Doe", regNo: "CIT/001/2021", status: "Pending", remarks: "" },
      { id: 2, name: "Jane Smith", regNo: "CIT/002/2021", status: "Pending", remarks: "" },
    ];
    setStudents(dummyStudents);
  }, []);

  const handleDecision = (id, decision) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, status: decision } : student
      )
    );
  };

  const handleRemarksChange = (id, value) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, remarks: value } : student
      )
    );
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
            {staffName ? staffName.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="student-name">{staffName || "Unknown"}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="progress-container">
        <h2>{deptName} Department Dashboard</h2>

        {students.length > 0 ? (
          <table className="progress-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.regNo}</td>
                  <td
                    className={
                      student.status === "Approved"
                        ? "status-approved"
                        : student.status === "Rejected"
                        ? "status-rejected"
                        : "status-pending"
                    }
                  >
                    {student.status}
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Enter remarks"
                      value={student.remarks}
                      onChange={(e) =>
                        handleRemarksChange(student.id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="approve-btn"
                      onClick={() => handleDecision(student.id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleDecision(student.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No student clearance requests available.</p>
        )}
      </main>
    </>
  );
}

export default DepartmentDashboard;
