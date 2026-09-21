import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SlotPicker } from '../../components/appointments/SlotPicker';
import api from '../../services/api';
import { Stethoscope, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const url = selectedDept ? `/doctors?department=${selectedDept}` : '/doctors';
        const res = await api.get(url);
        if (res.data.success) setDoctors(res.data.data.items || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoctors();
  }, [selectedDept]);

  const handleDoctorSelect = (docId) => {
    setSelectedDoctor(docId);
    setSelectedSlot(null);
    const doc = doctors.find((d) => d._id === docId);
    setSelectedDoctorDetails(doc || null);
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
        setSuccessMsg('Appointment booked successfully! Redirecting...');
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
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setSelectedDoctor('');
                  setSelectedSlot(null);
                }}
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
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                required
              >
                <option value="">-- Select Specialist --</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.user?.name} — {doc.specialization} (${doc.consultationFee})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedDoctorDetails && (
            <div className="mt-4 p-4 bg-brand-50/60 rounded-xl border border-brand-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedDoctorDetails.user?.name}
                </h4>
                <p className="text-xs text-brand-700 font-medium">
                  {selectedDoctorDetails.specialization} • {selectedDoctorDetails.experienceYears} years experience
                </p>
                <p className="text-xs text-slate-500 mt-1">{selectedDoctorDetails.bio}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Fee</span>
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
