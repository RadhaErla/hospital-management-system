import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  User,
  LogOut,
  ChevronDown,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Badge } from '../common/Badge';

export const Topbar = ({
  onOpenSidebar,
  pageTitle = 'Dashboard',
  breadcrumbs = [],
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/profile';
      case 'doctor':
        return '/doctor/profile';
      case 'receptionist':
        return '/receptionist/profile';
      default:
        return '/patient/profile';
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route search based on role
    if (user?.role === 'admin') {
      navigate(`/admin/patients?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'doctor') {
      navigate(`/doctor/patients?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'receptionist') {
      navigate(`/receptionist/patients?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/patient/book?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu Toggle & Title / Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {pageTitle}
          </h1>
          {breadcrumbs.length > 0 && (
            <nav className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span>/</span>}
                  <Link
                    to={crumb.path}
                    className="hover:text-brand-600 transition-colors truncate max-w-[120px]"
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients, doctors, records..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-slate-400 transition-all"
          />
        </form>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Real-time Notifications Bell with Badge & Dropdown */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-xs overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                {user?.name}
              </p>
              <span className="text-[10px] text-slate-500 capitalize font-medium">
                {user?.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-dropdown border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Info */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
                <div className="mt-2">
                  <Badge size="sm" className="capitalize">
                    {user?.role} Account
                  </Badge>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="p-2 text-xs text-slate-700 space-y-0.5">
                <Link
                  to={getProfileLink()}
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile & Settings</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Hospital Public Site</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
