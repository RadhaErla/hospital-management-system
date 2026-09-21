import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X, FileText, CheckCircle2, User, Search } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';
import api from '../../services/api';

export const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedAppForRx, setSelectedAppForRx] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = `/appointments?page=${page}&limit=10`;
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
  }, [page, status, date]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Consultation Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review patient appointments, confirm bookings, write prescriptions, and complete visits
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <option value="Rejected">Rejected</option>
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

      {/* Table */}
      {loading ? (
        <Loader message="Loading appointments..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Date & Time' },
              { header: 'Patient Name & ID' },
              { header: 'Reason for Visit' },
              { header: 'Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={appointments}
            emptyMessage="No appointments found."
            renderRow={(app) => (
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
                <td className="px-6 py-4 text-xs text-slate-700 max-w-xs truncate">
                  {app.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge size="sm">{app.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                  {app.status === 'Pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        icon={Check}
                        onClick={() => handleStatusUpdate(app._id, 'Confirmed')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={X}
                        onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {['Confirmed', 'Checked-In'].includes(app.status) && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={FileText}
                        onClick={() => setSelectedAppForRx(app)}
                      >
                        Prescribe
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleStatusUpdate(app._id, 'Completed')}
                      >
                        Complete
                      </Button>
                    </>
                  )}

                  {app.status === 'Completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FileText}
                      onClick={() => setSelectedAppForRx(app)}
                    >
                      New Rx
                    </Button>
                  )}
                </td>
              </tr>
            )}
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

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={!!selectedAppForRx}
        onClose={() => setSelectedAppForRx(null)}
        appointment={selectedAppForRx}
        onSuccess={() => fetchAppointments()}
      />
    </div>
  );
};
