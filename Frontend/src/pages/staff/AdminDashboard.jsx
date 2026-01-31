import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css"; 
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import logo from "../../assets/DeKUT-Online-Clearance-Portal.png";
import { apiService } from "../../services/api"; 

const StatCard = ({ label, value, icon, colorClass, onClick }) => (
  <div className={`stat-card ${colorClass} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
    <div className="stat-content"><h3>{value}</h3><p>{label}</p></div>
    <div className="stat-icon">{icon}</div>
  </div>
);

function AdminDashboard() {
  const navigate = useNavigate();
  // State Variables
  const [activeTab, setActiveTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, cleared: 0, pending: 0 });
  const [deptStats, setDeptStats] = useState({}); 
  const [searchTerm, setSearchTerm] = useState("");

  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [remarks, setRemarks] = useState("");

  // User Management State
  const [systemUsers, setSystemUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // System Settings State
  const [sysConfig, setSysConfig] = useState({
      maintenanceMode: false,
      allowRegistration: true,
      academicYear: "2024/2025"
  });

  const adminName = sessionStorage.getItem("staffName") || "Admin";

  // INITIAL FETCH
  useEffect(() => {
    fetchDashboardData();
    fetchSettings(); 
  }, []);

  // SETTINGS MANAGEMENT 
  const fetchSettings = async () => {
      try {
          const data = await apiService.getSystemSettings();
          if (data) setSysConfig(data);
      } catch (err) { console.error("Error fetching settings:", err); }
  };

  const updateSetting = async (key, value) => {
      const newConfig = { ...sysConfig, [key]: value };
      setSysConfig(newConfig); // Optimistic Update
      
      try {
          await apiService.updateSystemSettings(newConfig);
      } catch (err) {
          console.error(err);
          alert("Failed to save setting.");
          fetchSettings();
      }
  };

  // DASHBOARD DATA (STUDENTS) 
  const fetchDashboardData = async () => {
    try {
      const data = await apiService.getAllRequests();
      
      const cleanData = Array.isArray(data) 
        ? data.map(item => item.data ? { ...item.data, id: item.id } : item)
        : [];

      setRequests(cleanData);
      setFilteredRequests(cleanData);

      // Calculate Stats
      const total = cleanData.length;
      const cleared = cleanData.filter(r => r.overallStatus === 'Approved').length;
      const pending = total - cleared;
      setStats({ total, cleared, pending });

      // Calculate Department Bottlenecks
      const dStats = {};
      cleanData.forEach(req => {
          if (req.clearance) {
              Object.keys(req.clearance).forEach(dept => {
                  if (!dStats[dept]) dStats[dept] = 0;
                  if (req.clearance[dept].status !== 'Approved') {
                      dStats[dept]++;
                  }
              });
          }
      });
      setDeptStats(dStats);

    } catch (err) { console.error("Error fetching requests:", err); }
  };

  // SYSTEM USERS (STAFF) 
  useEffect(() => {
      if (activeTab === "users") fetchSystemUsers();
  }, [activeTab]);

  const fetchSystemUsers = async () => {
      setUsersLoading(true);
      try {
          const data = await apiService.getAllStaff();
          setSystemUsers(data); 
      } catch (err) { console.error("Error fetching staff:", err); }
      finally { setUsersLoading(false); }
  };

  // SEARCH FILTER 
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    const filtered = requests.filter(r => 
        (r.name && r.name.toLowerCase().includes(lowerTerm)) || 
        (r.regNo && r.regNo.toLowerCase().includes(lowerTerm))
    );
    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const handleLogout = () => { sessionStorage.clear(); navigate("/"); };

  // APPROVAL ACTIONS
  const handleDecision = async (decision) => {
    if (!selectedStudent) return;
    try {
      await apiService.updateDepartmentStatus(selectedStudent.id, {
        department: "Registrar", // Admin acts as Registrar/SuperUser
        status: decision,
        remarks: remarks,
        staffName: adminName
      });

      alert(`Student ${decision} successfully!`);
      setSelectedStudent(null);
      fetchDashboardData(); // Refresh list
    } catch (error) { 
        console.error(error); 
        alert("Failed to update status: " + error.message); 
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'Approved') return <span className="icon-status success" title="Approved">✔</span>;
    if (status === 'Rejected') return <span className="icon-status error" title="Rejected">✖</span>;
    return <span className="icon-status pending" title="Pending">−</span>;
  };

  // RENDERERS 

  const renderUsers = () => (
      <div className="table-section">
          <div className="table-controls" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3>Existing System Staff</h3>
              <button onClick={fetchSystemUsers} className="view-btn" style={{background:'#666'}}>
                  {usersLoading ? "Loading..." : "🔄 Refresh List"}
              </button>
          </div>
          <table className="modern-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr></thead>
              <tbody>
                  {systemUsers.length > 0 ? systemUsers.map(user => (
                      <tr key={user.id || user.email}>
                          <td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.department}</td>
                          <td><span className="status-badge approved">Active</span></td>
                      </tr>
                  )) : (
                      <tr>
                          <td colSpan="5" className="empty-state">
                              No staff found. The database might be empty.<br/>
                              <small>Run <code>node seed.js</code> in your backend terminal.</small>
                          </td>
                      </tr>
                  )}
              </tbody>
          </table>
      </div>
  );

  const renderReports = () => (
      <div className="stats-grid">
          <StatCard label="Download CSV" value="Export Data" icon="📄" colorClass="card-blue" onClick={() => alert("Downloading CSV...")} />
          <StatCard label="Generate PDF" value="Summary Report" icon="📊" colorClass="card-green" onClick={() => alert("Generating PDF...")} />
      </div>
  );

  const renderSettings = () => (
      <div className="settings-container">
          <h3>System Configuration</h3>
          <p className="settings-subtitle">Changes here affect the entire student portal immediately.</p>
          <div className="settings-list">
              {/* MAINTENANCE MODE */}
              <div className={`setting-row ${sysConfig.maintenanceMode ? 'maintenance-active' : ''}`}>
                  <div className="setting-info">
                      <span className="setting-label">Maintenance Mode</span>
                      <span className="setting-desc">{sysConfig.maintenanceMode ? "System is OFFLINE for students" : "System is live"}</span>
                  </div>
                  <label className="switch">
                      <input type="checkbox" checked={sysConfig.maintenanceMode} onChange={(e) => updateSetting('maintenanceMode', e.target.checked)} />
                      <span className="slider round"></span>
                  </label>
              </div>

              <div className="setting-row">
                  <div className="setting-info">
                      <span className="setting-label">Allow New Requests</span>
                      <span className="setting-desc">Students can start new clearance process</span>
                  </div>
                  <label className="switch">
                      <input type="checkbox" checked={sysConfig.allowRegistration} onChange={(e) => updateSetting('allowRegistration', e.target.checked)} />
                      <span className="slider round"></span>
                  </label>
              </div>

              <div className="setting-row">
                  <span className="setting-label">Current Academic Year</span>
                  <select className="academic-select" value={sysConfig.academicYear} onChange={(e) => updateSetting('academicYear', e.target.value)}>
                      <option value="2023/2024">2023/2024</option>
                      <option value="2024/2025">2024/2025</option>
                      <option value="2025/2026">2025/2026</option>
                  </select>
              </div>
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
          <div className="user-info"><span className="name">{adminName}</span><span className="role">System Administrator</span></div>
          <div className="avatar">A</div>
        </div>
      </div>

      <div className="dashboard-body">
        
        {/* SIDEBAR */}
        <div className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Close Button for Mobile */}
          <button className="close-sidebar-btn" onClick={() => setIsMobileMenuOpen(false)}>×</button>

          <div className="sidebar-brand"><h4>Admin Portal</h4></div>
          <nav className="sidebar-menu">
            <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("dashboard"); setIsMobileMenuOpen(false);}} className={activeTab==="dashboard"?"active":""}>Dashboard</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("users"); setIsMobileMenuOpen(false);}} className={activeTab==="users"?"active":""}>System Users</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("reports"); setIsMobileMenuOpen(false);}} className={activeTab==="reports"?"active":""}>Reports</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); setActiveTab("settings"); setIsMobileMenuOpen(false);}} className={activeTab==="settings"?"active":""}>Settings</a>
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
          {activeTab === "dashboard" && (
              <>
                <div className="stats-grid">
                    <StatCard label="Total Students" value={stats.total} icon="🎓" colorClass="card-blue" />
                    <StatCard label="Fully Cleared" value={stats.cleared} icon="✅" colorClass="card-green" />
                    <StatCard label="Pending" value={stats.pending} icon="⏳" colorClass="card-yellow" />
                </div>
                <div className="section-header"><h3>Department Workload</h3></div>
                <div className="bottleneck-grid">
                    {Object.entries(deptStats).map(([dept, count]) => (
                        <div key={dept} className="bottleneck-card">
                            <div className="b-header"><span className="b-title">{dept}</span><span className={`b-badge ${count > 5 ? 'critical' : 'normal'}`}>{count} Pending</span></div>
                            <div className="b-progress"><div className="b-fill" style={{width: `${Math.min(count * 5, 100)}%`}}></div></div>
                        </div>
                    ))}
                </div>
                <div className="table-section">
                    <div className="table-controls">
                        <h3>All Requests</h3>
                        <input type="text" placeholder="Search Reg No..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input" />
                    </div>
                    <table className="modern-table">
                    <thead><tr><th>Name</th><th>Reg No</th><th title="Finance">Fin</th><th title="Library">Lib</th><th title="Registrar">Reg</th><th>Overall</th><th>Action</th></tr></thead>
                    <tbody>
                        {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                        <tr key={req.id}>
                            <td>{req.name}</td><td>{req.regNo}</td>
                            <td>{getStatusIcon(req.clearance?.Finance?.status)}</td>
                            <td>{getStatusIcon(req.clearance?.Library?.status)}</td>
                            <td>{getStatusIcon(req.clearance?.Registrar?.status)}</td>
                            <td><span className={`status-badge ${req.overallStatus?.toLowerCase()}`}>{req.overallStatus || 'Pending'}</span></td>
                            <td><button className="view-btn" onClick={() => { setSelectedStudent(req); setRemarks(req.clearance?.Registrar?.remarks || ""); }}>View</button></td>
                        </tr>
                        )) : <tr><td colSpan="9" className="empty-state">No records found</td></tr>}
                    </tbody>
                    </table>
                </div>
              </>
          )}
          {activeTab === "users" && renderUsers()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>

      {selectedStudent && (
        <div className="modal-overlay">
           <div className="modal">
             <div className="modal-header"><h3>Reviewing: {selectedStudent.name}</h3><button onClick={() => setSelectedStudent(null)}>x</button></div>
             <div className="modal-body">
                <p><strong>Reg No:</strong> {selectedStudent.regNo}</p>
                <div className="doc-list">
                    {selectedStudent.documents ? Object.entries(selectedStudent.documents).map(([key, fileData]) => (
                        <a key={key} href={fileData.url} target="_blank" rel="noreferrer" className="doc-card">📄 {key}</a>
                    )) : <p>No docs</p>}
                </div>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Approval notes..." />
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

export default AdminDashboard;