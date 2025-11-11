import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DepartmentDashboard.css";
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";

function DepartmentDashboard() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarks, setRemarks] = useState("");
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
    navigate("/staff-login");
  };

  useEffect(() => {
    // Dummy data including detailed student records
    const dummyStudents = [
      {
        id: 1,
        name: "John Doe",
        regNo: "CIT/001/2021",
        status: "Pending",
        remarks: "",
        details: {
          Finance: { feesBalance: 5000, fines: 0 },
          Library: { borrowedBooks: ["Database Systems"], fines: 200 },
          Registrar: { program: "BSc Computer Science", year: 4, registered: true },
          Exams: { cleared: false, missingPapers: ["CCS 4102"] },
          DepartmentalOffice: { projectSubmitted: true, labEquipmentReturned: false },
          SportsWelfare: { equipmentReturned: true, disciplineRecord: "Good" },
        },
      },
      {
        id: 2,
        name: "Jane Smith",
        regNo: "CIT/002/2021",
        status: "Pending",
        remarks: "",
        details: {
          Finance: { feesBalance: 0, fines: 0 },
          Library: { borrowedBooks: [], fines: 0 },
          Registrar: { program: "BSc Information Technology", year: 3, registered: true },
          Exams: { cleared: true, missingPapers: [] },
          DepartmentalOffice: { projectSubmitted: false, labEquipmentReturned: true },
          SportsWelfare: { equipmentReturned: true, disciplineRecord: "Good" },
        },
      },
    ];
    setStudents(dummyStudents);
  }, []);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setRemarks(student.remarks || "");
  };

  const handleDecision = (decision) => {
    if (!selectedStudent) return;
    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, status: decision, remarks }
          : student
      )
    );
    setSelectedStudent(null);
  };

  return (
    <>
      {/* ===== Header ===== */}
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

      {/* ===== Main Dashboard ===== */}
      <main className="progress-container">
        <h2>{deptName} Department Dashboard</h2>

        <div className="table-wrapper">
          {students.length > 0 ? (
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Status</th>
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
                      <button onClick={() => handleViewDetails(student)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No student clearance requests available.</p>
          )}
        </div>
      </main>

      {/* ===== Student Details Modal ===== */}
      {selectedStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {selectedStudent.name} - {selectedStudent.regNo}
            </h3>

            <div className="modal-details">
              {deptName === "Finance" && (
                <>
                  <p><strong>Fees Balance:</strong> {selectedStudent.details.Finance.feesBalance}</p>
                  <p><strong>Fines:</strong> {selectedStudent.details.Finance.fines}</p>
                </>
              )}

              {deptName === "Library" && (
                <>
                  <p><strong>Borrowed Books:</strong> {selectedStudent.details.Library.borrowedBooks.join(", ") || "None"}</p>
                  <p><strong>Fines:</strong> {selectedStudent.details.Library.fines}</p>
                </>
              )}

              {deptName === "Registrar" && (
                <>
                  <p><strong>Program:</strong> {selectedStudent.details.Registrar.program}</p>
                  <p><strong>Year:</strong> {selectedStudent.details.Registrar.year}</p>
                  <p><strong>Registered:</strong> {selectedStudent.details.Registrar.registered ? "Yes" : "No"}</p>
                </>
              )}

              {deptName === "Exams" && (
                <>
                  <p><strong>Cleared:</strong> {selectedStudent.details.Exams.cleared ? "Yes" : "No"}</p>
                  <p><strong>Missing Papers:</strong> {selectedStudent.details.Exams.missingPapers.join(", ") || "None"}</p>
                </>
              )}

              {deptName === "DepartmentalOffice" && (
                <>
                  <p><strong>Project Submitted:</strong> {selectedStudent.details.DepartmentalOffice.projectSubmitted ? "Yes" : "No"}</p>
                  <p><strong>Lab Equipment Returned:</strong> {selectedStudent.details.DepartmentalOffice.labEquipmentReturned ? "Yes" : "No"}</p>
                </>
              )}

              {deptName === "SportsWelfare" && (
                <>
                  <p><strong>Equipment Returned:</strong> {selectedStudent.details.SportsWelfare.equipmentReturned ? "Yes" : "No"}</p>
                  <p><strong>Discipline Record:</strong> {selectedStudent.details.SportsWelfare.disciplineRecord}</p>
                </>
              )}
            </div>

            <textarea
              placeholder="Enter remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className="approve-btn"
                onClick={() => handleDecision("Approved")}
              >
                Approve
              </button>
              <button
                className="reject-btn"
                onClick={() => handleDecision("Rejected")}
              >
                Reject
              </button>
              <button onClick={() => setSelectedStudent(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DepartmentDashboard;
