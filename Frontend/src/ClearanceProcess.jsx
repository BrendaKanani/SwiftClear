import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./ClearanceProcess.css";
import logo from "./assets/DeKUT-Logo.png";

function ClearanceProcess() {
  const [progress, setProgress] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [gownSize, setGownSize] = useState("");
  const [gownType, setGownType] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'paid' | 'failed' | null
  const [step, setStep] = useState(1); // 1: review details, 2: payment, 3: certificate
  const [error, setError] = useState("");
  const [bookingSaved, setBookingSaved] = useState(false);

  const navigate = useNavigate();
  const studentName = localStorage.getItem("studentName") || "Student";
  const studentRegNo = localStorage.getItem("studentRegNo") || "REG/UNKNOWN";

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentRegNo");
    navigate("/");
  };

  const fetchProgress = () => {
    // Dummy data - replace with backend fetch later
    const dummyData = [
      { department: "Finance", status: "Approved", remarks: "No pending fees" },
      { department: "Library", status: "Approved", remarks: "All books returned" },
      { department: "Departmental Office", status: "Approved", remarks: "Cleared" },
      { department: "Exams", status: "Approved", remarks: "No missing papers" },
      { department: "Sports & Welfare", status: "Approved", remarks: "Good conduct" },
      { department: "Registrar", status: "Approved", remarks: "Signed off" },
    ];
    setProgress(dummyData);
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  useEffect(() => {
    const completed = progress.filter((p) => p.status === "Approved").length;
    const total = progress.length;
    setPercentage(total > 0 ? Math.round((completed / total) * 100) : 0);
  }, [progress]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved": return "status-approved";
      case "pending": return "status-pending";
      case "rejected": return "status-rejected";
      default: return "";
    }
  };

  const allApproved = progress.length > 0 && progress.every((p) => p.status === "Approved");

  // Open booking modal
  const openBooking = () => {
    setError("");
    setGownSize("");
    setGownType("");
    setPaymentStatus(null);
    setBookingSaved(false);
    setStep(1);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
  };

  const validateBooking = () => {
    if (!gownSize) {
      setError("Please select a gown size.");
      return false;
    }
    if (!gownType) {
      setError("Please select a gown type.");
      return false;
    }
    setError("");
    return true;
  };

  // Mock payment - replace with real payment integration (Stripe/PayPal) + backend verification
  const handlePayment = async () => {
    if (!validateBooking()) return;

    setPaymentProcessing(true);
    setError("");
    // Simulate contacting payment gateway
    setTimeout(async () => {
      // For demo we mark payment success
      const success = true;
      setPaymentProcessing(false);

      if (success) {
        setPaymentStatus("paid");
        setStep(3);
        // Save booking locally (replace with POST /api/gown-bookings)
        const booking = {
          id: Date.now(),
          studentName,
          regNo: studentRegNo,
          gownSize,
          gownType,
          amountPaid: 2000, // demo amount
          currency: "KES",
          status: "PAID",
          createdAt: new Date().toISOString(),
        };
        // Store bookings list
        const existing = JSON.parse(localStorage.getItem("gownBookings") || "[]");
        existing.push(booking);
        localStorage.setItem("gownBookings", JSON.stringify(existing));
        setBookingSaved(true);

        // Optionally generate/download certificate automatically after payment
        try {
          await generateCertificatePDF(booking);
        } catch (e) {
          console.error("PDF generation failed:", e);
        }
      } else {
        setPaymentStatus("failed");
        setError("Payment failed. Please try again.");
      }
    }, 1500);
  };

  // Generate PDF certificate using jsPDF, embedding logo
  const generateCertificatePDF = async (bookingData = null) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    // Load logo as data URL
    async function getImageDataUrl(url) {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }

    const logoDataUrl = await getImageDataUrl(logo);

    // Layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;

    // Add logo top-left
    const imgW = 120;
    const imgH = 120 * 0.4; // keep small
    doc.addImage(logoDataUrl, "PNG", margin, 30, imgW, imgH);

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Dedan Kimathi University of Technology", pageWidth / 2, 70, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Better Life through Technology", pageWidth / 2, 92, { align: "center" });

    // Certificate heading
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("CLEARANCE CERTIFICATE", pageWidth / 2, 150, { align: "center" });

    // Student info box
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const yStart = 190;
    const lineHeight = 20;

    doc.text(`Name: ${studentName}`, margin + 10, yStart);
    doc.text(`Registration No.: ${studentRegNo}`, margin + 10, yStart + lineHeight);
    doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, margin + 10, yStart + lineHeight * 2);
    if (bookingData) {
      doc.text(`Gown Type: ${bookingData.gownType}`, pageWidth - margin - 220, yStart);
      doc.text(`Gown Size: ${bookingData.gownSize}`, pageWidth - margin - 220, yStart + lineHeight);
      doc.text(`Payment: ${bookingData.amountPaid} ${bookingData.currency}`, pageWidth - margin - 220, yStart + lineHeight * 2);
    }

    // Paragraph
    doc.setFontSize(11);
    const paragraph = `This is to certify that the bearer named above has been granted clearance by all required departments at Dedan Kimathi University of Technology and is authorized to collect graduation regalia upon presentation of this certificate. This clearance certificate is valid until the graduation event date.`;
    doc.text(doc.splitTextToSize(paragraph, pageWidth - margin * 2), margin + 10, yStart + 80);

    // Signature area
    const sigY = yStart + 190;
    doc.setDrawColor(0);
    doc.setLineWidth(0.6);
    doc.line(pageWidth - margin - 260, sigY, pageWidth - margin - 10, sigY); // signature line
    doc.setFontSize(12);
    doc.text("Registrar, Dedan Kimathi University of Technology", pageWidth - margin - 135, sigY + 20, { align: "center" });

    // Motto bottom-left
    doc.setFontSize(10);
    doc.text("Better Life through Technology", margin + 10, doc.internal.pageSize.getHeight() - 30);

    // Save PDF
    doc.save(`DeKUT_Clearance_Certificate_${studentRegNo}.pdf`);
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
          <div className="student-avatar">{studentName.charAt(0).toUpperCase()}</div>
          <span className="student-name">{studentName}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="progress-container">
        <h1>Clearance Progress</h1>

        <div className="progress-summary">
          <p>Overall Progress: <strong>{percentage}%</strong></p>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${percentage}%` }} /></div>
          <button className="refresh-btn" onClick={fetchProgress}>Refresh Status</button>
        </div>

        <div className="table-wrapper">
          <table className="progress-table">
            <thead>
              <tr><th>Department</th><th>Status</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {progress.map((p, i) => (
                <tr key={i} className="fade-in-row">
                  <td>{p.department}</td>
                  <td className={getStatusClass(p.status)}>{p.status}</td>
                  <td>{p.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Booking / Generation Controls */}
        <div style={{ marginTop: 20 }}>
          {allApproved ? (
            <button className="generate-btn active" onClick={openBooking}>
              Book Gown & Generate Certificate
            </button>
          ) : (
            <button className="generate-btn disabled" disabled>
              Awaiting approvals...
            </button>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {bookingOpen && (
        <div className="modal-overlay" onClick={() => { if (!paymentProcessing) closeBooking(); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Gown Booking & Certificate</h3>

            {/* Stepper */}
            <div className="booking-steps">
              <div className={`step ${step === 1 ? "active" : ""}`}>1. Select Gown</div>
              <div className={`step ${step === 2 ? "active" : ""}`}>2. Payment</div>
              <div className={`step ${step === 3 ? "active" : ""}`}>3. Certificate</div>
            </div>

            {step === 1 && (
              <>
                <div className="modal-details">
                  <label>Gown Type</label>
                  <select value={gownType} onChange={(e) => setGownType(e.target.value)}>
                    <option value="">Select gown type</option>
                    <option value="Standard">Standard Gown</option>
                    <option value="Premium">Premium Gown (with hood)</option>
                    <option value="Photography">Photography Gown</option>
                  </select>

                  <label style={{ marginTop: 12 }}>Gown Size</label>
                  <select value={gownSize} onChange={(e) => setGownSize(e.target.value)}>
                    <option value="">Select size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>

                  {error && <div className="modal-error">{error}</div>}

                  <div className="modal-actions">
                    <button onClick={() => { if (validateBooking()) setStep(2); }} className="approve-btn">Continue to Payment</button>
                    <button onClick={closeBooking} className="close-btn">Cancel</button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="modal-details">
                  <p>Please complete payment to confirm your gown booking.</p>
                  <p><strong>Amount:</strong> KES 2000 (demo)</p>

                  {paymentStatus === "paid" && <div className="notification success">Payment successful!</div>}
                  {paymentStatus === "failed" && <div className="notification error">Payment failed. Try again.</div>}

                  <div style={{ marginTop: 12 }}>
                    <button disabled={paymentProcessing} onClick={handlePayment} className="approve-btn">
                      {paymentProcessing ? "Processing..." : "Pay Now (Mock)"}
                    </button>
                    <button disabled={paymentProcessing} onClick={() => setStep(1)} className="close-btn">Back</button>
                  </div>

                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="modal-details">
                  <p>Your booking is confirmed{bookingSaved ? " and saved." : "."}</p>
                  <p>You can download your clearance certificate below. Present the downloaded certificate when collecting your gown physically.</p>

                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    <button onClick={async () => {
                      // pull the latest booking (mock)
                      const bookings = JSON.parse(localStorage.getItem("gownBookings") || "[]");
                      const latest = bookings[bookings.length - 1] || null;
                      await generateCertificatePDF(latest);
                    }} className="approve-btn">Download Certificate (PDF)</button>

                    <button onClick={() => { setBookingOpen(false); }} className="close-btn">Close</button>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ClearanceProcess;
