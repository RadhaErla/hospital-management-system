import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const PatientRegistration = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // New patient form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Other',
    bloodGroup: 'Unknown',
    dateOfBirth: '',
    street: '',
    city: '',
    emergencyName: '',
    emergencyPhone: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setSaving(true);
      const res = await api.post('/patients', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth || null,
        address: { street: formData.street, city: formData.city },
        emergencyContact: { name: formData.emergencyName, phone: formData.emergencyPhone },
      });

      if (res.data.success) {
        setSuccessMsg(`Patient registered with ID: ${res.data.data.patientId}`);
        setTimeout(() => {
          setIsRegisterModalOpen(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            gender: 'Other',
            bloodGroup: 'Unknown',
            dateOfBirth: '',
            street: '',
            city: '',
            emergencyName: '',
            emergencyPhone: '',
          });
          fetchPatients();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to register patient.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Registration & Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register arriving patients, search existing records, and update contact information
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => setIsRegisterModalOpen(true)}
        >
          Register New Patient
        </Button>
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
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button variant="primary" size="sm" type="submit">
          Search
        </Button>
      </form>

      {/* Patients Table */}
      {loading ? (
        <Loader message="Loading patient directory..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Patient Name & ID' },
              { header: 'Gender & Blood Group' },
              { header: 'Phone Number' },
              { header: 'Emergency Contact' },
              { header: 'Registration Date' },
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
                <td className="px-6 py-4 text-xs text-slate-600">
                  {p.emergencyContact?.name ? (
                    <span>
                      {p.emergencyContact.name} ({p.emergencyContact.phone})
                    </span>
                  ) : (
                    <span className="text-slate-400">None on file</span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleDateString()}
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

      {/* Register Patient Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Walk-In Patient"
        subtitle="Create hospital record and assign unique patient ID"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleRegisterPatient} className="space-y-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Unknown">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Phone
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsRegisterModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
