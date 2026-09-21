import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
  Users,
  Calendar,
  Stethoscope,
  Building2,
  Heart,
  Brain,
  Bone,
  Baby,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileText,
  CreditCard,
  Search,
  Star,
  RefreshCw,
  AlertCircle,
  Pill,
  ChevronRight,
  UserCheck,
  Ambulance,
  HeartPulse,
  PhoneCall,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { BookingModal } from '../../components/appointments/BookingModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Data states
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState(null);

  // Search & Filter states
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  // Contact form submission state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const fetchHospitalData = async () => {
    setLoadingDoctors(true);
    setDoctorError(null);
    try {
      const [deptRes, docRes] = await Promise.all([
        api.get('/departments'),
        api.get('/doctors?limit=50'),
      ]);

      if (deptRes.data.success) {
        setDepartments(deptRes.data.data || []);
      }
      if (docRes.data.success) {
        setDoctors(docRes.data.data.items || []);
      }
    } catch (err) {
      console.error('Landing page data fetch error:', err);
      setDoctorError('Unable to load doctors and departments at this time.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const handleBookClick = (doctor = null) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/patient/book');
    } else {
      setSelectedDoctorForBooking(doctor);
      setIsBookingOpen(true);
    }
  };

  // Filtered doctors list
  const filteredDoctors = doctors.filter((doc) => {
    const matchesDept =
      selectedDeptFilter === 'all' ||
      doc.department?._id === selectedDeptFilter ||
      doc.department?.name?.toLowerCase() === selectedDeptFilter.toLowerCase();

    const matchesSearch =
      searchQuery.trim() === '' ||
      doc.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  const departmentIcons = {
    Heart: Heart,
    Brain: Brain,
    Bone: Bone,
    Baby: Baby,
    Sparkles: Sparkles,
    Stethoscope: Stethoscope,
    Activity: Activity,
  };

  const services = [
    {
      id: 'appointments',
      title: 'Online Doctor Appointments',
      description:
        'Search verified medical specialists, inspect available time slots, and schedule consultations with immediate instant confirmation.',
      icon: Calendar,
      accent: 'from-teal-500 to-emerald-600',
      tag: 'Zero Wait Time',
    },
    {
      id: 'consultation',
      title: 'Specialist Consultation',
      description:
        'Comprehensive clinical examinations across Cardiology, Neurology, Pediatrics, Orthopedics, and General Medicine.',
      icon: Stethoscope,
      accent: 'from-brand-500 to-teal-600',
      tag: 'Board Certified',
    },
    {
      id: 'emr',
      title: 'Electronic Medical Records',
      description:
        'Secure, encrypted centralized storage for diagnostic reports, clinical summaries, vitals history, and physician notes.',
      icon: FileText,
      accent: 'from-blue-500 to-indigo-600',
      tag: 'HIPAA Compliant',
    },
    {
      id: 'prescriptions',
      title: 'Digital Prescriptions',
      description:
        'Receive standardized, itemized digital prescriptions with clear dosage timings, pharmacy dispatch notes, and refill reminders.',
      icon: Pill,
      accent: 'from-purple-500 to-brand-600',
      tag: 'Instant Access',
    },
    {
      id: 'patient-management',
      title: 'Patient Portal Management',
      description:
        'Manage appointment history, track consultation invoices, view laboratory diagnostics, and update family health profiles.',
      icon: Users,
      accent: 'from-emerald-500 to-teal-600',
      tag: 'Self-Service',
    },
    {
      id: 'emergency',
      title: '24/7 Emergency Care',
      description:
        'Round-the-clock emergency medical triage, front-desk trauma response, ambulance dispatch, and rapid critical care.',
      icon: Ambulance,
      accent: 'from-rose-500 to-red-600',
      tag: '24/7 Hotline',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Create or Sign In',
      description: 'Quickly set up your secure patient profile or sign into your AuraHealth account in seconds.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Select Doctor or Specialty',
      description: 'Explore board-certified physicians, read verified credentials, and compare clinical specialties.',
      icon: Search,
    },
    {
      step: '03',
      title: 'Pick Date & Real-Time Slot',
      description: 'Choose your preferred visit date and available 30-minute consultation slot with zero double-booking.',
      icon: Calendar,
    },
    {
      step: '04',
      title: 'Confirmed Appointment & Care',
      description: 'Receive instant confirmation, automated reminders, and digital consultation details ready on your portal.',
      icon: CheckCircle2,
    },
  ];

  const testimonials = [
    {
      quote:
        'Booking with Dr. Robert Chen took less than two minutes. When I arrived, the clinic already had my digital health history loaded. Seamless and professional experience!',
      author: 'Marcus Vance',
      role: 'Verified Patient',
      department: 'Neurology Clinic',
      rating: 5,
    },
    {
      quote:
        'The ability to access digital prescriptions and review previous visit reports on my phone gives my family total peace of mind. Truly a modern hospital system.',
      author: 'Eleanor Davis',
      role: 'Verified Patient',
      department: 'Pediatrics Care',
      rating: 5,
    },
    {
      quote:
        'Dr. Sarah Jenkins and the cardiology team provided extraordinary care. The scheduling was completely transparent with clear consultation fees.',
      author: 'David Rodriguez',
      role: 'Verified Patient',
      department: 'Cardiology & Heart Care',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <PublicNavbar />

      {/* ========================================================
          1. HERO SECTION WITH 3D HEALTHCARE VISUAL
      ======================================================== */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-brand-50/40 via-white to-slate-50 border-b border-slate-200/80">
        {/* Decorative background glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold tracking-wide shadow-soft">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Modern Healthcare & Certified Clinical Management</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Your Health, <br />
                <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Our Priority
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Easily find experienced doctors, book appointments in real time, manage comprehensive
                electronic medical records, and access your healthcare services with zero friction.
              </p>

              {/* Primary / Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  icon={Calendar}
                  onClick={() => handleBookClick()}
                  className="w-full sm:w-auto shadow-lg shadow-brand-600/20 hover:shadow-brand-600/30 text-base"
                >
                  Book an Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  icon={Stethoscope}
                  onClick={() => {
                    const el = document.getElementById('doctors');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto text-base bg-white hover:bg-slate-50"
                >
                  Explore Doctors
                </Button>
              </div>

              {/* Key Trust Metrics */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {doctors.length > 0 ? `${doctors.length}+` : '6+'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Physicians</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {departments.length > 0 ? `${departments.length}+` : '6+'}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Clinical Units</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">24/7</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Emergency Triage</p>
                </div>
              </div>
            </div>

            {/* Right: 3D Healthcare Visual Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                {/* Visual Backdrop Frame */}
                <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-300/40 bg-white group">
                  <img
                    src="/images/hero-doctor-3d.jpg"
                    alt="AuraHealth 3D Healthcare Physician with Digital Dashboard"
                    className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                  />
                  {/* Subtle gradient vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid Bottom Title */}
                  <div className="absolute bottom-4 left-5 right-5 text-white pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-600/90 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase text-white mb-1.5">
                      <HeartPulse className="w-3.5 h-3.5" /> Next-Gen Health EMR
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      Integrated Clinical Care Portal
                    </h3>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Real-time appointment scheduling & electronic records
                    </p>
                  </div>
                </div>

                {/* Floating 3D Badge 1: Top-Left Heart Pulse */}
                <div className="hidden sm:flex absolute -top-5 -left-6 items-center gap-3 p-3.5 rounded-2xl glass-card shadow-dropdown border border-white/80 animate-float-slow">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-red-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20 flex-shrink-0">
                    <Heart className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900">Live Triage Active</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Wait time &lt; 10 mins</span>
                  </div>
                </div>

                {/* Floating 3D Badge 2: Bottom-Right Instant Booking */}
                <div className="hidden sm:flex absolute -bottom-6 -right-4 items-center gap-3 p-3.5 rounded-2xl glass-card shadow-dropdown border border-white/80 animate-float-reverse">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-brand-500/20 flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block">Instant Booking</span>
                    <span className="text-[11px] text-brand-700 font-semibold">Zero Double Booking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. QUICK SERVICES SECTION
      ======================================================== */}
      <section id="services" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Our Healthcare Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Comprehensive Medical Services
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-3 leading-relaxed">
              From instant physician booking to centralized clinical health records, explore the
              integrated modules designed for seamless patient care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => {
              const IconComp = srv.icon;
              return (
                <div
                  key={srv.id}
                  className="group relative p-7 rounded-2xl bg-white border border-slate-200/90 shadow-soft hover:shadow-dropdown hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${srv.accent} text-white flex items-center justify-center shadow-md`}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {srv.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleBookClick()}
                      className="text-xs font-bold text-brand-700 group-hover:text-brand-800 flex items-center gap-1.5 transition-colors"
                    >
                      Book / Learn More
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-[11px] text-slate-400">AuraHealth</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          3. STATISTICS SECTION (Animated Counters & Milestones)
      ======================================================== */}
      <section className="py-14 bg-gradient-to-r from-slate-900 via-slate-950 to-brand-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
              Hospital Milestones & Records
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Delivering Proven Clinical Excellence
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {/* Stat 1: Doctors */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {doctors.length > 0 ? `${doctors.length}` : '6'}
                <span className="text-brand-400">+</span>
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Verified Doctors</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Live database active</p>
            </div>

            {/* Stat 2: Departments */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {departments.length > 0 ? `${departments.length}` : '6'}
                <span className="text-teal-400">+</span>
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Specialized Units</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Clinical departments</p>
            </div>

            {/* Stat 3: Consultations */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                12.5k<span className="text-blue-400">+</span>
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">Consultations</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Delivered to date</p>
            </div>

            {/* Stat 4: Satisfaction */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <HeartPulse className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                99.8<span className="text-emerald-400">%</span>
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">On-Time Care</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Patient satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. FIND A DOCTOR SECTION (Dynamic API Integration)
      ======================================================== */}
      <section id="doctors" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Our Specialist Directory
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                Find & Book Board-Certified Doctors
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Browse physicians by medical specialty, inspect consultation fees, and book directly.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchHospitalData}
              className="self-start md:self-auto bg-white"
            >
              Refresh Directory
            </Button>
          </div>

          {/* Search & Department Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft mb-8 flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by doctor name or specialty..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedDeptFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDeptFilter === 'all'
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Specialists ({doctors.length})
              </button>
              {departments.map((dept) => (
                <button
                  key={dept._id}
                  onClick={() => setSelectedDeptFilter(dept._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedDeptFilter === dept._id
                      ? 'bg-brand-600 text-white shadow-soft'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept.name}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loadingDoctors && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-slate-100 rounded-xl" />
                  <div className="h-10 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loadingDoctors && doctorError && (
            <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-lg mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-rose-900">{doctorError}</p>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={fetchHospitalData}
                className="mt-4 bg-white"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loadingDoctors && !doctorError && filteredDoctors.length === 0 && (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center max-w-md mx-auto">
              <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Doctors Found</h4>
              <p className="text-xs text-slate-500 mt-1">
                No doctors matched your search criteria or selected department filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDeptFilter('all');
                }}
                className="mt-4"
              >
                Reset Search Filters
              </Button>
            </div>
          )}

          {/* Doctor Cards Grid */}
          {!loadingDoctors && !doctorError && filteredDoctors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-soft hover:shadow-dropdown hover:border-brand-200 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Doctor Avatar & Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 overflow-hidden flex-shrink-0 relative">
                        {doc.user?.avatar ? (
                          <img
                            src={doc.user.avatar}
                            alt={doc.user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-brand-700 text-xl">
                            {doc.user?.name?.charAt(0) || 'D'}
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-brand-50 border border-brand-100 text-brand-800 text-[10px] font-bold uppercase tracking-wider mb-1">
                          {doc.department?.name || 'General Medicine'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {doc.user?.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 truncate">
                          {doc.specialization}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {doc.qualifications?.join(', ') || 'Board Certified'}
                        </p>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {doc.bio || 'Consultant specialist providing comprehensive diagnostic and clinical therapeutic care.'}
                    </p>

                    {/* Doctor Details Bar */}
                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-5 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> Clinic Suite:
                        </span>
                        <span className="font-semibold text-slate-800">{doc.roomNumber || 'Room 101'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Working Days:
                        </span>
                        <span className="font-medium text-slate-700 text-[11px]">
                          {doc.availability?.workingDays ? doc.availability.workingDays.slice(0, 3).join(', ') : 'Mon - Fri'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium">Consultation Fee:</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          ${doc.consultationFee || 100}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <Button
                    variant="primary"
                    className="w-full shadow-soft"
                    icon={Calendar}
                    onClick={() => handleBookClick(doc)}
                  >
                    Book with {doc.user?.name?.split(' ')[1] || 'Doctor'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          5. WHY CHOOSE OUR HOSPITAL (3D Facility Visual + Benefits)
      ======================================================== */}
      <section id="why-us" className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 3D Architectural Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl shadow-slate-300/40 bg-white group">
                <img
                  src="/images/hospital-building-3d.jpg"
                  alt="AuraHealth 3D Modern Medical Center & Trauma Wing"
                  className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-5 left-5 right-5 text-white pointer-events-none">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white mb-1.5">
                    <CheckCircle2 className="w-3 h-3" /> State-of-the-Art Infrastructure
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    City Medical Center Campus
                  </h4>
                  <p className="text-xs text-slate-200">
                    Trauma Wing, ICU Units, Medevac Helipad & Clinical Labs
                  </p>
                </div>
              </div>

              {/* Floating Infrastructure Badge */}
              <div className="hidden sm:flex absolute -bottom-5 -right-5 items-center gap-3 p-3.5 rounded-2xl glass-card shadow-dropdown border border-white animate-float-slow">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Modern Facilities</span>
                  <span className="text-[11px] text-slate-500">Continuous 24/7 Power & Labs</span>
                </div>
              </div>
            </div>

            {/* Right Benefits Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                  Why Choose AuraHealth
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Healthcare Designed Around the Patient Experience
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  We bridge the gap between world-class clinical expertise and modern digital health tools,
                  ensuring faster consultations, zero scheduling conflicts, and complete medical privacy.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Experienced Doctors</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      100% verified specialists with extensive clinical records and qualifications.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Easy Appointment Booking</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time slot engine generates available visits without overlaps or double booking.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Secure Patient Records</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Encrypted electronic medical files adhering to HIPAA privacy standards.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">24/7 Healthcare Support</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Emergency response trauma center and round-the-clock front desk coordination.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Modern Facilities</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Equipped with high-resolution imaging, digital pathology, and sterile surgical suites.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Fast & Reliable Service</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Streamlined check-in, automated queue routing, and immediate digital prescriptions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. HOW IT WORKS (Connected 4-Step Timeline)
      ======================================================== */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Simple & Transparent
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              How to Book Your Appointment in 4 Steps
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-3">
              Our streamlined booking workflow connects you with the right specialist in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {howItWorksSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-brand-600/30 tracking-tight">
                        {step.step}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-bold">
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-brand-700 font-semibold flex items-center gap-1">
                    Step {idx + 1} of 4 <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              variant="primary"
              icon={Calendar}
              onClick={() => handleBookClick()}
              className="shadow-lg shadow-brand-600/20"
            >
              Start Booking Now
            </Button>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. PATIENT TESTIMONIALS SECTION
      ======================================================== */}
      <section className="py-16 lg:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Patient Feedback & Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
              Trusted by Patients Everywhere
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Verified clinical experiences from individuals and families receiving care at AuraHealth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic mb-5">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/70 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.author}</h4>
                    <p className="text-[11px] text-brand-700 font-semibold">{t.department}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                    {t.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          8. EMERGENCY / URGENT CARE CTA SECTION
      ======================================================== */}
      <section className="py-14 bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-700 text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                24/7 Immediate Medical Attention
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Need Urgent Medical Assistance?
              </h2>
              <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
                Our front desk coordinators and emergency trauma physicians are on standby 24 hours a day.
                Call our direct dispatch line or book an urgent consultation slot.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 flex-shrink-0 w-full sm:w-auto">
              <a
                href="tel:+18005550199"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-brand-800 font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-brand-50 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-brand-600" />
                Call +1 (800) 555-0199
              </a>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-transparent border-white/60 text-white hover:bg-white/10"
                onClick={() => handleBookClick()}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. CONTACT & INQUIRY SECTION
      ======================================================== */}
      <section id="contact" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Contact Info */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Front Desk & Helpdesk
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Our Medical Center is Ready to Assist You
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Have questions regarding specialized treatments, electronic health reports, or insurance
                invoicing? Reach out to our patient care desk or send an instant inquiry.
              </p>

              <div className="space-y-4 text-sm text-slate-700 pt-2">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Hospital Campus Address</span>
                    <span className="text-slate-600 text-xs">
                      100 Health Sciences Plaza, Medical District, NY 10001
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Front Desk & Helpdesk</span>
                    <span className="text-slate-600 text-xs">
                      +1 (800) 555-0199 • Open 24/7 for appointments & inquiries
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900">Clinical Support Email</span>
                    <span className="text-slate-600 text-xs">
                      appointments@aurahealth.com • Response within 2 hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Form */}
            <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-soft">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                Send a Clinical Inquiry
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Our front desk administration team will follow up via email or phone.
              </p>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Inquiry Received</h4>
                  <p className="text-xs text-emerald-700">
                    Thank you, {inquiryName}! Your message has been sent to our clinical team. We will
                    contact you shortly.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-white"
                    onClick={() => {
                      setFormSubmitted(false);
                      setInquiryName('');
                      setInquiryEmail('');
                      setInquiryMessage('');
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSubmitted(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Inquiry Details
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="How can our healthcare team assist you today?"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <Button variant="primary" type="submit" className="w-full py-2.5">
                    Submit Patient Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />

      {/* Booking Modal (Controlled by state) */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedDoctorForBooking(null);
          }}
          preselectedDoctor={selectedDoctorForBooking}
          onSuccess={() => {
            navigate('/patient/appointments');
          }}
        />
      )}
    </div>
  );
};
