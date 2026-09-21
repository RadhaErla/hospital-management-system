import React, { useState, useEffect } from 'react';
import { Stethoscope, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    specialization: '',
    consultationFee: 80,
    roomNumber: '101',
    qualifications: 'MBBS, MD',
    bio: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) setDepartments(res.data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDepts();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      let url = `/doctors?page=${page}&limit=10`;
      if (departmentFilter) url += `&department=${departmentFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setDoctors(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, departmentFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      department: departments[0]?._id || '',
      specialization: '',
      consultationFee: 80,
      roomNumber: '101',
      qualifications: 'MBBS, MD',
      bio: '',
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.user?.name || '',
      email: doc.user?.email || '',
      password: '',
      phone: doc.user?.phone || '',
      department: doc.department?._id || doc.department || '',
      specialization: doc.specialization || '',
      consultationFee: doc.consultationFee || 80,
      roomNumber: doc.roomNumber || '101',
      qualifications: doc.qualifications?.join(', ') || '',
      bio: doc.bio || '',
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setSaving(true);
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor._id}`, {
          name: formData.name,
          phone: formData.phone,
          department: formData.department,
          specialization: formData.specialization,
          consultationFee: Number(formData.consultationFee),
          roomNumber: formData.roomNumber,
          qualifications: formData.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
          bio: formData.bio,
        });
        setSuccessMsg('Doctor profile updated successfully!');
      } else {
        await api.post('/doctors', {
          ...formData,
          consultationFee: Number(formData.consultationFee),
          qualifications: formData.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
        });
        setSuccessMsg('Doctor created successfully!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        fetchDoctors();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this doctor account?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (err) {
      alert(err.message || 'Failed to deactivate doctor.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Doctor & Specialist Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add physicians, assign clinical departments, configure consultation fees and rooms
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add New Doctor
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search doctor by name or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
          </div>
          <Button variant="primary" size="sm" type="submit">
            Search
          </Button>
        </form>

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white sm:w-56"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading doctors..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Doctor & Qualifications' },
              { header: 'Department & Specialty' },
              { header: 'Consultation Fee' },
              { header: 'Room / Suite' },
              { header: 'Account Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={doctors}
            emptyMessage="No doctors found."
            renderRow={(doc) => (
              <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{doc.user?.name}</div>
                  <div className="text-xs text-slate-500">{doc.qualifications?.join(', ')}</div>
                  <div className="text-[11px] text-slate-400">{doc.user?.email}</div>
                </td>
                <td className="px-6 py-4 text-xs">
                  <div className="font-semibold text-slate-900">{doc.department?.name}</div>
                  <div className="text-brand-600 font-medium">{doc.specialization}</div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                  ${doc.consultationFee}
                </td>
                <td className="px-6 py-4 text-xs text-slate-700 whitespace-nowrap">
                  {doc.roomNumber || 'Room 101'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge size="sm">
                    {doc.user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => openEditModal(doc)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeactivate(doc._id)}
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

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor Profile' : 'Add New Physician'}
        subtitle="Manage clinical credentials, specialization, department, and account details"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
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
                placeholder="Dr. John Doe"
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
                disabled={!!editingDoctor}
                placeholder="doctor@hospital.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100"
              />
            </div>

            {!editingDoctor && (
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            )}

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
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="">-- Choose Department --</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Specialization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Interventional Cardiology"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Consultation Fee ($) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Room / Suite
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Qualifications
              </label>
              <input
                type="text"
                placeholder="MBBS, MD, MS, FACC"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
