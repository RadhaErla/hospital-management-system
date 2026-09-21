import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SlotPicker } from '../../components/appointments/SlotPicker';
import api from '../../services/api';
import { Stethoscope, Calendar, Clock, CheckCircle2, AlertCircle, MapPin, Award, User } from 'lucide-react';

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data || []);
      } catch (e) {
        console.error('Failed to load departments:', e);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch doctors (filtered by department if selected, otherwise all active doctors)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const url = selectedDept
          ? `/doctors?department=${selectedDept}&limit=100`
          : '/doctors?limit=100';
        const res = await api.get(url);
        if (res.data.success) {
          const items = res.data.data?.items || [];
          setDoctors(items);

          if (selectedDoctor) {
            const match = items.find((d) => d._id === selectedDoctor);
            if (match) setSelectedDoctorDetails(match);
          }
        }
      } catch (e) {
        console.error('Failed to load doctors:', e);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [selectedDept]);

  const handleDepartmentChange = (deptId) => {
    setSelectedDept(deptId);
    // Reset selected doctor if they are not in this department
    if (selectedDoctorDetails && deptId && selectedDoctorDetails.department?._id !== deptId) {
      setSelectedDoctor('');
      setSelectedDoctorDetails(null);
      setSelectedSlot(null);
    }
  };

  const handleDoctorSelect = (docId) => {
    setSelectedDoctor(docId);
    setSelectedSlot(null);
    const doc = doctors.find((d) => d._id === docId);
    setSelectedDoctorDetails(doc || null);

    // Auto-select department if none was selected
    if (doc?.department?._id && !selectedDept) {
      setSelectedDept(doc.department._id);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedDoctor) {
      setError('Please select a physician.');
      return;
    }
    if (!selectedSlot) {
      setError('Please choose an available appointment slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please state the primary reason for your consultation.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/appointments', {
        doctorId: selectedDoctor,
        departmentId: selectedDept || selectedDoctorDetails?.department?._id || selectedDoctorDetails?.department,
        date,
        timeSlot: selectedSlot,
        reason,
        notes,
      });

      if (res.data.success) {
        setSuccessMsg('Appointment booked successfully! Redirecting to your appointments...');
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Find Specialist & Book Consultation
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select clinical specialty, physician, and preferred consultation schedule
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3.5 text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleBook} className="space-y-6">
        <Card title="Step 1: Choose Department & Specialist">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="">-- All Departments --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Physician *
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => handleDoctorSelect(e.target.value)}
                disabled={loadingDoctors}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white disabled:bg-slate-50"
                required
              >
                <option value="">
                  {loadingDoctors ? 'Loading physicians...' : '-- Select Specialist --'}
                </option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.user?.name} — {doc.specialization} ({doc.department?.name || 'General'}) • ${doc.consultationFee}
                  </option>
                ))}
                {!loadingDoctors && doctors.length === 0 && (
                  <option value="" disabled>
                    No physicians found in this department
                  </option>
                )}
              </select>
            </div>
          </div>

          {selectedDoctorDetails && (
            <div className="mt-4 p-4 bg-brand-50/60 rounded-xl border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-brand-100 border border-brand-200 text-brand-700 font-bold flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                  {selectedDoctorDetails.user?.avatar ? (
                    <img
                      src={selectedDoctorDetails.user.avatar}
                      alt={selectedDoctorDetails.user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedDoctorDetails.user?.name?.charAt(0) || 'D'
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedDoctorDetails.user?.name}
                  </h4>
                  <p className="text-xs text-brand-700 font-medium">
                    {selectedDoctorDetails.specialization} • {selectedDoctorDetails.department?.name || 'General Medicine'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {selectedDoctorDetails.roomNumber || 'Room 101'}
                    </span>
                    {selectedDoctorDetails.experienceYears && (
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-slate-400" />
                        {selectedDoctorDetails.experienceYears} years experience
                      </span>
                    )}
                    {selectedDoctorDetails.availability?.workingDays && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {selectedDoctorDetails.availability.workingDays.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                  {selectedDoctorDetails.bio && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 max-w-xl">
                      {selectedDoctorDetails.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-100 flex-shrink-0">
                <span className="text-xs text-slate-500 block">Consultation Fee</span>
                <span className="text-base font-bold text-slate-900">
                  ${selectedDoctorDetails.consultationFee}
                </span>
              </div>
            </div>
          )}
        </Card>

        {selectedDoctor && (
          <Card title="Step 2: Choose Date & Available Slot">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Consultation Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  required
                />
              </div>

              <SlotPicker
                doctorId={selectedDoctor}
                selectedDate={date}
                selectedSlot={selectedSlot}
                onSelectSlot={(slot) => setSelectedSlot(slot)}
              />
            </div>
          </Card>
        )}

        {selectedSlot && (
          <Card title="Step 3: Reason for Consultation">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Medical Concern / Symptoms *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Persistent fever, chest tightness, routine follow-up..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention previous treatments, allergies, or questions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  isLoading={loading}
                >
                  Confirm Appointment Booking
                </Button>
              </div>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
};
