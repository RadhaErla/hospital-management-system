import React, { useState, useEffect } from 'react';
import { UserPlus, Plus, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

export const StaffManagement = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shift: 'Morning',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/receptionists?page=${page}&limit=10`);
      if (res.data.success) {
        setReceptionists(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, [page]);

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      shift: 'Morning',
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.user?.name || '',
      email: staff.user?.email || '',
      password: '',
      phone: staff.user?.phone || '',
      shift: staff.shift || 'Morning',
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
      if (editingStaff) {
        await api.put(`/receptionists/${editingStaff._id}`, {
          name: formData.name,
          phone: formData.phone,
          shift: formData.shift,
        });
        setSuccessMsg('Receptionist updated successfully!');
      } else {
        await api.post('/receptionists', formData);
        setSuccessMsg('Receptionist added successfully!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        fetchReceptionists();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save receptionist.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this receptionist account?')) return;
    try {
      await api.delete(`/receptionists/${id}`);
      fetchReceptionists();
    } catch (err) {
      alert(err.message || 'Failed to deactivate staff.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Reception & Front Desk Staff
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage front desk coordinators, assign work shifts, and configure access permissions
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Receptionist
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading reception staff..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Staff Name & Employee ID' },
              { header: 'Assigned Shift' },
              { header: 'Contact Phone' },
              { header: 'Account Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={receptionists}
            emptyMessage="No receptionists found."
            renderRow={(rec) => (
              <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{rec.user?.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{rec.employeeId}</div>
                  <div className="text-[11px] text-slate-500">{rec.user?.email}</div>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                  {rec.shift} Shift
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-700">
                  {rec.user?.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge size="sm">
                    {rec.user?.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => openEditModal(rec)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeactivate(rec._id)}
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Receptionist Staff' : 'Add Receptionist'}
        subtitle="Manage user credentials and shift assignment"
        maxWidth="max-w-md"
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

          <div className="space-y-3 text-xs">
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
                disabled={!!editingStaff}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm disabled:bg-slate-100"
              />
            </div>

            {!editingStaff && (
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
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
                Shift Schedule
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Morning">Morning (08:00 AM – 04:00 PM)</option>
                <option value="Evening">Evening (04:00 PM – 12:00 AM)</option>
                <option value="Night">Night (12:00 AM – 08:00 AM)</option>
                <option value="Rotating">Rotating Shifts</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
