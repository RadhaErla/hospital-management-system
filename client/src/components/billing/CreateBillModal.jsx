import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const CreateBillModal = ({ isOpen, onClose, onSuccess, initialPatientId = '' }) => {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(initialPatientId);
  const [doctorFee, setDoctorFee] = useState(0);
  const [labCharges, setLabCharges] = useState(0);
  const [medicineCharges, setMedicineCharges] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch patients
  useEffect(() => {
    if (!isOpen) return;
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients?limit=100');
        if (res.data.success) {
          setPatients(res.data.data.items || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPatients();
  }, [isOpen]);

  // Compute total amount live
  const itemsTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const subtotal =
    Number(doctorFee || 0) +
    Number(labCharges || 0) +
    Number(medicineCharges || 0) +
    Number(otherCharges || 0) +
    itemsTotal;
  const totalAmount = Math.max(0, subtotal - Number(discount || 0) + Number(tax || 0));

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, val) => {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/bills', {
        patientId,
        doctorFee: Number(doctorFee),
        labCharges: Number(labCharges),
        medicineCharges: Number(medicineCharges),
        otherCharges: Number(otherCharges),
        items,
        discount: Number(discount),
        tax: Number(tax),
        notes,
      });

      if (res.data.success) {
        setSuccessMsg('Bill generated successfully!');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Patient Bill"
      subtitle="Calculate clinical charges, diagnostic fees, pharmacy items, and tax"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Patient *
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            required
          >
            <option value="">-- Choose Patient --</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.user?.name} ({p.patientId}) - {p.user?.phone || 'No phone'}
              </option>
            ))}
          </select>
        </div>

        {/* Core Charges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Doctor Fee ($)
            </label>
            <input
              type="number"
              min="0"
              value={doctorFee}
              onChange={(e) => setDoctorFee(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Lab Charges ($)
            </label>
            <input
              type="number"
              min="0"
              value={labCharges}
              onChange={(e) => setLabCharges(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Medicine ($)
            </label>
            <input
              type="number"
              min="0"
              value={medicineCharges}
              onChange={(e) => setMedicineCharges(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Other Charges ($)
            </label>
            <input
              type="number"
              min="0"
              value={otherCharges}
              onChange={(e) => setOtherCharges(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* Dynamic Extra Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Additional Itemized Line Items
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Item description (e.g. ECG, Dressing, Nursing)"
                  value={item.description}
                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  required
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={item.amount}
                  onChange={(e) => handleItemChange(idx, 'amount', e.target.value)}
                  className="w-28 px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Discount & Tax */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Discount ($)
            </label>
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Tax / VAT ($)
            </label>
            <input
              type="number"
              min="0"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300"
            />
          </div>
        </div>

        {/* Live Total Banner */}
        <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-brand-800 font-semibold uppercase tracking-wider">
              Total Invoice Amount
            </span>
            <p className="text-xs text-brand-600">Subtotal: ${subtotal.toFixed(2)}</p>
          </div>
          <span className="text-2xl font-black text-brand-800">${totalAmount.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={loading}>
            Generate & Issue Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
};
