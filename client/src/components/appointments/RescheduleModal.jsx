import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SlotPicker } from './SlotPicker';
import api from '../../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const RescheduleModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [date, setDate] = useState(
    appointment?.date || new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!selectedSlot) {
      setError('Please select a new time slot.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/appointments/${appointment._id}/reschedule`, {
        date,
        timeSlot: selectedSlot,
      });

      if (res.data.success) {
        setSuccessMsg('Appointment rescheduled successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to reschedule appointment.');
    } finally {
      setLoading(false);
    }
  };

  const doctorId = appointment.doctor?._id || appointment.doctor;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      subtitle={`Dr. ${appointment.doctor?.user?.name || 'Doctor'} • Currently scheduled on ${appointment.date} at ${appointment.timeSlot?.startTime}`}
      maxWidth="max-w-xl"
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Select New Date *
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

        {doctorId && date && (
          <SlotPicker
            doctorId={doctorId}
            selectedDate={date}
            selectedSlot={selectedSlot}
            onSelectSlot={(slot) => setSelectedSlot(slot)}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={loading}
            disabled={!selectedSlot}
          >
            Confirm Reschedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};
