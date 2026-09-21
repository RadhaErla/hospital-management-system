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
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { BookingModal } from '../../components/appointments/BookingModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/departments'),
          api.get('/doctors?limit=6'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data || []);
        if (docRes.data.success) setDoctors(docRes.data.data.items || []);
      } catch (e) {
        console.error('Landing page fetch error:', e);
      }
    };
    fetchData();
  }, []);

  const handleBookClick = (doctor = null) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/patient/book');
    } else {
      setSelectedDoctorForBooking(doctor);
      setIsBookingOpen(true);
    }
  };

  const departmentIcons = {
    Heart: Heart,
    Brain: Brain,
    Bone: Bone,
    Baby: Baby,
    Sparkles: Sparkles,
    Stethoscope: Stethoscope,
    Activity: Activity,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/70 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Modern Healthcare & Electronic Medical Records</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Advanced Care. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                  Seamless Clinical
                </span>{' '}
                Experience.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                AuraHealth connects patients, board-certified specialists, and hospital staff with
                instant appointment scheduling, real-time diagnostic reports, and digital prescriptions.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  icon={Calendar}
                  onClick={() => handleBookClick()}
                  className="w-full sm:w-auto shadow-lg shadow-brand-600/20"
                >
                  Book Appointment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  icon={Stethoscope}
                  onClick={() => {
                    const el = document.getElementById('doctors');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto"
                >
                  Find a Doctor
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">10+</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Specialties</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Doctors</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">24/7</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Emergency Care</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dr. Robert Chen</h4>
                      <p className="text-xs text-brand-600 font-medium">Cardiology Specialist</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    Available Today
                  </span>
                </div>

                <div className="py-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Working Hours</span>
                    <span className="font-semibold text-slate-800">09:00 AM – 05:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="font-bold text-slate-900">$120</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Hospital Location</span>
                    <span className="font-semibold text-slate-800">Suite 304, Main Tower</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleBookClick()}
                >
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16 lg:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Center of Clinical Excellence
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              Comprehensive Medical Departments
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From cardiology to neurology and preventive diagnostics, our multidisciplinary teams provide expert patient-centric care.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {departments.slice(0, 10).map((dept) => {
              const IconComponent = departmentIcons[dept.icon] || Activity;
              return (
                <div
                  key={dept._id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-500 hover:bg-white transition-all duration-200 group flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{dept.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dept.description || 'Specialized diagnostic and therapeutic care.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-brand-700 font-semibold">
                      {dept.doctorCount || 0} Specialists
                    </span>
                    <button
                      onClick={() => handleBookClick()}
                      className="text-slate-400 group-hover:text-brand-600 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-16 lg:py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Our Specialists
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                Board Certified Physicians
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBookClick()}
            >
              View Full Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-brand-100 border border-brand-200 overflow-hidden flex-shrink-0">
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
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {doc.user?.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.qualifications?.join(', ')}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {doc.bio || 'Consultant specialist providing comprehensive diagnostic and clinical therapeutic care.'}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{doc.department?.name || 'General'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room:</span>
                      <span className="font-semibold text-slate-800">{doc.roomNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <span className="font-bold text-brand-700">${doc.consultationFee}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleBookClick(doc)}
                >
                  Book with Dr. {doc.user?.name?.split(' ')[1] || 'Doctor'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 lg:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Integrated Healthcare
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              End-to-End Hospital Services
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Modern facilities equipped with state-of-the-art diagnostic machinery and digital medical record coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Smart Scheduling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated slot generation, instant doctor availability checking, and double-booking prevention.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Digital EMR & Prescriptions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Electronic patient records, diagnostic lab report archives, and clean printable prescriptions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Billing & Pharmacy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Itemized invoice generation, pharmacy medication stock tracking, and secure payment processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-700 via-teal-700 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience Quality Medical Care?
          </h2>
          <p className="text-slate-200 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Register as a patient today or sign in to consult with our specialized clinical team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleBookClick()}
              className="w-full sm:w-auto"
            >
              Book Consultation Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto"
              onClick={() => navigate('/register')}
            >
              Create Patient Account
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Get In Touch
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Our Medical Center is Ready to Assist You
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Have questions regarding clinical appointments, diagnostic lab results, or billing? Reach out to our front desk coordination team.
              </p>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>100 Health Sciences Plaza, Medical District, NY 10001</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>+1 (800) 555-0199 (Front Desk & Emergency)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span>appointments@aurahealth.com</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="lg:col-span-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Patient Inquiry Form</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you! Your message has been received by our front desk team.');
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Message / Clinical Inquiry
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="How can we assist you?"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <Button variant="primary" type="submit" className="w-full">
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Booking Modal */}
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
