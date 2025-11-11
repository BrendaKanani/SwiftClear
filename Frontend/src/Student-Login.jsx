import React from "react";
import { useNavigate } from "react-router-dom";
import './Student-Login.css';
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
                        <div className="input-box">
                        <input
                            type="text"
                            placeholder="Registration Number or Email"
                            required
                        />
                        </div>
                        <div className="input-box">
                        <input
                            type="password"
                            placeholder="Password"
                            required
                        />
                        </div>
                        <div className="remeber-row">
                            <label>
                                <input type="checkbox"/>
                                Remember me
                            </label>
                        </div>
                        <div className="forgot-password">
                            <a href="#">Forgot Password</a>
                        </div>
                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
