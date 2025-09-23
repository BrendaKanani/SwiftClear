import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepartmentDashboard.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  const adminName = localStorage.getItem("staffName");
  const deptName = localStorage.getItem("deptName");

  // ✅ Redirect if not logged in as Admin
  useEffect(() => {
    if (!adminName || deptName !== "Admin") {
      navigate("/staff-login");
    }
  }, [adminName, deptName, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("staffName");
    localStorage.removeItem("deptName");
    navigate("/staff-login"); // ✅ back to staff login
  };

  useEffect(() => {
    // Dummy data with remarks
    const dummyData = [
      {
        id: 1,
        name: "John Doe",
        regNo: "CIT/001/2021",
        clearance: {
          Finance: { status: "Approved", remarks: "No pending fees" },
          Library: { status: "Pending", remarks: "" },
          Hostel: { status: "Approved", remarks: "Room checked" },
          Dean: { status: "Rejected", remarks: "Disciplinary case pending" },
        },
      },
      {
        id: 2,
        name: "Jane Smith",
        regNo: "CIT/002/2021",
        clearance: {
          Finance: { status: "Pending", remarks: "" },
          Library: { status: "Approved", remarks: "All books returned" },
          Hostel: { status: "Pending", remarks: "" },
          Dean: { status: "Pending", remarks: "" },
        },
      },
    ];
    setStudents(dummyData);
  }, []);

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
            {adminName ? adminName.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="student-name">{adminName || "Unknown"}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="progress-container">
        <h2>Admin Dashboard</h2>
        {students.length > 0 ? (
          <table className="progress-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>Finance</th>
                <th>Library</th>
                <th>Hostel</th>
                <th>Dean</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.regNo}</td>
                  {["Finance", "Library", "Hostel", "Dean"].map((dept) => (
                    <td
                      key={dept}
                      className={
                        student.clearance[dept].status === "Approved"
                          ? "status-approved"
                          : student.clearance[dept].status === "Rejected"
                          ? "status-rejected"
                          : "status-pending"
                      }
                      title={student.clearance[dept].remarks} // ✅ hover to see remark
                    >
                      {student.clearance[dept].status}
                      {student.clearance[dept].remarks && (
                        <div className="remarks">
                          <small>{student.clearance[dept].remarks}</small>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No clearance records available.</p>
        )}
      </main>
    </>
  );
}

export default AdminDashboard;
