import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css"; // reuse existing login styles
import logo from "./assets/DeKUT-Online-Clearance-Portal.png";

function StaffLogin() {
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState("");
  const [password, setPassword] = useState("");
  const [deptName, setDeptName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save to localStorage
    localStorage.setItem("staffName", staffName || "Staff");
    localStorage.setItem("deptName", deptName);

    // Redirect based on department
    if (deptName === "Admin") {
      navigate("/admin-dashboard");
    } else {
      navigate(`/department/${deptName}`);
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
      </header>

      <div className="login-container">
        <div className="login-box">
          <h2>Staff Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                placeholder="Staff ID or Email"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <select
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                <option value="Admin">Admin</option>
                <option value="Finance">Finance</option>
                <option value="Library">Library</option>
                <option value="Registrar">Registrar</option>
                <option value="Exams">Exams</option>
                <option value="DepartmentalOffice">Departmental Office</option>
                <option value="SportsWelfare">Sports & Welfare</option>
              </select>
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
}

export default StaffLogin;
