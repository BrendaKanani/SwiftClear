import React from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';
import logo from './assets/DeKUT-Online-Clearance-Portal.png';

function Login() {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const studentName = "John Doe";
        localStorage.setItem("studentName", studentName);
        navigate("/clearance");
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
                    <h2>Student Login</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Registration Number or Email"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                    <p className="forgot-password">Forgot Password</p>
                </div>
            </div>
        </>
    );
}

export default Login;
