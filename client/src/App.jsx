import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Loader } from './components/common/Loader';
import { RoleLayout } from './components/layout/RoleLayout';

// Public & Auth Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { MyAppointments } from './pages/patient/MyAppointments';
import { BookAppointmentPage } from './pages/patient/BookAppointmentPage';
import { MyMedicalRecords } from './pages/patient/MyMedicalRecords';
import { MyPrescriptions } from './pages/patient/MyPrescriptions';
import { MyLabReports } from './pages/patient/MyLabReports';
import { MyBills } from './pages/patient/MyBills';
import { PatientProfile } from './pages/patient/PatientProfile';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorAvailability } from './pages/doctor/DoctorAvailability';
import { DoctorProfile } from './pages/doctor/DoctorProfile';

// Receptionist Pages
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';
import { PatientRegistration } from './pages/receptionist/PatientRegistration';
import { FrontDeskAppointments } from './pages/receptionist/FrontDeskAppointments';
import { BillingManagement } from './pages/receptionist/BillingManagement';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorsManagement } from './pages/admin/DoctorsManagement';
import { PatientsManagement } from './pages/admin/PatientsManagement';
import { StaffManagement } from './pages/admin/StaffManagement';
import { DepartmentsManagement } from './pages/admin/DepartmentsManagement';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { MedicinesManagement } from './pages/admin/MedicinesManagement';
import { BillingOverview } from './pages/admin/BillingOverview';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loader fullScreen message="Authenticating session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Role-Based Route Guard
const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Loader fullScreen message="Verifying permissions..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to user's authorized home
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'doctor':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'receptionist':
        return <Navigate to="/receptionist/dashboard" replace />;
      default:
        return <Navigate to="/patient/dashboard" replace />;
    }
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<LoginPage />} />

            {/* Patient Portal Routes */}
            <Route
              path="/patient"
              element={
                <RoleRoute allowedRoles={['patient']}>
                  <RoleLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="book" element={<BookAppointmentPage />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="records" element={<MyMedicalRecords />} />
              <Route path="prescriptions" element={<MyPrescriptions />} />
              <Route path="lab-reports" element={<MyLabReports />} />
              <Route path="bills" element={<MyBills />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Doctor Portal Routes */}
            <Route
              path="/doctor"
              element={
                <RoleRoute allowedRoles={['doctor']}>
                  <RoleLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="records" element={<DoctorPatients />} />
              <Route path="prescriptions" element={<DoctorAppointments />} />
              <Route path="lab-reports" element={<DoctorPatients />} />
              <Route path="availability" element={<DoctorAvailability />} />
              <Route path="profile" element={<DoctorProfile />} />
            </Route>

            {/* Receptionist Portal Routes */}
            <Route
              path="/receptionist"
              element={
                <RoleRoute allowedRoles={['receptionist', 'admin']}>
                  <RoleLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="patients" element={<PatientRegistration />} />
              <Route path="appointments" element={<FrontDeskAppointments />} />
              <Route path="doctors" element={<DoctorsManagement />} />
              <Route path="billing" element={<BillingManagement />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <RoleLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="doctors" element={<DoctorsManagement />} />
              <Route path="patients" element={<PatientsManagement />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route path="departments" element={<DepartmentsManagement />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="medicines" element={<MedicinesManagement />} />
              <Route path="billing" element={<BillingOverview />} />
              <Route path="activity-logs" element={<ActivityLogsPage />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
