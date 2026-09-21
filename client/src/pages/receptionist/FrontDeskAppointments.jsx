import React, { useState, useEffect } from 'react';
import { Calendar, Plus, RefreshCw, XCircle, UserCheck, Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { BookingModal } from '../../components/appointments/BookingModal';
import { RescheduleModal } from '../../components/appointments/RescheduleModal';
import api from '../../services/api';

export const FrontDeskAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [doctorId, setDoctorId] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [rescheduleApp, setRescheduleApp] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors?limit=50');
        if (res.data.success) setDoctors(res.data.data.items || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = `/appointments?page=${page}&limit=10`;
      if (doctorId) url += `&doctorId=${doctorId}`;
      if (status) url += `&status=${status}`;
      if (date) url += `&date=${date}`;

      const res = await api.get(url);
      if (res.data.success) {
        setAppointments(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, doctorId, status, date]);

  const handleCheckIn = async (id) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: 'Checked-In' });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to check in patient.');
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt('Cancellation reason:');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Front Desk Appointment Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hospital-wide consultation schedules, patient check-ins, and booking coordination
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsBookingOpen(true)}
        >
          Book Appointment
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Doctor
          </label>
          <select
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                Dr. {d.user?.name} ({d.specialization})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          />
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDoctorId('');
              setStatus('');
              setDate('');
              setPage(1);
            }}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Appointments Table */}
      {loading ? (
        <Loader message="Loading appointments..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Date & Time' },
              { header: 'Patient Name & ID' },
              { header: 'Assigned Physician' },
              { header: 'Reason' },
              { header: 'Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={appointments}
            emptyMessage="No appointments found."
            renderRow={(app) => {
              const canAct = !['Completed', 'Cancelled', 'Rejected'].includes(app.status);

              return (
                <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{app.date}</div>
                    <div className="text-xs text-slate-500">
                      {app.timeSlot?.startTime} – {app.timeSlot?.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{app.patient?.user?.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{app.patient?.patientId}</div>
                    <div className="text-[11px] text-slate-500">{app.patient?.user?.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-semibold text-slate-900">Dr. {app.doctor?.user?.name}</div>
                    <div className="text-slate-500">{app.department?.name}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700 max-w-xs truncate">
                    {app.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge size="sm">{app.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                    {['Pending', 'Confirmed'].includes(app.status) && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={UserCheck}
                        onClick={() => handleCheckIn(app._id)}
                      >
                        Check In
                      </Button>
                    )}
                    {canAct && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={RefreshCw}
                          onClick={() => setRescheduleApp(app)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={XCircle}
                          onClick={() => handleCancel(app._id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              );
            }}
          />

          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={10}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => fetchAppointments()}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleApp}
        onClose={() => setRescheduleApp(null)}
        appointment={rescheduleApp}
        onSuccess={() => fetchAppointments()}
      />
    </div>
  );
};
