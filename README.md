# AuraHealth — Enterprise Hospital Management System (HMS)

A complete, production-ready, full-stack Hospital Management System (HMS) built with React 18, Vite, Node.js, Express.js, MongoDB/Mongoose, Socket.IO, and Tailwind CSS. 

AuraHealth provides a modern, accessible healthcare experience featuring Role-Based Access Control (RBAC) across four distinct roles: **Admin**, **Doctor**, **Receptionist**, and **Patient**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Security
- **Role-Based Access Control (RBAC)**: Distinct permissions for Admin, Doctor, Receptionist, and Patient.
- **Secure Authentication**: JWT-based authentication stored with expiration handling and automatic logout on invalidation.
- **Password Security**: Passwords hashed using `bcryptjs` with salt rounds.
- **Defensive API Layer**: Protected by `helmet`, strict `cors`, `express-rate-limit`, and centralized error normalization.

### 👤 2. Patient Module
- **Patient Dashboard**: Real-time summary of upcoming appointments, pending visits, recent electronic prescriptions, and outstanding bills.
- **Doctor Catalog & Search**: Filter doctors by clinical department, specialty, and consultation fee.
- **Appointment Booking**: Real-time doctor schedule slot generator that prevents double-booking.
- **Electronic Medical Records (EMR)**: Access past consultation diagnoses, treatment notes, and vital signs (Blood pressure, pulse, temperature, weight).
- **Digital Prescriptions**: Structured medication details (dosage, frequency, duration, instructions) with printable prescription view.
- **Diagnostic Reports**: Access and download laboratory and pathology reports.
- **Billing & Invoices**: Itemized medical invoices with printable view and online payment sandbox.

### 🩺 3. Doctor Module
- **Physician Dashboard**: Today's consultation queue with real-time status counters.
- **Queue Management**: 1-click Accept, Reject, Check-In, and Complete appointment workflow.
- **Clinical Consultations**: Issue digital prescriptions with dynamic multi-medication rows.
- **Patient Medical History**: Review prior diagnoses, treatments, and vitals before consultation.
- **Schedule & Availability Configuration**: Set working days, shift hours, break times, and slot duration.

### 💼 4. Receptionist Module
- **Front Desk Dashboard**: Monitor patient arrival queues, pending check-ins, and outstanding counter payments.
- **Walk-In Registration**: Register new patients with auto-generated patient IDs (`PAT-1001`).
- **Schedule Management**: Reschedule or cancel appointments on behalf of patients.
- **Counter Billing**: Create itemized bills with dynamic line items, taxes, discounts, and mark cash/card payments.

### 👑 5. Admin Module
- **Executive Analytics**: Interactive charts using **Recharts**:
  - Monthly revenue area chart
  - Monthly appointment volume bar chart
  - Patient distribution by clinical specialty pie chart
  - Appointment lifecycle distribution bar chart
- **Doctor Management**: Add new doctors, assign departments, configure consultation fees, and deactivate accounts.
- **Department Management**: Manage 10 default medical departments (Cardiology, Neurology, Orthopedics, Pediatrics, Dermatology, General Medicine, ENT, Gynecology, Dentistry, Ophthalmology) and add custom specialties.
- **Pharmacy & Medicine Inventory**: Track medicine stock quantities, dosages, and unit prices.
- **Financial Audit & Invoicing**: Comprehensive ledger of all hospital bills with status override capabilities.
- **System Activity Logs**: Audit trail tracking logins, registrations, prescriptions, bookings, and payments.

### 🔔 6. Real-Time Notifications & Email
- **In-App Notifications**: Real-time dropdown notification drawer powered by **Socket.IO**.
- **Email Notifications**: **Nodemailer** integration with automated fallback logger for development.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React, Recharts, Axios, React Hook Form |
| **Backend** | Node.js, Express.js, Mongoose, Socket.IO, Multer, Nodemailer, bcryptjs, jsonwebtoken, Helmet, CORS |
| **Database** | MongoDB / MongoDB Atlas (with automatic in-memory fallback for local zero-config dev) |
| **Testing** | Jest, Supertest |

---

## 📂 Project Structure

```
hospital-management-system/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/          # Button, Card, Modal, Badge, Loader, EmptyState, Table, Pagination, Toast
│   │   │   ├── layout/          # Sidebar, Topbar, PublicNavbar, PublicFooter, RoleLayout, NotificationDropdown
│   │   │   ├── appointments/    # BookingModal, RescheduleModal, SlotPicker
│   │   │   ├── prescriptions/   # PrintablePrescription, PrescriptionModal
│   │   │   ├── billing/         # PrintableInvoice, PaymentModal, CreateBillModal
│   │   │   └── charts/          # AnalyticsCharts (Recharts)
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── public/          # LandingPage
│   │   │   ├── auth/            # LoginPage, RegisterPage
│   │   │   ├── patient/         # PatientDashboard, BookAppointment, MyAppointments, EMR, Prescriptions, etc.
│   │   │   ├── doctor/          # DoctorDashboard, DoctorAppointments, DoctorPatients, Availability, Profile
│   │   │   ├── receptionist/    # ReceptionistDashboard, PatientRegistration, FrontDeskAppointments, Billing
│   │   │   └── admin/           # AdminDashboard, Doctors, Patients, Staff, Departments, Medicines, ActivityLogs
│   │   ├── services/            # api.js (Axios instance with JWT interceptors)
│   │   ├── App.jsx              # React Router with ProtectedRoute & RoleRoute
│   │   ├── index.css            # Tailwind & print utilities
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/
│   ├── config/                  # db.js, socket.js
│   ├── controllers/             # auth, doctor, patient, receptionist, appointment, prescription, bill, etc.
│   ├── middleware/              # authMiddleware, errorHandler, uploadMiddleware
│   ├── models/                  # User, Doctor, Patient, Appointment, Prescription, Bill, Medicine, etc.
│   ├── routes/                  # REST API route endpoints
│   ├── services/                # emailService, paymentService, slotGeneratorService, auditService
│   ├── utils/                   # seed.js, AppError.js, apiResponse.js
│   ├── tests/                   # Jest + Supertest test suite
│   ├── server.js                # Express & Socket.IO entry point
│   ├── package.json
│   └── .env.example
│
├── package.json                 # Root orchestration package.json
└── README.md
```

