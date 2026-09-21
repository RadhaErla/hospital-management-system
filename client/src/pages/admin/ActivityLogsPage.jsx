import React, { useState, useEffect } from 'react';
import { History, Shield, Search, Clock, User } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import api from '../../services/api';

export const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = `/audit-logs?page=${page}&limit=15`;
      if (actionFilter) url += `&action=${actionFilter}`;

      const res = await api.get(url);
      if (res.data.success) {
        setLogs(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System Audit & Activity Logs
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit trail of authentication events, patient registrations, prescription issues, and billing transactions
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white sm:w-64"
        >
          <option value="">All Activities</option>
          <option value="LOGIN">User Logins</option>
          <option value="REGISTER">Registrations</option>
          <option value="CREATE_DOCTOR">Doctor Creations</option>
          <option value="CREATE_PATIENT">Patient Registrations</option>
          <option value="BOOK_APPOINTMENT">Appointment Bookings</option>
          <option value="CREATE_PRESCRIPTION">Prescriptions Issued</option>
          <option value="CREATE_BILL">Bills Generated</option>
          <option value="UPDATE_BILL_PAYMENT">Payment Settlements</option>
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <Loader message="Loading activity audit trail..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Timestamp' },
              { header: 'Action' },
              { header: 'User & Role' },
              { header: 'Entity' },
              { header: 'Details' },
              { header: 'IP Address' },
            ]}
            data={logs}
            emptyMessage="No activity logs found."
            renderRow={(log) => (
              <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-3.5 font-bold text-xs text-slate-900 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-mono text-[11px]">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-xs whitespace-nowrap">
                  <div className="font-semibold text-slate-800">{log.userName || 'System'}</div>
                  <Badge size="sm" className="capitalize mt-0.5">
                    {log.userRole || 'system'}
                  </Badge>
                </td>
                <td className="px-6 py-3.5 text-xs font-medium text-brand-700 whitespace-nowrap">
                  {log.entityType}
                </td>
                <td className="px-6 py-3.5 text-xs text-slate-600 max-w-sm truncate">
                  {log.details || '—'}
                </td>
                <td className="px-6 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                  {log.ipAddress || '127.0.0.1'}
                </td>
              </tr>
            )}
          />

          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            pageSize={15}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
};
