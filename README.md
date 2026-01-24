# 🎓 SwiftClear – Online Clearance System

> **Dedan Kimathi University of Technology (DeKUT)**

SwiftClear is a comprehensive web-based platform designed to streamline the graduation clearance process. It digitizes the workflow between graduating students and university departments, replacing manual paperwork with an efficient, real-time dashboard system.

---

## 🚀 Key Features

### 👨‍🎓 For Students
* **Real-time Tracking:** Monitor clearance status across all departments (Finance, Library, etc.).
* **Document Upload:** Securely upload required clearance forms (PDF/Images).
* **Gown Booking:** Book graduation gowns and track payment status.
* **Notifications:** Receive automated email alerts on status changes.
* **PDF Generation:** Download the final approved clearance slip instantly.

### 🏛️ For Staff & Admin
* **Department Dashboard:** View and approve/reject student requests specific to your department.
* **Admin Control:** Manage system settings (Academic Year, Maintenance Mode).
* **Staff Management:** View and manage authorized system users.
* **Audit Logs:** Track who approved a student and when.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, CSS3 (Custom Dashboard Styling)
* **Backend:** Node.js, Express.js
* **Database:** Google Firestore (NoSQL)
* **Storage:** Firebase Cloud Storage (For documents & images)
* **Authentication:** Firebase Auth & Custom JWT (Staff)
* **Services:** Nodemailer (Email), jsPDF (PDF Generation)

---

## 📂 Project Structure

```bash
SwiftClear/
├── frontend/          # React Client Application
│   ├── src/
│   └── public/
├── backend/           # Node.js Express Server
│   ├── routes/        # API Endpoints (Requests, Uploads, Auth)
│   ├── serviceAccount.json  # Firebase Admin Credentials (Not committed)
│   └── server.js      # Entry point
└── README.md

🖥️ Setup & Installation Guide
Follow these steps to run the full stack application locally.

1. Prerequisites
Node.js (v16 or higher) installed.

A Firebase Project set up with Firestore Database and Storage enabled.

2. Backend Setup
The backend handles database logic, emails, and file uploads.

# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Configure Credentials (CRITICAL STEP)
# - Download your service account key from Firebase Console -> Project Settings -> Service Accounts.
# - Rename the file to 'serviceAccount.json'.
# - Place it inside the 'backend/' root folder.

# 4. Seed the Database (Run these once to set up test data)
node seed.js          # Creates Staff accounts (Finance, Library, etc.)
node seedStudents.js  # Creates Dummy Student accounts

# 5. Start the Server
npm start
# Server runs on http://localhost:5000

3. Frontend Setup
The user interface for Students and Staff.

# 1. Open a new terminal and navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Development Server
npm run dev
# App runs on http://localhost:5173

🔐 Default Login Credentials (For Testing)
Use these credentials to test the system after seeding the database.

Portal,User,Username / Email,Password
Student,Computer Science,C026-01-1234/2021,pass
Staff,Finance Dept,finance@dekut.ac.ke,pass
Staff,Library Dept,lib@dekut.ac.ke,pass
Admin,Registrar,registrar@dekut.ac.ke,pass

⚠️ Troubleshooting
"User not found" on Login:

Did you run node seed.js and node seedStudents.js inside the backend folder?

Check your serviceAccount.json is valid.

File Uploads Failing:

Ensure "Firebase Storage" is enabled in your Firebase Console.

Ensure your bucket rules allow writes (for development/testing).

Connection Refused:
Make sure the Backend is running on port 5000 and the Frontend on port 5173.

📜 License
This project is developed for academic purposes at Dedan Kimathi University of Technology.