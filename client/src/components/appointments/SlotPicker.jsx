import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Loader } from '../common/Loader';

export const SlotPicker = ({ doctorId, selectedDate, onSelectSlot, selectedSlot }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isWorkingDay, setIsWorkingDay] = useState(true);

  useEffect(() => {
    if (!doctorId || !selectedDate) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/doctors/${doctorId}/slots?date=${selectedDate}`);
        if (res.data.success) {
          setIsWorkingDay(res.data.data.isWorkingDay);
          setSlots(res.data.data.slots || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load time slots.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, selectedDate]);

  if (loading) {
    return <Loader message="Checking doctor schedule..." />;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!isWorkingDay) {
    return (
      <div className="p-4 text-center rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
        The doctor is not scheduled to work on this day. Please choose another date.
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-4 text-center rounded-xl bg-slate-100 text-xs text-slate-500">
        No consultation slots available for this date.
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
        Available Time Slots
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
        {slots.map((slot, index) => {
          const isSelected =
            selectedSlot?.startTime === slot.startTime &&
            selectedSlot?.endTime === slot.endTime;

          return (
            <button
              key={index}
              type="button"
              disabled={!slot.isAvailable}
              onClick={() => onSelectSlot(slot)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white ring-2 ring-brand-500 shadow-md shadow-brand-500/20'
                  : slot.isAvailable
                  ? 'bg-white border border-slate-200 text-slate-800 hover:border-brand-500 hover:bg-brand-50/50'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{slot.startTime}</span>
              </div>
              <span className="text-[10px] mt-0.5 font-normal">
                {slot.isBooked ? 'Booked' : slot.isPast ? 'Past' : 'Available'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
