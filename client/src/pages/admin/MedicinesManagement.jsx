import React, { useState, useEffect } from 'react';
import { Pill, Plus, Search, Edit, Trash2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import api from '../../services/api';

const CATEGORIES = [
  'Antibiotic',
  'Analgesic',
  'Antipyretic',
  'Antihistamine',
  'Antacid',
  'Cardiovascular',
  'Vitamin/Supplement',
  'Other',
];

export const MedicinesManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Analgesic',
    dosageForm: 'Tablet',
    strength: '500mg',
    manufacturer: '',
    stockQuantity: 100,
    unitPrice: 5.0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      let url = `/medicines?page=${page}&limit=10`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      if (res.data.success) {
        setMedicines(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMedicines();
  };

  const openAddModal = () => {
    setEditingMed(null);
    setFormData({
      name: '',
      genericName: '',
      category: 'Analgesic',
      dosageForm: 'Tablet',
      strength: '500mg',
      manufacturer: '',
      stockQuantity: 100,
      unitPrice: 5.0,
    });
    setError('');
    setSuccessMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name || '',
      genericName: med.genericName || '',
      category: med.category || 'Other',
      dosageForm: med.dosageForm || 'Tablet',
      strength: med.strength || '',
      manufacturer: med.manufacturer || '',
      stockQuantity: med.stockQuantity || 0,
      unitPrice: med.unitPrice || 0,
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
      if (editingMed) {
        await api.put(`/medicines/${editingMed._id}`, {
          ...formData,
          stockQuantity: Number(formData.stockQuantity),
          unitPrice: Number(formData.unitPrice),
        });
        setSuccessMsg('Medicine updated successfully!');
      } else {
        await api.post('/medicines', {
          ...formData,
          stockQuantity: Number(formData.stockQuantity),
          unitPrice: Number(formData.unitPrice),
        });
        setSuccessMsg('Medicine added to inventory!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        fetchMedicines();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to save medicine.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      alert(err.message || 'Failed to delete medicine.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pharmacy & Medicine Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track dispensary pharmaceutical stocks, dosage strengths, categories, and unit pricing
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Medicine
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by brand name or generic salt..."
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
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white sm:w-56"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading pharmacy inventory..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Medicine Name & Salt' },
              { header: 'Category & Form' },
              { header: 'Strength' },
              { header: 'Unit Price ($)' },
              { header: 'Stock Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={medicines}
            emptyMessage="No medicines found in inventory."
            renderRow={(med) => {
              const isLowStock = med.stockQuantity < 50;

              return (
                <tr key={med._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{med.name}</div>
                    <div className="text-xs text-slate-500 italic">{med.genericName}</div>
                    <div className="text-[10px] text-slate-400">{med.manufacturer}</div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <div className="font-semibold text-slate-900">{med.category}</div>
                    <div className="text-slate-500">{med.dosageForm}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                    {med.strength || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-700 whitespace-nowrap">
                    ${(med.unitPrice || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        isLowStock
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isLowStock && <AlertTriangle className="w-3.5 h-3.5" />}
                      {med.stockQuantity} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit}
                      onClick={() => openEditModal(med)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(med._id)}
                    >
                      Delete
                    </Button>
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMed ? 'Edit Medicine' : 'Add New Medicine'}
        subtitle="Manage pharmacy inventory item and pricing"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Medicine Brand Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Paracetamol 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Generic Chemical Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acetaminophen"
              value={formData.genericName}
              onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Dosage Form
              </label>
              <select
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Drops</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Strength
              </label>
              <input
                type="text"
                placeholder="500mg"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Stock Qty *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. Pfizer, GSK, Sun Pharma"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {editingMed ? 'Update Medicine' : 'Add Medicine'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
