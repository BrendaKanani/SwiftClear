import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/api";
import "./StudentLogin.css";
import logo from '../../assets/DeKUT-Online-Clearance-Portal.png';
import { parseRegNo } from '../../utils/regNoParser'; 

function StudentLogin() {
    const navigate = useNavigate();
    
    const [regNo, setRegNo] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const authData = await apiService.loginStudent({ regNo, password });
            
            // --- SAVE SESSION DATA ---
            sessionStorage.setItem("studentName", authData.studentName); 
            sessionStorage.setItem("regNo", authData.regNo);
            sessionStorage.setItem("studentDept", authData.studentDept);

            if (authData.email) {
                sessionStorage.setItem("studentEmail", authData.email);
            }

            // Optional: Parse Cohort Year
            try {
                const parsedInfo = parseRegNo(authData.regNo);
                if (parsedInfo && parsedInfo.year) {
                    sessionStorage.setItem("cohort", parsedInfo.year);
                }
            } catch (e) { console.log("Parsing error ignored"); }

            // --- CHECK EXISTING REQUESTS ---
           try {
                const allRequests = await apiService.getAllRequests();
                const requestsArray = Array.isArray(allRequests) ? allRequests : (allRequests.data || []);
                const myRequest = requestsArray.find(req => req.regNo === authData.regNo);

                if (myRequest) {
                    sessionStorage.setItem("requestId", myRequest.id);
                } else {
                    sessionStorage.removeItem("requestId");
                }
            } catch (err) {
                console.warn("Could not check existing requests, default flow active.");
            }

            // --- REDIRECT ---
            navigate("/clearance"); 

        } catch (err) {
            console.error("Login Error:", err);
            setError(err.message || "Invalid Registration Number or Password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper"> 
            <header className="login-header">
                <div className="header-left">
                    <img src={logo} alt="University Logo" className="header-logo" />
                    <div className="uni-title">
                        <h2>Dedan Kimathi University of Technology</h2>
                        <p>Better Life through Technology</p>
                    </div>
                </div>
            </header>

            <div className="login-card">
                <div className="login-card-header">
                    <h2>Student Portal</h2>
                    <p>Sign in to start your clearance</p>
                </div>

                {error && (
                    <div className="error-msg">
                        <span className="error-icon">⚠️</span> {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Registration Number</label>
                        <input
                            type="text"
                            placeholder="e.g. C026-01-1234/2021"
                            required
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                            autoComplete="username"
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            className="input-field"
                        />
                    </div>
                    
                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox"/> Remember me
                        </label>
                        <a href="#" className="forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit" disabled={loading} className="login-btn">
                        {loading ? (
                            <span className="loader"></span> 
                        ) : "Login"}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Secure System • Office of the Registrar</p>
                </div>
            </div>
        </div>
    );
}

export default StudentLogin;