import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  Building2,
  Calendar,
  Pill,
  Receipt,
  FileText,
  Clock,
  LogOut,
  User,
  Activity,
  History,
  ClipboardList,
  FlaskConical,
  X,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'patient';

  const navItemsByRole = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
      { name: 'Patients', path: '/admin/patients', icon: Users },
      { name: 'Receptionists', path: '/admin/staff', icon: UserPlus },
      { name: 'Departments', path: '/admin/departments', icon: Building2 },
      { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
      { name: 'Medicines', path: '/admin/medicines', icon: Pill },
      { name: 'Billing & Invoices', path: '/admin/billing', icon: Receipt },
      { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
      { name: 'My Profile', path: '/admin/profile', icon: User },
    ],
    doctor: [
      { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
      { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
      { name: 'Patients', path: '/doctor/patients', icon: Users },
      { name: 'Medical Records', path: '/doctor/records', icon: ClipboardList },
      { name: 'Prescriptions', path: '/doctor/prescriptions', icon: FileText },
      { name: 'Lab Reports', path: '/doctor/lab-reports', icon: FlaskConical },
      { name: 'Availability', path: '/doctor/availability', icon: Clock },
      { name: 'My Profile', path: '/doctor/profile', icon: User },
    ],
    receptionist: [
      { name: 'Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
      { name: 'Patients', path: '/receptionist/patients', icon: Users },
      { name: 'Appointments', path: '/receptionist/appointments', icon: Calendar },
      { name: 'Doctors Directory', path: '/receptionist/doctors', icon: Stethoscope },
      { name: 'Billing & Payments', path: '/receptionist/billing', icon: Receipt },
      { name: 'My Profile', path: '/receptionist/profile', icon: User },
    ],
    patient: [
      { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
      { name: 'Find Doctor / Book', path: '/patient/book', icon: Stethoscope },
      { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
      { name: 'Medical Records', path: '/patient/records', icon: ClipboardList },
      { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText },
      { name: 'Lab Reports', path: '/patient/lab-reports', icon: FlaskConical },
      { name: 'Bills & Invoices', path: '/patient/bills', icon: CreditCard },
      { name: 'My Profile', path: '/patient/profile', icon: User },
    ],
  };

  const navItems = navItemsByRole[role] || navItemsByRole.patient;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-md shadow-brand-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">
                Aura<span className="text-brand-400">Health</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                {role} portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-700/40 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{user?.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/30">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
