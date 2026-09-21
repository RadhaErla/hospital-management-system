import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, XCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import api from '../../services/api';

export const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [doctorId, setDoctorId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [docRes, deptRes] = await Promise.all([
          api.get('/doctors?limit=50'),
          api.get('/departments'),
        ]);
        if (docRes.data.success) setDoctors(docRes.data.data.items || []);
        if (deptRes.data.success) setDepartments(deptRes.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMetadata();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = `/appointments?page=${page}&limit=10`;
      if (doctorId) url += `&doctorId=${doctorId}`;
      if (departmentId) url += `&departmentId=${departmentId}`;
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
  }, [page, doctorId, departmentId, status, date]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Hospital Appointment Master Records
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive review of all clinical consultations, cancellations, and status overrides
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Department
          </label>
          <select
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

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
                Dr. {d.user?.name}
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
              setDoctorId('');
              setDepartmentId('');
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
        <Loader message="Loading hospital appointments..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Date & Slot' },
              { header: 'Patient Name & ID' },
              { header: 'Doctor & Department' },
              { header: 'Reason for Visit' },
              { header: 'Status' },
              { header: 'Status Override', className: 'text-right' },
            ]}
            data={appointments}
            emptyMessage="No appointments match these filters."
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
                </td>
                <td className="px-6 py-4 text-xs">
                  <div className="font-semibold text-slate-900">Dr. {app.doctor?.user?.name}</div>
                  <div className="text-brand-600">{app.department?.name}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-700 max-w-xs truncate">
                  {app.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge size="sm">{app.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked-In">Checked-In</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
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
    </div>
  );
};
