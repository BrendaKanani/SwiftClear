// 1. DYNAMIC URL CONFIGURATION
// Priority: 
// 1. .env file (VITE_API_URL) -> Great for localhost testing
// 2. Hardcoded Live URL -> Fallback for production
const LIVE_BACKEND_URL = "https://swiftclear.onrender.com"; 
const BASE_URL = import.meta.env.VITE_API_URL || LIVE_BACKEND_URL;
const API_BASE_URL = `${BASE_URL}/api`;

// Export the base URL (Useful for components that need it directly)
export const API_BASE_URL_EXPORT = API_BASE_URL;

console.log("🌐 API Connected to:", API_BASE_URL);

// 2. GENERIC REQUEST HELPER
const request = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    
    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        // Centralized Error Handling
        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.statusText}`);
        }
        return data;
    } catch (error) {
        console.error(`❌ Network Error (${endpoint}):`, error);
        throw error;
    }
};

// 3. THE SERVICE OBJECT
export const apiService = {
    // --- AUTHENTICATION ---
    loginStaff: (credentials) => request('/auth/staff-login', 'POST', credentials),
    loginStudent: (credentials) => request('/auth/student-login', 'POST', credentials),

    // --- CLEARANCE REQUESTS ---
    createClearance: (requestData) => request('/requests', 'POST', requestData),
    getClearanceRequest: (id) => request(`/requests/${id}`),
    getAllRequests: () => request('/requests'),
    
    // --- DEPARTMENT ACTIONS ---
    updateDepartmentStatus: (requestId, departmentData) => 
        request(`/requests/${requestId}/department`, 'PUT', departmentData),

    // --- BOOKINGS & PAYMENTS ---
    initiateMpesaPayment: (paymentData) => request('/mpesa/pay', 'POST', paymentData),
    createGownBooking: (bookingData) => request('/bookings', 'POST', bookingData),
    getBookingHistory: (studentId) => request(`/bookings?studentId=${studentId}`), 

    // --- FILE UPLOADS (New) ---
    // Step 1: Get the Permission Slip (Signed URL) from Backend
    getUploadUrl: (filename, contentType) => 
        request('/upload', 'POST', { filename, contentType }),

    // --- ADMIN SETTINGS & STAFF ---
    getSystemSettings: () => request('/settings'),
    updateSystemSettings: (settings) => request('/settings', 'POST', settings),
    getAllStaff: () => request('/staff'),
    
    // --- STUDENT PREFERENCES ---
    updateStudentSettings: (data) => request('/student/settings', 'POST', data),
};