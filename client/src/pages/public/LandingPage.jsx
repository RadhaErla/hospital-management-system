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
  ChevronRight,
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
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Certified Clinical Excellence & Digital EMR</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Quality Healthcare, <br />
                <span className="text-brand-600">Simplified</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A modern, connected hospital management platform delivering seamless appointment booking,
                electronic clinical records, and direct specialist coordination for patients and medical staff.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  icon={Calendar}
                  onClick={() => handleBookClick()}
                  className="w-full sm:w-auto"
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
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-6 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">10+</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Specialized Units</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">100%</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Verified Physicians</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">24/7</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Emergency Care</p>
                </div>
              </div>
            </div>

            {/* Right Card / Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-2xl p-6 shadow-dropdown border border-slate-200/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 border border-brand-100 flex items-center justify-center font-bold">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Dr. Robert Chen</h4>
                      <p className="text-xs text-brand-700 font-medium">Interventional Cardiology</p>
                    </div>
                  </div>
                  <Badge size="sm">Available Today</Badge>
                </div>

                <div className="py-4 space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Working Hours</span>
                    <span className="font-semibold text-slate-800">09:00 AM – 05:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="font-bold text-slate-900">$120</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Clinical Suite</span>
                    <span className="font-semibold text-slate-800">Suite 304, Cardiology Wing</span>
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
      <section id="departments" className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Clinical Specializations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              Comprehensive Medical Departments
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Our multidisciplinary healthcare teams provide dedicated diagnostic and therapeutic excellence across core specialties.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {departments.slice(0, 10).map((dept) => {
              const IconComponent = departmentIcons[dept.icon] || Activity;
              return (
                <div
                  key={dept._id}
                  className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-soft hover:shadow-card hover:border-brand-300 transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mb-3">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{dept.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dept.description || 'Dedicated clinical diagnosis and specialist therapy.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-brand-700 font-semibold text-[11px]">
                      {dept.doctorCount || 0} Physicians
                    </span>
                    <button
                      onClick={() => handleBookClick()}
                      className="text-slate-400 hover:text-brand-600 transition-colors"
                      aria-label={`View ${dept.name}`}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-16 lg:py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Our Specialists
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Board-Certified Physicians
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBookClick()}
            >
              View All Doctors
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-brand-50 border border-brand-200 overflow-hidden flex-shrink-0">
                      {doc.user?.avatar ? (
                        <img
                          src={doc.user.avatar}
                          alt={doc.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-brand-700 text-lg">
                          {doc.user?.name?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {doc.user?.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-700 mt-0.5">
                        {doc.specialization}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {doc.qualifications?.join(', ')}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                    {doc.bio || 'Consultant specialist providing comprehensive diagnostic and clinical therapeutic care.'}
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-4 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-800">{doc.department?.name || 'General Medicine'}</span>
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
      <section id="services" className="py-16 lg:py-20 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
              Integrated Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
              End-to-End Hospital Services
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Designed for modern hospitals, medical centers, and clinical practices with patient-first tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Smart Scheduling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated slot generation, instant doctor availability checking, real-time status updates, and conflict avoidance.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Electronic Medical Records</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete clinical consultation logs, diagnostic reports archive, and standardized printable digital prescriptions.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-200/80 bg-white shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Billing & Invoicing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent itemized invoices, pharmacy medication dispensaries, tax breakdowns, and multiple payment options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment CTA Banner */}
      <section className="py-14 bg-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Ready to Experience Quality Medical Care?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm leading-relaxed">
            Register as a patient today or sign in to consult with our board-certified clinical team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => handleBookClick()}
              className="w-full sm:w-auto bg-white text-brand-700 hover:bg-brand-50"
            >
              Book Consultation Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-white/50 text-white hover:bg-white/10 w-full sm:w-auto"
              onClick={() => navigate('/register')}
            >
              Create Patient Account
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                Get In Touch
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Our Medical Center is Ready to Assist You
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Have questions regarding clinical appointments, diagnostic lab results, or billing? Reach out to our front desk coordination team.
              </p>

              <div className="space-y-4 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>100 Health Sciences Plaza, Medical District, NY 10001</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>+1 (800) 555-0199 (Front Desk & Emergency)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-brand-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>appointments@aurahealth.com</span>
                </div>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-soft">
              <h3 className="text-base font-bold text-slate-900 mb-3">Patient Inquiry Form</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you! Your inquiry has been received by our clinical reception team.');
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Inquiry / Question
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="How can our clinical team assist you?"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
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
