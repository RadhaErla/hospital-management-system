import React from 'react';
import { NavLink } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
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
      { name: 'Billing & Payments', path: '/admin/billing', icon: Receipt },
      { name: 'Activity Logs', path: '/admin/activity-logs', icon: History },
      { name: 'Profile & Settings', path: '/admin/profile', icon: User },
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
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white text-slate-800 flex flex-col border-r border-slate-200/80 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64 w-64'}`}
      >
        {/* Hospital Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-sm flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  Aura<span className="text-brand-600">Health</span>
                </span>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  {role} Portal
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Summary Card */}
        {!isCollapsed ? (
          <div className="p-4 mx-3 my-2 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate leading-tight">{user?.name}</h4>
              <p className="text-[11px] text-slate-500 capitalize truncate mt-0.5">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-b border-slate-100">
            <div
              className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs overflow-hidden"
              title={`${user?.name} (${user?.role})`}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-soft'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions: Collapse Toggle & Logout */}
        <div className="p-3 border-t border-slate-100 bg-white space-y-1">
          {/* Desktop Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center gap-3 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 mx-auto text-slate-400" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          )}

          {/* Sign Out Button */}
          <button
            onClick={logout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
