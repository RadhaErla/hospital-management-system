import React from 'react';
import { Activity, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-500 text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Aura<span className="text-brand-400">Health</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Enterprise Hospital Management System providing seamless care coordination,
              advanced clinical appointments, and digital electronic medical records.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Licensed Healthcare Facility</span>
              <span>•</span>
              <span>24/7 Trauma Care</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Clinical Departments
            </h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#departments" className="hover:text-white transition-colors">Cardiology & Vascular</a></li>
              <li><a href="#departments" className="hover:text-white transition-colors">Neurology & Spine</a></li>
              <li><a href="#departments" className="hover:text-white transition-colors">Orthopedics & Joint</a></li>
              <li><a href="#departments" className="hover:text-white transition-colors">Pediatrics & Neonatal</a></li>
              <li><a href="#departments" className="hover:text-white transition-colors">Dermatology Clinic</a></li>
            </ul>
          </div>

          {/* Col 3: Portal Access */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Portals & Services
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Patient Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Physician Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Front Desk Reception</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Administrative System</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">New Patient Registration</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Emergency & Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>100 Health Sciences Plaza, Medical District, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span>Emergency: +1 (800) 555-0199</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-400 flex-shrink-0" />
                <span>support@aurahealth.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} AuraHealth Hospital Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
