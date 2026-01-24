// 1. DYNAMIC URL CONFIGURATION
// If VITE_API_URL is set (in .env or Vercel), use it. Otherwise, default to localhost.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL}/api`;

// Export the base URL constant (Useful for file uploads or direct fetch calls)
export const API_BASE_URL_EXPORT = API_BASE_URL;

// 2. GENERIC REQUEST HELPER (Reduces duplication)
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
        console.error(`Network Error (${endpoint}):`, error);
        throw error; // Re-throw so components can show the error toast
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
    getAllRequests: () => request('/requests'), // For Admin Dashboard
    
    // --- DEPARTMENT ACTIONS ---
    updateDepartmentStatus: (requestId, departmentData) => 
        request(`/requests/${requestId}/department`, 'PUT', departmentData),

    // --- BOOKINGS & PAYMENTS ---
    // The "Fire and Forget" M-Pesa trigger
    initiateMpesaPayment: (paymentData) => request('/mpesa/pay', 'POST', paymentData),
    
    // Standard Booking (Fallback/Simulated)
    createGownBooking: (bookingData) => request('/bookings', 'POST', bookingData),

    // --- ADMIN SETTINGS & STAFF ---
    getSystemSettings: () => request('/settings'),
    updateSystemSettings: (settings) => request('/settings', 'POST', settings),
    getAllStaff: () => request('/staff'),
    
    // --- STUDENT PREFERENCES ---
    updateStudentSettings: (data) => request('/student/settings', 'POST', data),
};