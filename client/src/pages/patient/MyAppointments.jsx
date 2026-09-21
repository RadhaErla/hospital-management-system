import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { BookingModal } from '../../components/appointments/BookingModal';
import { RescheduleModal } from '../../components/appointments/RescheduleModal';
import api from '../../services/api';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `/appointments?status=${statusFilter}`
        : '/appointments';
      const res = await api.get(url);
      if (res.data.success) {
        setAppointments(res.data.data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleCancelAppointment = async (id) => {
    const reason = prompt('Please enter a cancellation reason:');
    if (reason === null) return;

    try {
      await api.delete(`/appointments/${id}`, { data: { reason } });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            My Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View scheduled visits, check status updates, or reschedule time slots
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsBookingOpen(true)}
        >
          Book New Appointment
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['', 'Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              statusFilter === status
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status || 'All Appointments'}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <Loader message="Loading your appointments..." />
      ) : appointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((app) => {
            const canCancelOrReschedule = ['Pending', 'Confirmed'].includes(app.status);

            return (
              <Card key={app._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Dr. {app.doctor?.user?.name}
                      </h4>
                      <p className="text-xs text-brand-600 font-medium">
                        {app.doctor?.specialization || app.department?.name}
                      </p>
                    </div>
                    <Badge size="sm">{app.status}</Badge>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-bold text-slate-900">{app.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time Slot:</span>
                      <span className="font-semibold text-slate-800">
                        {app.timeSlot?.startTime} – {app.timeSlot?.endTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Room / Clinic:</span>
                      <span className="font-medium text-slate-700">
                        {app.doctor?.roomNumber || 'Room 101'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reason:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[180px]">
                        {app.reason}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                {canCancelOrReschedule && (
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RefreshCw}
                      onClick={() => setRescheduleTarget(app)}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() => handleCancelAppointment(app._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="You do not have any appointments matching this status."
          actionLabel="Book Appointment"
          onAction={() => setIsBookingOpen(true)}
        />
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => fetchAppointments()}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        appointment={rescheduleTarget}
        onSuccess={() => fetchAppointments()}
      />
    </div>
  );
};
