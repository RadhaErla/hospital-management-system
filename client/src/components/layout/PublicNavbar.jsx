import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Calendar,
  LogOut,
  User,
  PhoneCall,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'doctor':
        return '/doctor/dashboard';
      case 'receptionist':
        return '/receptionist/dashboard';
      default:
        return '/patient/dashboard';
    }
  };

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'Find a Doctor', href: '#doctors' },
    { label: 'Why AuraHealth', href: '#why-us' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-slate-200/80 py-2.5'
          : 'bg-white/90 backdrop-blur-sm border-b border-slate-200/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                Aura<span className="text-brand-600">Health</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase font-bold text-slate-400">
                Hospital System
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-brand-600 transition-colors duration-150 relative py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Emergency Hotline Quick Badge */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
              <span className="font-semibold text-slate-700">24/7 Hotline:</span>
              <span className="font-bold text-slate-900">+1 (800) 555-0199</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-50 text-brand-800 transition-all text-xs font-semibold"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-xs font-bold text-slate-900 line-clamp-1">
                      {user?.name}
                    </span>
                    <span className="block text-[10px] text-brand-600 font-semibold uppercase tracking-wider">
                      {user?.role} Portal
                    </span>
                  </div>
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(getDashboardPath())}
                  icon={ShieldCheck}
                >
                  Dashboard
                </Button>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Calendar}
                  onClick={() => navigate('/login?redirect=/patient/book')}
                >
                  Book Appointment
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-dropdown">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <div className="flex items-center gap-1.5 text-xs text-brand-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Emergency: +1 (800) 555-0199
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-brand-50/50 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[10px] text-brand-600 font-semibold uppercase">{user?.role} Portal</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="text-xs text-rose-600 font-semibold hover:underline"
                  >
                    Logout
                  </button>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardPath());
                  }}
                  icon={ShieldCheck}
                >
                  Go to {user?.role} Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In to Portal
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login?redirect=/patient/book');
                  }}
                  icon={Calendar}
                >
                  Book an Appointment
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
