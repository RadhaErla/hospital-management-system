import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SlotPicker } from './SlotPicker';
import api from '../../services/api';
import { Calendar, User, Stethoscope, AlertCircle, CheckCircle2, Clock, MapPin, Award } from 'lucide-react';
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
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isStaff = ['admin', 'receptionist'].includes(user?.role);

  // Sync initial preselected values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (preselectedDoctor) {
        setSelectedDoctor(preselectedDoctor._id || '');
        setSelectedDoctorDetails(preselectedDoctor);
        if (preselectedDoctor.department?._id) {
          setSelectedDept(preselectedDoctor.department._id);
        } else if (typeof preselectedDoctor.department === 'string') {
          setSelectedDept(preselectedDoctor.department);
        }
      }
      if (preselectedDepartment) {
        setSelectedDept(preselectedDepartment);
      }
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, preselectedDoctor, preselectedDepartment]);

  // Fetch departments list
  useEffect(() => {
    if (!isOpen) return;
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.data || []);
        }
      } catch (e) {
        console.error('Failed to load departments:', e);
      }
    };
    fetchDepts();
  }, [isOpen]);

  // Fetch doctors list whenever modal is opened or department filter changes
  useEffect(() => {
    if (!isOpen) return;

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

          // If a doctor is already selected, update or retain their details
          if (selectedDoctor) {
            const found = items.find((d) => d._id === selectedDoctor);
            if (found) {
              setSelectedDoctorDetails(found);
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch doctors:', e);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [isOpen, selectedDept]);

  // Fetch patients if staff member is booking on behalf of patient
  useEffect(() => {
    if (isOpen && isStaff) {
      const fetchPatients = async () => {
        try {
          const res = await api.get('/patients?limit=100');
          if (res.data.success) {
            setPatientsList(res.data.data.items || []);
          }
        } catch (e) {
          console.error('Failed to load patients list:', e);
        }
      };
      fetchPatients();
    }
  }, [isOpen, isStaff]);

  const handleDepartmentChange = (deptId) => {
    setSelectedDept(deptId);
    // Reset selected doctor if they are not part of newly chosen department
    if (selectedDoctorDetails && deptId && selectedDoctorDetails.department?._id !== deptId) {
      setSelectedDoctor('');
      setSelectedDoctorDetails(null);
      setSelectedSlot(null);
    }
  };

  const handleDoctorChange = (docId) => {
    setSelectedDoctor(docId);
    setSelectedSlot(null);
    const doc = doctors.find((d) => d._id === docId);
    setSelectedDoctorDetails(doc || null);

    // Auto-select department if none was selected
    if (doc?.department?._id && !selectedDept) {
      setSelectedDept(doc.department._id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedDoctor) {
      setError('Please select a physician.');
      return;
    }
    if (!selectedSlot) {
      setError('Please select an available consultation time slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide the clinical reason for the appointment.');
      return;
    }
    if (isStaff && !patientId) {
      setError('Please select a patient for this appointment.');
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
      subtitle="Select physician, convenient schedule slot, and consultation details"
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
          {/* Department Filter */}
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

          {/* Doctor Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Specialist Physician *
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => handleDoctorChange(e.target.value)}
              disabled={loadingDoctors}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white disabled:bg-slate-50"
              required
            >
              <option value="">
                {loadingDoctors ? 'Loading physicians...' : '-- Choose Doctor --'}
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

        {/* Doctor Summary Card */}
        {selectedDoctorDetails && (
          <div className="p-4 bg-brand-50/60 rounded-xl border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
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
                  {selectedDoctorDetails.specialization} • {selectedDoctorDetails.department?.name || 'Clinical Care'}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {selectedDoctorDetails.roomNumber || 'Room 101'}
                  </span>
                  {selectedDoctorDetails.experienceYears && (
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3 text-slate-400" />
                      {selectedDoctorDetails.experienceYears} yrs exp
                    </span>
                  )}
                  {selectedDoctorDetails.availability?.workingDays && (
                    <span className="hidden sm:flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {selectedDoctorDetails.availability.workingDays.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-100">
              <span className="text-[11px] text-slate-500 block">Consultation Fee</span>
              <span className="text-base font-bold text-slate-900">
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
            placeholder="e.g. Chest discomfort, routine wellness check, prescription renewal..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            required
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Additional Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Mention any allergies, previous diagnosis, or clinical notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
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
