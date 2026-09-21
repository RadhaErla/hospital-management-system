import React from 'react';
import { Activity, Mail, Phone, MapPin, Heart, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand (Span 2 on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 text-white shadow-md shadow-brand-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Aura<span className="text-brand-400">Health</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              An enterprise-grade Hospital Information System delivering integrated appointment scheduling,
              patient health records (EMR), electronic prescriptions, and multi-department clinical care.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> HIPAA Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-brand-300">
                <Clock className="w-3.5 h-3.5" /> 24/7 Trauma Unit
              </span>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-brand-400 transition-colors">Home Overview</a></li>
              <li><a href="#services" className="hover:text-brand-400 transition-colors">Clinical Services</a></li>
              <li><a href="#doctors" className="hover:text-brand-400 transition-colors">Specialist Directory</a></li>
              <li><a href="#why-us" className="hover:text-brand-400 transition-colors">Why AuraHealth</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-400 transition-colors">How Booking Works</a></li>
              <li><a href="#contact" className="hover:text-brand-400 transition-colors">Contact Hospital</a></li>
            </ul>
          </div>

          {/* Col 3: Clinical Departments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Departments
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#departments" className="hover:text-brand-400 transition-colors">Cardiology & Heart Care</a></li>
              <li><a href="#departments" className="hover:text-brand-400 transition-colors">Neurology & Brain Sciences</a></li>
              <li><a href="#departments" className="hover:text-brand-400 transition-colors">Pediatrics & Child Health</a></li>
              <li><a href="#departments" className="hover:text-brand-400 transition-colors">Orthopedics & Joint Surgery</a></li>
              <li><a href="#departments" className="hover:text-brand-400 transition-colors">Dermatology & Skin Care</a></li>
              <li><a href="#departments" className="hover:text-brand-400 transition-colors">General Internal Medicine</a></li>
            </ul>
          </div>

          {/* Col 4: Emergency & Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Hospital Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  Patient Portal <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  Physician EMR <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  Front Desk Triage <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  Admin System <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-400 transition-colors font-medium">
                  Register as Patient
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Emergency Triage Bar */}
        <div className="mt-12 p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Emergency Trauma Center</p>
              <p className="text-sm font-bold text-white">+1 (800) 555-0199 • 24 Hours / 7 Days</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-brand-400" />
            <span>100 Health Sciences Plaza, Medical District, NY 10001</span>
          </div>
        </div>

        {/* Bottom copyright & legal */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AuraHealth Hospital Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Healthcare Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Patient Bill of Rights</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
