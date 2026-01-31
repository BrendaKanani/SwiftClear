import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DepartmentDashboard.css"; 
import logo from "../../assets/DeKUT-Online-Clearance-Portal.png";
import { apiService } from "../../services/api";

const StatCard = ({ label, value, icon, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
    <div className="stat-icon">{icon}</div>
  </div>
);

function DepartmentDashboard() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });
  
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { deptName } = useParams();
  const staffName = sessionStorage.getItem("staffName");

  const GENERAL_DEPTS = ["Finance", "Library", "Registrar", "SportsWelfare", "Dean", "Exams"];

  useEffect(() => {
    if (!staffName) navigate("/staff-login");
  }, [staffName, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  // FETCH DATA & FILTER
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getAllRequests();
        const allData = Array.isArray(data) ? data : (data.data || []);
        
        setStudents(allData);

        let visibleStudents = [];
        const isGeneralDept = 
            deptName === "Admin" || 
            deptName === "Registrar" || 
            GENERAL_DEPTS.some(d => d.toLowerCase() === deptName.toLowerCase());

        if (isGeneralDept) {
          visibleStudents = allData;
        } else {
          visibleStudents = allData.filter(student => {
            const requiredDepts = student.departments || Object.keys(student.clearance || {});
            return requiredDepts.some(d => d.toLowerCase() === deptName.toLowerCase());
          });
        }

        setFilteredStudents(visibleStudents);

        const myPending = visibleStudents.filter(s => getStatus(s) === 'Pending').length;
        const myApproved = visibleStudents.filter(s => getStatus(s) === 'Approved').length;

        setStats({ total: visibleStudents.length, pending: myPending, approved: myApproved });

      } catch (err) { 
        console.error("Fetch Error:", err); 
      }
    };
    fetchData();
  }, [deptName]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    const currentDeptData = student.clearance?.[deptName] || {};
    setRemarks(currentDeptData.remarks || "");
  };

  const handleDecision = async (decision) => {
    if (!selectedStudent) return;
    try {
      await apiService.updateDepartmentStatus(selectedStudent.id, {
        department: deptName,
        status: decision,
        remarks: remarks,
        staffName: staffName
      });

      alert(`Student ${decision} successfully!`);
      window.location.reload();
      
    } catch (error) { 
        console.error(error); 
        alert("Server Error: " + error.message); 
    }
  };

  const getStatus = (student) => {
    if (deptName === 'Admin') return student.overallStatus || "Pending";
    return student.clearance?.[deptName]?.status || "Pending";
  };

  const getTabContent = () => {
    if (activeTab === "dashboard") return filteredStudents; 
    if (activeTab === "requests") return filteredStudents.filter(s => getStatus(s) === "Pending"); 
    if (activeTab === "history") return filteredStudents.filter(s => getStatus(s) !== "Pending"); 
    return []; 
  };

  const getTableTitle = () => {
      if (activeTab === "dashboard") return "Overview - All Students";
      if (activeTab === "requests") return "Pending Action";
      if (activeTab === "history") return "Clearance History";
      return "";
  };

  const currentList = getTabContent();

  // RENDERERS 
  const renderTable = (list) => (
      <div className="table-section">
        <div className="section-header"><h3>{getTableTitle()}</h3></div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th><th>Reg No</th><th>Status</th><th>Overall</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.length > 0 ? list.map((student) => {
              const status = getStatus(student);
              return (
                <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.regNo}</td>
                    <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
                    <td>{student.overallStatus || 'Pending'}</td>
                    <td>
                        <button className="view-btn" onClick={() => handleViewDetails(student)}>
                            {status === 'Pending' ? "Review" : "Details"}
                        </button>
                    </td>
                </tr>
              );
            }) : <tr><td colSpan="5" className="empty-state">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
  );

  const renderProfile = () => (
      <div className="profile-view-card">
          <div className="profile-header-large">
              <div className="avatar-xl">{staffName?.charAt(0)}</div>
              <h2>{staffName}</h2>
              <span className="role-badge">{deptName} Department</span>
          </div>
          <div className="profile-stats-row">
             <div className="p-stat"><strong>{stats.total}</strong> <span>Total Processed</span></div>
             <div className="p-stat"><strong>{stats.approved}</strong> <span>Cleared</span></div>
          </div>
          <div className="profile-info-grid">
              <div className="info-group"><label>Email</label><p>{sessionStorage.getItem("email") || "Not available"}</p></div>
              <div className="info-group"><label>Role</label><p>Staff / Admin</p></div>
              <div className="info-group"><label>Department</label><p>{deptName}</p></div>
          </div>
      </div>
  );

  return (
    <div className="dashboard-parent">
      <div className="header-container">
        <div className="header-left">
          {/* HAMBURGER BUTTON (Mobile Only) */}
          <button 
             className="hamburger-btn" 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
             ☰
          </button>

          <img src={logo} alt="Logo" className="logo" />
          <div className="uni-info-text">
            <h2>Dedan Kimathi University</h2>
            <p>Better Life through Technology</p>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info"><span className="name">{staffName}</span><span className="role">{deptName} Dept</span></div>
          <div className="avatar">{staffName?.charAt(0)}</div>
        </div>
      </div>

      <div className="dashboard-body">
        
        {/* SIDEBAR (With Mobile Slide Class) */}
        <div className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Close Button for Mobile */}
          <button className="close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>×</button>

          <div className="sidebar-brand"><h4>Staff Portal</h4></div>
          <nav className="sidebar-menu">
            <button 
                className={`menu-btn ${activeTab === 'dashboard' ? 'active' : ''}`} 
                onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}}
            >
                Dashboard
            </button>
            <button 
                className={`menu-btn ${activeTab === 'requests' ? 'active' : ''}`} 
                onClick={() => {setActiveTab('requests'); setIsMobileMenuOpen(false);}}
            >
                Requests {stats.pending > 0 && <span className="badge-yellow">{stats.pending}</span>}
            </button>
            <button 
                className={`menu-btn ${activeTab === 'history' ? 'active' : ''}`} 
                onClick={() => {setActiveTab('history'); setIsMobileMenuOpen(false);}}
            >
                History
            </button>
            <button 
                className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => {setActiveTab('profile'); setIsMobileMenuOpen(false);}}
            >
                Profile
            </button>
          </nav>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="sidebar-logout">Logout</button>
          </div>
        </div>

        {/* OVERLAY for Mobile */}
        {isMobileMenuOpen && (
          <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <div className="content-container">
          {activeTab !== 'profile' && (
              <div className="stats-grid">
                <StatCard label="Total Students" value={stats.total} icon="🎓" colorClass="card-blue" />
                <StatCard label="Pending Action" value={stats.pending} icon="⏳" colorClass="card-yellow" />
                <StatCard label="Fully Cleared" value={stats.approved} icon="✅" colorClass="card-green" />
              </div>
          )}

          {activeTab !== 'profile' && renderTable(currentList)}
          
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>
      
      {selectedStudent && (
        <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header"><h3>Review Student</h3><button onClick={()=>setSelectedStudent(null)}>x</button></div>
             <div className="modal-body">
                <div className="student-summary">
                    <h4>{selectedStudent.name}</h4>
                    <p>{selectedStudent.regNo}</p>
                </div>
                
                <div className="remarks-section">
                    <h5>Remarks</h5>
                    <textarea value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Enter reason for rejection or notes..." />
                </div>
             </div>
             <div className="modal-footer">
                <button className="btn-approve" onClick={() => handleDecision("Approved")}>Approve</button>
                <button className="btn-reject" onClick={() => handleDecision("Rejected")}>Reject</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentDashboard;