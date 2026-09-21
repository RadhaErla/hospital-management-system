import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CreditCard, Banknote, QrCode, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export const PaymentModal = ({ isOpen, onClose, bill, onSuccess }) => {
  const [method, setMethod] = useState('Online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!bill) return null;

  const handleProcessPayment = async () => {
    setError('');
    setSuccessMsg('');

    try {
      setLoading(true);
      const res = await api.put(`/bills/${bill._id}/payment`, {
        paymentStatus: 'Paid',
        paymentMethod: method,
        paymentDetails: {
          processedAt: new Date(),
          channel: method === 'Online' ? 'Sandbox Payment Gateway' : 'Front Desk Counter',
        },
      });

      if (res.data.success) {
        setSuccessMsg(`Payment of $${bill.totalAmount} completed via ${method}!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(res.data.data);
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Payment"
      subtitle={`Invoice #${bill.invoiceNumber} • Amount Due: $${bill.totalAmount}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
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

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            Total Payable Amount
          </span>
          <h2 className="text-3xl font-black text-brand-700 mt-1">${bill.totalAmount}</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'Online', label: 'Online Sandbox', icon: Globe },
              { id: 'Card', label: 'Credit/Debit Card', icon: CreditCard },
              { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
              { id: 'Cash', label: 'Cash at Desk', icon: Banknote },
            ].map((pm) => {
              const Icon = pm.icon;
              const isSelected = method === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setMethod(pm.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 text-brand-800 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 text-brand-600" />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {method === 'Online' && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
            <p className="font-semibold">Sandbox Test Gateway Active</p>
            <p className="text-[11px] text-teal-700 mt-0.5">
              Clicking Confirm will simulate a secure digital transaction without transferring real funds.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProcessPayment} isLoading={loading}>
            Confirm & Pay ${bill.totalAmount}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