---

## 🔑 Demo Credentials

A seed script is provided that populates all 4 user roles, 10 medical departments, sample doctors, patients, appointments, medical records, prescriptions, and pharmacy inventory.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@hospital.com` | `Password@123` |
| **Doctor** | `doctor@hospital.com` | `Password@123` |
| **Receptionist** | `receptionist@hospital.com` | `Password@123` |
| **Patient** | `patient@hospital.com` | `Password@123` |

> *Tip: On the Login Page, convenient 1-click demo buttons are provided to instantly auto-fill credentials for each role.*

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **npm**: v9+

### 1. Clone or Open Workspace
```bash
cd "hospital-management-system"
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install-all
```

Or install individually:
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Environment Configuration
The backend includes a pre-configured development `.env`. To customize:

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String (Atlas or Local)
# If left empty, an in-memory MongoDB will be used automatically in development!
MONGODB_URI=

# JWT Configuration
JWT_SECRET=aura_health_super_secret_jwt_key_2026_production_ready
JWT_EXPIRES_IN=7d

# Nodemailer Configuration (Optional - logs to console if empty)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="AuraHealth Hospitals" <noreply@aurahealth.com>

# Payment Gateway (Optional - test sandbox active by default)
PAYMENT_KEY=
PAYMENT_SECRET=
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=/api
```

---

## 🌱 Seeding the Database

Populate default departments, physicians, demo patient records, appointments, prescriptions, and medicines:
```bash
npm run seed
# or: cd server && npm run seed
```

---

## 💻 Running the Application

To run both backend API server (port 5000) and frontend Vite application (port 5173) simultaneously:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Running Automated Tests

Run backend automated tests for registration, authentication, role authorization, doctor creation, appointment booking, double-booking rejection, and prescriptions:
```bash
npm test
# or: cd server && npm test
```

---

## 🏗️ Building for Production

Build the optimized client bundle:
```bash
npm run build
# or: cd client && npm run build
```

---

## 🌐 Deployment Instructions

### Deploying Frontend to Vercel
1. Set the root directory to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Add environment variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://aurahealth-api.onrender.com/api`)

### Deploying Backend to Render / Railway
1. Set root directory to `server`.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Environment variables to configure in Render/Railway dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by platform)
   - `MONGODB_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: A secure random secret string
   - `CLIENT_URL`: Your deployed Vercel frontend URL
   - `EMAIL_USER` & `EMAIL_PASSWORD`: (Optional SMTP credentials)

---

## 📚 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new patient
- `POST /api/auth/login` — Sign in (returns JWT token and role)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current authenticated user profile
- `PUT /api/auth/profile` — Update personal profile details
- `PUT /api/auth/change-password` — Change password

### Doctors (`/api/doctors`)
- `GET /api/doctors` — List doctors (filter by department, search)
- `GET /api/doctors/:id` — Doctor profile details
- `GET /api/doctors/:id/slots?date=YYYY-MM-DD` — Real-time availability slots
- `POST /api/doctors` — Create doctor (Admin only)
- `PUT /api/doctors/:id` — Update doctor profile / schedule
- `DELETE /api/doctors/:id` — Deactivate doctor (Admin only)

### Patients (`/api/patients`)
- `GET /api/patients` — List patients (Staff only)
- `GET /api/patients/:id` — Patient details
- `GET /api/patients/:id/history` — Complete clinical history
- `POST /api/patients` — Register patient (Receptionist / Admin)
- `PUT /api/patients/:id` — Update patient details
- `DELETE /api/patients/:id` — Deactivate patient (Admin only)

### Appointments (`/api/appointments`)
- `POST /api/appointments` — Book appointment (Double-booking protected)
- `GET /api/appointments` — List appointments with role-based filters
- `GET /api/appointments/:id` — Single appointment details
- `PUT /api/appointments/:id/status` — Update status (`Confirmed`, `Checked-In`, `Completed`, `Cancelled`, `Rejected`)
- `PUT /api/appointments/:id/reschedule` — Reschedule date & slot
- `DELETE /api/appointments/:id` — Cancel appointment

### Clinical Modules
- `GET /api/medical-records/:patientId` — Patient EMR history
- `POST /api/medical-records` — Create EMR record (Doctor only)
- `GET /api/prescriptions/:patientId` — Patient prescriptions
- `GET /api/prescriptions/single/:id` — Printable prescription view
- `POST /api/prescriptions` — Issue prescription (Doctor only)
- `POST /api/lab-reports` — Upload report file via Multer (Doctor/Staff)
- `GET /api/lab-reports/:patientId` — List patient diagnostic reports

### Billing & Pharmacy
- `GET /api/bills` — List bills with payment status filter
- `GET /api/bills/:id` — Printable invoice details
- `POST /api/bills` — Issue itemized bill (Staff/Admin)
- `PUT /api/bills/:id/payment` — Process settlement (Online sandbox / Counter)
- `GET /api/medicines` — Pharmacy inventory with stock tracking
- `POST /api/medicines` — Add medicine (Admin only)
- `PUT /api/medicines/:id` — Update stock / price (Admin only)

---

## 📄 License
This project is licensed under the MIT License.
