import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DoctorAvailability = () => {
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [breakStart, setBreakStart] = useState('13:00');
  const [breakEnd, setBreakEnd] = useState('14:00');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get('/auth/me');
        const doc = profileRes.data.data.profile;
        if (doc) {
          setDoctorId(doc._id);
          const av = doc.availability || {};
          if (av.workingDays) setWorkingDays(av.workingDays);
          if (av.startTime) setStartTime(av.startTime);
          if (av.endTime) setEndTime(av.endTime);
          if (av.breakStart) setBreakStart(av.breakStart);
          if (av.breakEnd) setBreakEnd(av.breakEnd);
          if (av.slotDurationMinutes) setSlotDurationMinutes(av.slotDurationMinutes);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, []);

  const handleDayToggle = (day) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (workingDays.length === 0) {
      setMsg({ type: 'error', text: 'Please select at least one working day.' });
      return;
    }

    try {
      setSaving(true);
      const res = await api.put(`/doctors/${doctorId}`, {
        availability: {
          workingDays,
          startTime,
          endTime,
          breakStart,
          breakEnd,
          slotDurationMinutes: Number(slotDurationMinutes),
        },
      });

      if (res.data.success) {
        setMsg({ type: 'success', text: 'Consultation availability updated successfully!' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update schedule.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading schedule settings..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Consultation Availability & Schedule
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical working days, consultation hours, lunch breaks, and appointment slot lengths
        </p>
      </div>

      {msg.text && (
        <div
          className={`flex items-center gap-2 p-3.5 text-xs rounded-xl border ${
            msg.type === 'success'
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-rose-700 bg-rose-50 border-rose-200'
          }`}
        >
          {msg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Working Days */}
        <Card title="Working Days">
          <p className="text-xs text-slate-500 mb-3">
            Select the days of the week you are available for patient consultations:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS.map((day) => {
              const isChecked = workingDays.includes(day);
              return (
                <label
                  key={day}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    isChecked
                      ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span>{day}</span>
                </label>
              );
            })}
          </div>
        </Card>

        {/* Working Hours & Breaks */}
        <Card title="Consultation Hours & Break Interval">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Shift Start Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Shift End Time *
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Break / Lunch Start
              </label>
              <input
                type="time"
                value={breakStart}
                onChange={(e) => setBreakStart(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Break / Lunch End
              </label>
              <input
                type="time"
                value={breakEnd}
                onChange={(e) => setBreakEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Slot Duration */}
        <Card title="Appointment Slot Duration">
          <div className="max-w-xs text-xs">
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Duration per Consultation Slot
            </label>
            <select
              value={slotDurationMinutes}
              onChange={(e) => setSlotDurationMinutes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
            >
              <option value="15">15 Minutes</option>
              <option value="20">20 Minutes</option>
              <option value="30">30 Minutes (Standard)</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Slots are generated automatically based on this duration and exclude break intervals.
            </p>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
            <Button
              variant="primary"
              type="submit"
              icon={Save}
              isLoading={saving}
            >
              Save Schedule Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
