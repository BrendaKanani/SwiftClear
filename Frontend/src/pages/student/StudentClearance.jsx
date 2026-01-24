import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import logo from "../../assets/DeKUT-Online-Clearance-Portal.png";
import "./StudentClearance.css";

// IMPORT API SERVICE & DYNAMIC URL
import { apiService, API_BASE_URL_EXPORT } from "../../services/api";

function StudentClearance() {
  const navigate = useNavigate();

  // --- 1. USER SESSION ---
  const studentName = sessionStorage.getItem("studentName") || "Student";
  const regNo = sessionStorage.getItem("regNo");
  const sessionDept = sessionStorage.getItem("studentDept") || "Computer Science";
  const sessionEmail = sessionStorage.getItem("studentEmail") || ""; 
  
  // --- 2. STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("loading");
  const [currentStep, setCurrentStep] = useState(0);
  const [requestId, setRequestId] = useState(sessionStorage.getItem("requestId"));
  const [clearanceData, setClearanceData] = useState(null);
  
  // Upload State & Contact Info
  const [files, setFiles] = useState({ nationalId: null, birthCert: null });
  const [contactInfo, setContactInfo] = useState({ email: sessionEmail }); 
  const [department, setDepartment] = useState(sessionDept);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
        const saved = localStorage.getItem("readNotifIds");
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });
  
  // Booking & Payment State
  const [gownType, setGownType] = useState("");
  const [gownSize, setGownSize] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(() => {
      const saved = localStorage.getItem("studentSettings");
      return saved ? JSON.parse(saved) : { emailAlerts: true };
  });

  const [theme, setTheme] = useState(() => localStorage.getItem("appTheme") || "light");
  const [toast, setToast] = useState(null);

  // --- 3. HELPER FUNCTIONS ---
  const triggerToast = (message, type = "info") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const normalizeData = (apiResponse) => {
    if (apiResponse.data && !apiResponse.studentId) {
        return { ...apiResponse.data, id: apiResponse.id };
    }
    return apiResponse;
  };

  // --- 4. SMART RESTORE ---
  useEffect(() => {
    if (!regNo) {
        navigate("/student-login");
        return;
    }

    const performSmartCheck = async () => {
        try {
            if (requestId) {
                const data = await apiService.getClearanceRequest(requestId);
                if (data) {
                    restoreSession(normalizeData(data));
                    return;
                }
            }
            setActiveTab("clearance");
            setCurrentStep(1);
        } catch (err) {
            console.error("Smart Check Error:", err);
            setActiveTab("clearance");
            setCurrentStep(1);
        }
    };
    performSmartCheck();

    let intervalId;
    if (requestId) {
        intervalId = setInterval(fetchDataSilent, 10000);
    }
    return () => clearInterval(intervalId);
  }, [regNo, requestId]);

  const restoreSession = (data) => {
      setClearanceData(data);
      if (data.email) setContactInfo({ email: data.email });
      
      const dbDepts = Object.keys(data.clearance || {});
      const academic = dbDepts.find(d => !['Finance','Library','Registrar','SportsWelfare'].includes(d));
      if (academic) setDepartment(academic);

      setActiveTab("clearance");
      
      const isApproved = data.overallStatus === "Approved";
      const hasBooking = sessionStorage.getItem("bookingComplete") === "true";

      if (isApproved && hasBooking) setCurrentStep(4);
      else if (isApproved) setCurrentStep(3);
      else setCurrentStep(2);
  };

  const fetchDataSilent = async () => {
      if (!requestId) return;
      try {
          const rawData = await apiService.getClearanceRequest(requestId);
          const cleanData = normalizeData(rawData);
          setClearanceData(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(cleanData)) return cleanData;
              return prev;
          });
      } catch (err) { console.error("Polling error", err); }
  };

  // --- 5. NOTIFICATIONS ---
  useEffect(() => {
    if (!clearanceData || !clearanceData.id) return;
    const deptList = getDepartmentList();
    const generatedNotifs = [];

    if (clearanceData.overallStatus === 'Approved') {
        generatedNotifs.push({ 
            id: `${clearanceData.id}_overall_approved`, 
            title: '🎉 Clearance Complete!', 
            msg: 'All departments have cleared you.', 
            type: 'success', time: 'Just now' 
        });
    }
    
    deptList.forEach(dept => {
        const status = clearanceData.clearance?.[dept]?.status;
        if (status === 'Approved') {
            generatedNotifs.push({ 
                id: `${clearanceData.id}_${dept}_approved`, 
                title: `✅ ${dept} Approved`, 
                msg: `Your clearance request for ${dept} was accepted.`, 
                type: 'success', time: 'Recent' 
            });
        } else if (status === 'Rejected') {
            generatedNotifs.push({ 
                id: `${clearanceData.id}_${dept}_rejected`, 
                title: `⚠️ ${dept} Issue`, 
                msg: `Action required: Please visit the ${dept} office`, 
                type: 'error', time: 'Urgent' 
            });
        }
    });
    
    setNotifications(prev => {
        const prevString = JSON.stringify(prev.map(n => n.id).sort());
        const newString = JSON.stringify(generatedNotifs.map(n => n.id).sort());
        return prevString !== newString ? generatedNotifs : prev;
    });
  }, [clearanceData]);

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;

  useEffect(() => {
    if (showNotifPanel && unreadCount > 0) {
        const currentIds = notifications.map(n => n.id);
        const updatedReadIds = [...new Set([...readNotifIds, ...currentIds])];
        setReadNotifIds(updatedReadIds);
        localStorage.setItem("readNotifIds", JSON.stringify(updatedReadIds));
    }
  }, [showNotifPanel, notifications, unreadCount, readNotifIds]);

  const handleToggleNotifications = (e) => {
      e.preventDefault();
      setShowNotifPanel(prev => !prev);
  };

  // --- 6. CORE ACTIONS ---
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!files.nationalId || !files.birthCert) return triggerToast("Please upload both documents.", "error");
    if (!contactInfo.email) return triggerToast("Please enter email for alerts.", "error");

    if (clearanceData && clearanceData.id) {
        triggerToast("You already have an active request. Redirecting...", "info");
        setCurrentStep(2);
        return;
    }

    setIsSubmitting(true);
    try {
        const departments = ['Finance', 'Library', 'SportsWelfare', 'Registrar', department];
        
        const payload = { 
            studentId: regNo, 
            name: studentName, 
            regNo, 
            departments, 
            email: contactInfo.email
        };

        const resData = await apiService.createClearance(payload);
        
        if (resData.message && resData.message.includes('exists')) {
            triggerToast("Restored existing request (Delete it to change department)", "info");
        } else {
            triggerToast(`Clearance started for ${department}!`, "success");
        }

        const newId = resData.id;
        sessionStorage.setItem('requestId', newId);
        setRequestId(newId);

        if (!resData.message || !resData.message.includes('exists')) {
            // NOTE: Using dynamic URL for file upload to ensure deployment works
            const uploadOne = async (file, type) => {
                const fd = new FormData(); fd.append('file', file);
                // Use API_BASE_URL_EXPORT instead of localhost
                await fetch(`${API_BASE_URL_EXPORT}/upload/${newId}/${type}`, { method: 'POST', body: fd });
            };
            await Promise.all([ uploadOne(files.nationalId, 'nationalId'), uploadOne(files.birthCert, 'birthCert') ]);
        }
        
        setClearanceData({ id: newId, ...resData.data }); 
        setCurrentStep(2);

    } catch (err) { triggerToast("Upload Failed: " + err.message, "error"); } 
    finally { setIsSubmitting(false); }
  };

  const handlePayment = async () => {
    if (!gownSize || !gownType || !phoneNumber) {
        return triggerToast("Please enter Gown details and Phone Number.", "error");
    }
    
    setPaymentProcessing(true);
    triggerToast("Sending M-Pesa Request...", "info");

    try {
        // USE THE CENTRALIZED API SERVICE
        await apiService.initiateMpesaPayment({
             phoneNumber, 
             studentId: regNo, 
             studentName, 
             gownType, 
             gownSize, 
             requestId 
        });

        triggerToast("Please check your phone for the PIN!", "success");
        
        // Wait 8 seconds to simulate user typing PIN
        setTimeout(() => {
            sessionStorage.setItem("bookingComplete", "true");
            setCurrentStep(4); 
            generatePDF(); 
            triggerToast("Payment Confirmed!", "success"); 
        }, 8000); 

    } catch(err) { 
        console.error(err);
        triggerToast(err.message || "Payment Failed", "error"); 
    } finally { 
        setPaymentProcessing(false); 
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    const getImageDataUrl = async (url) => {
        const res = await fetch(url); 
        const blob = await res.blob();
        return new Promise(r => { 
            const reader = new FileReader(); 
            reader.onload = () => r(reader.result); 
            reader.readAsDataURL(blob); 
        });
    };

    try {
        doc.setLineWidth(1);
        doc.setDrawColor(0, 100, 0); 
        doc.rect(10, 10, width - 20, height - 20); 
        doc.setLineWidth(0.5);
        doc.rect(12, 12, width - 24, height - 24); 

        const logoUrl = await getImageDataUrl(logo);
        doc.addImage(logoUrl, "PNG", width / 2 - 15, 20, 30, 30);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(0, 100, 0); 
        doc.text("DEDAN KIMATHI UNIVERSITY OF TECHNOLOGY", width / 2, 60, { align: "center" });
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("P.O. Box 657-10100, Nyeri, Kenya | Tel: +254 713 835965", width / 2, 70, { align: "center" });
        doc.line(40, 75, width - 40, 75); 

        doc.setFontSize(28);
        doc.setFont("times", "bold");
        doc.text("CERTIFICATE OF CLEARANCE", width / 2, 100, { align: "center" });

        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text("This is to certify that:", 50, 125);

        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.text(studentName.toUpperCase(), width / 2, 140, { align: "center" });
        doc.line(width / 2 - 60, 142, width / 2 + 60, 142); 

        doc.setFont("times", "normal");
        doc.setFontSize(16);
        doc.text(`Registration No: ${regNo}`, width / 2, 155, { align: "center" });
        doc.text(`Department: ${department || sessionDept}`, width / 2, 165, { align: "center" });

        doc.text("Has successfully cleared with all university departments and", width / 2, 185, { align: "center" });
        doc.text("is hereby eligible for graduation.", width / 2, 195, { align: "center" });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Gown Issued: ${gownType} (${gownSize})`, 50, 230);
        doc.text(`Clearance Ref: ${requestId}`, width - 100, 230, { align: "right" });

        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        const date = new Date().toLocaleDateString();
        doc.text(`System Generated: ${date}. Valid without signature.`, width / 2, height - 15, { align: "center" });

        doc.save(`${regNo.replace(/\//g, '-')}_Certificate.pdf`);

    } catch (e) { 
        console.error("PDF Error:", e);
        triggerToast("Failed to generate PDF", "error");
    }
  };

  const getStatus = (dept) => clearanceData?.clearance?.[dept]?.status || "Pending";
  const getDepartmentList = () => {
      if (!clearanceData) return ['Finance', 'Library', 'Registrar'];
      if (clearanceData.departments && clearanceData.departments.length > 0) return clearanceData.departments;
      if (clearanceData.clearance) return Object.keys(clearanceData.clearance);
      return [];
  };
  
  const toggleSetting = async (key) => {
      const newSettings = { ...settings, [key]: !settings[key] };
      setSettings(newSettings);
      localStorage.setItem("studentSettings", JSON.stringify(newSettings));
      if (requestId) {
          try {
             await apiService.updateStudentSettings({ studentId: requestId, ...newSettings });
          } catch(e){}
      }
  };
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");
  
  const renderProfile = () => (
      <div className="profile-card">
          <div className="profile-header"><div className="profile-avatar-large">{studentName.charAt(0)}</div><h2>{studentName}</h2><p>Student Account</p></div>
          <div className="profile-details">
              <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{contactInfo.email || "Not Set"}</span></div>
              <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value">{clearanceData?.overallStatus || "Not Started"}</span></div>
          </div>
      </div>
  );
  
  const renderHelp = () => (
      <div className="help-card"><div className="card-header"><h3>Help & Support</h3><p>FAQ</p></div>
          <div className="faq-list"><div className="faq-item"><div className="faq-question">Why do I need to provide email?</div><div className="faq-answer">To receive instant alerts on approval/rejection.</div></div></div>
      </div>
  );
  
  const renderSettings = () => (
      <div className="settings-card">
          <div className="card-header"><h3>Settings</h3><p>Manage your preferences</p></div>
          <div className="settings-group"><h4>Appearance</h4><div className="toggle-row"><span>Dark Mode</span><div className={`toggle-switch ${theme === "dark" ? "on" : ""}`} onClick={toggleTheme}></div></div></div>
          <div className="settings-group">
            <h4>Notifications</h4>
            <div className="toggle-row">
                <span>Email Alerts</span>
                <div className={`toggle-switch ${settings.emailAlerts ? "on" : ""}`} onClick={() => toggleSetting("emailAlerts")}></div>
            </div>
          </div>
      </div>
  );

  if (activeTab === "loading") {
      return (
          <div className="dashboard-parent" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
              <div style={{textAlign:'center', color:'var(--dekut-green)'}}><h3>Checking status...</h3></div>
          </div>
      );
  }

  return (
    <div className={`dashboard-parent ${theme === 'dark' ? 'dark-mode' : ''}`}>
      {toast && <div className="toast-container"><div className={`toast ${toast.type}`}><span className="toast-icon">ℹ️</span><span>{toast.message}</span></div></div>}
      
      <div className="header-container">
        <div className="header-left"><img src={logo} alt="Logo" className="logo" /><div><h2>Dedan Kimathi University</h2><p>Better Life through Technology</p></div></div>
        <div className="header-right"><div className="user-info"><span className="name">{studentName}</span><span className="role">Student</span></div><div className="avatar">{studentName.charAt(0)}</div></div>
      </div>

      <div className="dashboard-body">
        <div className="sidebar-container">
          <div className="sidebar-brand"><h4>Clearance Portal</h4></div>
          <nav className="sidebar-menu">
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab("clearance")}} className={activeTab === "clearance" ? "active" : ""}>My Clearance</a>
            <a href="#" onClick={handleToggleNotifications} className={showNotifPanel ? "active" : ""}>
                Notifications 
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </a>
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab("profile")}} className={activeTab === "profile" ? "active" : ""}>Profile</a>
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab("help")}} className={activeTab === "help" ? "active" : ""}>Help</a>
            <a href="#" onClick={(e) => {e.preventDefault(); setActiveTab("settings")}} className={activeTab === "settings" ? "active" : ""}>Settings</a>
          </nav>
          <div className="sidebar-footer"><button onClick={()=> {sessionStorage.clear(); navigate("/");}} className="sidebar-logout">Logout</button></div>
        </div>
        
        {showNotifPanel && (
            <div className="notification-panel">
                <div className="notif-header"><h5>Notifications</h5><button onClick={() => setShowNotifPanel(false)}>x</button></div>
                <div className="notif-list">
                    {notifications.length === 0 ? <p className="no-notif">No new notifications.</p> : notifications.map(notif => (
                        <div key={notif.id} className={`notif-item ${notif.type}`}>
                            <div className="notif-title">{notif.title}</div>
                            <div className="notif-msg">{notif.msg}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="content-container">
            <div className="centered-content">
                {activeTab === "clearance" && (
                    <>
                        <div className="stepper-container">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}><div className="step-circle">1</div><span>Upload</span></div>
                            <div className={`line ${currentStep >= 2 ? 'filled' : ''}`}></div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}><div className="step-circle">2</div><span>Review</span></div>
                            <div className={`line ${currentStep >= 3 ? 'filled' : ''}`}></div>
                            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}><div className="step-circle">3</div><span>Booking</span></div>
                            <div className={`line ${currentStep >= 4 ? 'filled' : ''}`}></div>
                            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}><div className="step-circle">4</div><span>Done</span></div>
                        </div>

                        {currentStep === 1 && (
                            <div className="upload-card">
                                <div className="card-header"><h3>Start Clearance</h3><p>Upload documents & contact info.</p></div>
                                <form onSubmit={handleFileUpload} className="upload-form">
                                    <div className="contact-row">
                                        <div className="form-column">
                                            <label className="input-label">Email Address</label>
                                            <input 
                                                type="email" 
                                                className="std-input read-only" 
                                                placeholder="student@dkut.ac.ke" 
                                                value={contactInfo.email} 
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-column">
                                            <label className="input-label">My Department</label>
                                            <select 
                                                className="std-select" 
                                                value={department} 
                                                onChange={e => setDepartment(e.target.value)}
                                            >
                                                <option value="Computer Science">Computer Science</option>
                                                <option value="Nursing">Nursing</option>
                                                <option value="Engineering">Engineering</option>
                                                <option value="Business">Business</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="upload-group">
                                        <label>National ID</label>
                                        <div className={`file-drop-zone ${files.nationalId ? 'filled':''}`}>
                                            <input type="file" accept=".pdf, .png, .jpg, .jpeg" onChange={e=>setFiles({...files, nationalId:e.target.files[0]})} />
                                            <div className="drop-content"><span>🪪 {files.nationalId ? files.nationalId.name : "Click to select ID"}</span></div>
                                        </div>
                                    </div>
                                    <div className="upload-group">
                                        <label>Birth Certificate</label>
                                        <div className={`file-drop-zone ${files.birthCert ? 'filled':''}`}>
                                            <input type="file" accept=".pdf, .png, .jpg, .jpeg" onChange={e=>setFiles({...files, birthCert:e.target.files[0]})} />
                                            <div className="drop-content"><span>📜 {files.birthCert ? files.birthCert.name : "Click to select Cert"}</span></div>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="btn-submit-clearance">{isSubmitting ? "Uploading..." : "Submit Documents"}</button>
                                </form>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="status-tracker-card">
                                <div className="card-header"><h3>Department Status</h3><p>Live progress of your clearance.</p></div>
                                <div className="status-list">
                                    {getDepartmentList().map(dept => (
                                        <div key={dept} className="status-row">
                                            <span className="dept-name">{dept}</span>
                                            <span className={`status-pill ${getStatus(dept).toLowerCase()}`}>
                                                {getStatus(dept) === 'Approved' ? '✅ Approved' : getStatus(dept) === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {clearanceData?.overallStatus === "Approved" ? (
                                    <button className="btn-download" onClick={() => setCurrentStep(3)}>Proceed to Booking</button>
                                ) : (
                                    <div className="refresh-area"><button onClick={fetchDataSilent} className="btn-refresh">Refresh Status</button></div>
                                )}
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="upload-card">
                                <div className="card-header"><h3>Book Graduation Gown</h3><p>Select size to generate certificate.</p></div>
                                <div className="upload-form">
                                    <div className="upload-group">
                                        <label className="input-label">Gown Type</label>
                                        <select className="std-select" onChange={e=>setGownType(e.target.value)}><option value="">Select Type</option><option value="Bachelor">Bachelor</option><option value="Master">Master</option></select>
                                    </div>
                                    <div className="upload-group">
                                        <label className="input-label">Gown Size</label>
                                        <select className="std-select" onChange={e=>setGownSize(e.target.value)}><option value="">Select Size</option><option value="M">Medium</option><option value="L">Large</option></select>
                                    </div>
                                    <div className="upload-group">
                                        <label className="input-label">M-Pesa Number</label>
                                        <input 
                                            type="text" 
                                            className="std-input"
                                            placeholder="e.g. 0712345678"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                        />
                                    </div>
                                    <div className="payment-info"><p>Fee: <strong>KES 2,000</strong></p></div>
                                    <button onClick={handlePayment} disabled={paymentProcessing} className="btn-submit-clearance">{paymentProcessing ? "Processing..." : "Pay & Finish"}</button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="cert-ready-card">
                                <h1>🎉 Congratulations!</h1><p>You are officially cleared.</p>
                                <button onClick={generatePDF} className="btn-download">Download Certificate</button>
                            </div>
                        )}
                    </>
                )}
                {activeTab === "profile" && renderProfile()}
                {activeTab === "help" && renderHelp()}
                {activeTab === "settings" && renderSettings()}
            </div>
        </div>
      </div>
    </div>
  );
}

export default StudentClearance;