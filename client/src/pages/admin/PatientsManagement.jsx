import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, Edit, AlertCircle, Eye } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import api from '../../services/api';

export const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      let url = `/patients?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setPatients(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this patient account?')) return;
    try {
      await api.delete(`/patients/${id}`);
      fetchPatients();
    } catch (err) {
      alert(err.message || 'Failed to deactivate patient.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Patient Directory & Records
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          View all registered hospital patients, manage account statuses, and review patient demographics
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone, or patient ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          />
        </div>
        <Button variant="primary" size="sm" type="submit">
          Search
        </Button>
      </form>

      {/* Table */}
      {loading ? (
        <Loader message="Loading patients..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Patient Name & ID' },
              { header: 'Gender & Blood Group' },
              { header: 'Contact Phone' },
              { header: 'Account Status' },
              { header: 'Registration Date' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={patients}
            emptyMessage="No patients found."
            renderRow={(p) => (
              <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{p.user?.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{p.patientId}</div>
                  <div className="text-[11px] text-slate-500">{p.user?.email}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-700">
                  {p.gender} • <Badge size="sm">{p.bloodGroup}</Badge>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-700">
                  {p.user?.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge size="sm">
                    {p.user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeactivate(p._id)}
                  >
                    Deactivate
                  </Button>
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
