import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import "./StaffLogin.css"; 
import logo from "../../assets/DeKUT-Online-Clearance-Portal.png";

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiService.loginStaff({ email, password });
      
      // Save Session
      sessionStorage.setItem("staffName", data.name);
      sessionStorage.setItem("staffDept", data.department);
      sessionStorage.setItem("staffRole", data.role);
      sessionStorage.setItem("email", email); 

      // Redirect Logic based on Role/Department
      if (data.role === 'admin' || data.department === 'Registrar' || data.department === 'Admin') {
        navigate("/admin-dashboard");
      } else {
        navigate(`/department/${data.department}`);
      }

    } catch (err) {
      console.error("Staff Login Error:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-login-container">
      <header className="header-bar">
        <div className="header-content">
          <img src={logo} alt="University Logo" className="logo" />
          <div className="university-name">
            <h2>Dedan Kimathi University</h2>
            <p>Better Life through Technology</p>
          </div>
        </div>
      </header>

      <div className="login-content">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Staff Portal</h2>
            <p>Sign in to manage clearance requests</p>
          </div>
          
          {error && (
            <div className="error-msg">
                <span className="error-icon">⚠️</span> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Staff Email</label>
              <input
                type="email"
                placeholder="staff@dkut.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field"
              />
            </div>
            
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <span className="loader"></span> : "Login"}
            </button>
          </form>
          
          <div className="login-footer">
             <p>Authorized Staff Access Only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffLogin;