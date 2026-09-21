import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SlotPicker } from './SlotPicker';
import api from '../../services/api';
import { Calendar, User, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BookingModal = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedDoctor = null,
  preselectedDepartment = null,
}) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState(preselectedDepartment || '');
  const [selectedDoctor, setSelectedDoctor] = useState(preselectedDoctor?._id || '');
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(preselectedDoctor || null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [patientId, setPatientId] = useState('');
  const [patientsList, setPatientsList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isStaff = ['admin', 'receptionist'].includes(user?.role);

  // Fetch departments
  useEffect(() => {
    if (!isOpen) return;
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepts();
  }, [isOpen]);

  // Fetch doctors when department changes
  useEffect(() => {
    if (!selectedDept && !preselectedDoctor) {
      setDoctors([]);
      return;
    }
    const fetchDoctors = async () => {
      try {
        const url = selectedDept
          ? `/doctors?department=${selectedDept}`
          : '/doctors';
        const res = await api.get(url);
        if (res.data.success) {
          setDoctors(res.data.data.items || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoctors();
  }, [selectedDept, preselectedDoctor]);

  // Fetch patients if staff
  useEffect(() => {
    if (isOpen && isStaff) {
      const fetchPatients = async () => {
        try {
          const res = await api.get('/patients?limit=100');
          if (res.data.success) {
            setPatientsList(res.data.data.items || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchPatients();
    }
  }, [isOpen, isStaff]);

  const handleDoctorChange = (docId) => {
    setSelectedDoctor(docId);
    setSelectedSlot(null);
    const doc = doctors.find((d) => d._id === docId);
    setSelectedDoctorDetails(doc || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedDoctor) {
      setError('Please select a doctor.');
      return;
    }
    if (!selectedSlot) {
      setError('Please choose an available time slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the appointment.');
      return;
    }
    if (isStaff && !patientId) {
      setError('Please select a patient.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        doctorId: selectedDoctor,
        departmentId: selectedDept || selectedDoctorDetails?.department?._id || selectedDoctorDetails?.department,
        date,
        timeSlot: selectedSlot,
        reason,
        notes,
        ...(isStaff ? { patientId } : {}),
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        setSuccessMsg('Appointment booked successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Consultation Appointment"
      subtitle="Select specialist, convenient time slot, and medical concern"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 text-xs text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Staff Only: Patient Selector */}
        {isStaff && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Patient *
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patientsList.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.user?.name} ({p.patientId}) - {p.user?.phone || 'No phone'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Department & Doctor Row */}
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
              Specialist Physician *
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => handleDoctorChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              required
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.user?.name} — {doc.specialization} (${doc.consultationFee})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctor Summary Card */}
        {selectedDoctorDetails && (
          <div className="flex items-center justify-between p-3.5 bg-brand-50/60 rounded-xl border border-brand-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-200 text-brand-800 font-bold flex items-center justify-center text-sm">
                {selectedDoctorDetails.user?.name?.charAt(0) || 'D'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedDoctorDetails.user?.name}
                </h4>
                <p className="text-xs text-brand-700">
                  {selectedDoctorDetails.specialization} • Room {selectedDoctorDetails.roomNumber}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Consultation Fee</span>
              <span className="text-sm font-bold text-slate-900">
                ${selectedDoctorDetails.consultationFee}
              </span>
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Appointment Date *
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

        {/* Slot Picker */}
        {selectedDoctor && date && (
          <SlotPicker
            doctorId={selectedDoctor}
            selectedDate={date}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
          />
        )}

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Reason for Visit / Symptoms *
          </label>
          <input
            type="text"
            placeholder="e.g. Chest discomfort on exertion, routine checkup, follow-up..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Additional Clinical Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Any allergies, previous treatment, or specific symptoms..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={loading}
            disabled={!selectedDoctor || !selectedSlot}
          >
            Confirm & Book Appointment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
