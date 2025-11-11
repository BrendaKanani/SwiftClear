import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DepartmentDashboard.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";

function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedDept, setSelectedDept] = useState("All");
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
    navigate("/staff-login");
  };

  useEffect(() => {
    // Dummy data
    const dummyData = [
      {
        id: 1,
        name: "John Doe",
        regNo: "CIT/001/2021",
        clearance: {
          Finance: { status: "Approved", remarks: "No pending fees" },
          DepartmentalOffice: { status: "Pending", remarks: "" },
          Library: { status: "Approved", remarks: "Returned all books" },
          Exams: { status: "Rejected", remarks: "Missing CCS 4102" },
          SportsWelfare: { status: "Approved", remarks: "Good record" },
        },
      },
      {
        id: 2,
        name: "Jane Smith",
        regNo: "CIT/002/2021",
        clearance: {
          Finance: { status: "Pending", remarks: "" },
          DepartmentalOffice: { status: "Approved", remarks: "All good" },
          Library: { status: "Pending", remarks: "" },
          Exams: { status: "Approved", remarks: "Cleared" },
          SportsWelfare: { status: "Approved", remarks: "No issues" },
        },
      },
    ];
    setStudents(dummyData);
  }, []);

  const departments = [
    "All",
    "Finance",
    "DepartmentalOffice",
    "Library",
    "Exams",
    "SportsWelfare",
  ];

  // derive columns to display
  const visibleCols = selectedDept === "All" ? departments.slice(1) : [selectedDept];

  const renderStatusCell = (student, dept) => {
    const status = student.clearance?.[dept]?.status ?? "N/A";
    const remarks = student.clearance?.[dept]?.remarks ?? "";

    const className =
      status === "Approved" ? "status-approved" : status === "Rejected" ? "status-rejected" : "status-pending";

    return (
      <td key={dept} className={className}>
        <strong>{status}</strong>
        {remarks && (
          <div className="remarks">
            <small>{remarks}</small>
          </div>
        )}
      </td>
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
            {adminName ? adminName.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="student-name">{adminName || "Unknown"}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="progress-container">
        <h2>Registrar / Admin Dashboard</h2>

        {/* ✅ Department filter menu */}
        <div className="role-menu">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              className={selectedDept === dept ? "active" : ""}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* ✅ Scrollable table */}
        {students.length > 0 ? (
          <div className="table-wrapper">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  {visibleCols.map((dept) => (
                    <th key={dept}>{dept}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.regNo}</td>
                    {visibleCols.map((dept) => renderStatusCell(student, dept))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No clearance records available.</p>
        )}
      </main>
    </>
  );
}

export default AdminDashboard;
