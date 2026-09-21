import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Printer, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const PrintableInvoice = ({ isOpen, onClose, bill }) => {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(bill.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const patientName = bill.patient?.user?.name || 'Patient';
  const patientEmail = bill.patient?.user?.email || '';
  const patientPhone = bill.patient?.user?.phone || '';
  const patientId = bill.patient?.patientId || 'N/A';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hospital Invoice & Receipt"
      subtitle={`Invoice #${bill.invoiceNumber}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <span className="text-xs text-slate-400">Click print to generate physical or PDF invoice</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={handlePrint}>
              Print Invoice
            </Button>
          </div>
        </div>
      }
    >
      <div id="printable-area" className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-brand-600 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                AuraHealth General Hospital
              </h2>
              <p className="text-xs text-slate-500">
                100 Health Sciences Plaza, NY 10001 • Billing & Accounts Department
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-black text-slate-900">INVOICE</h3>
            <p className="text-xs font-semibold text-brand-700">#{bill.invoiceNumber}</p>
            <p className="text-xs text-slate-500 mt-1">Date: {invoiceDate}</p>
          </div>
        </div>

        {/* Billed To & Payment Status */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold block tracking-wider">
              Billed To
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{patientName}</p>
            <p className="text-slate-600">Patient ID: <span className="font-semibold text-slate-800">{patientId}</span></p>
            {patientEmail && <p className="text-slate-600">{patientEmail}</p>}
            {patientPhone && <p className="text-slate-600">{patientPhone}</p>}
          </div>
          <div className="text-right">
            <span className="text-slate-400 uppercase font-semibold block tracking-wider mb-1">
              Payment Status
            </span>
            <Badge size="lg">{bill.paymentStatus}</Badge>
            <p className="text-slate-600 mt-2">
              Payment Method:{' '}
              <span className="font-semibold text-slate-800">{bill.paymentMethod || 'Pending'}</span>
            </p>
            {bill.paidAt && (
              <p className="text-emerald-700 font-medium mt-0.5">
                Paid on: {new Date(bill.paidAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bill.doctorFee > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      Physician Consultation Fee
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">${bill.doctorFee.toFixed(2)}</td>
                  </tr>
                )}
                {bill.labCharges > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      Laboratory & Diagnostic Pathology Charges
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">${bill.labCharges.toFixed(2)}</td>
                  </tr>
                )}
                {bill.medicineCharges > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      Dispensary & Pharmacy Medications
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">${bill.medicineCharges.toFixed(2)}</td>
                  </tr>
                )}
                {bill.otherCharges > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      Administrative & Nursing Services
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium">${bill.otherCharges.toFixed(2)}</td>
                  </tr>
                )}
                {bill.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{item.description}</td>
                    <td className="py-2.5 px-4 text-right font-medium">${Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Calculation */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">
                $
                {(
                  (bill.doctorFee || 0) +
                  (bill.labCharges || 0) +
                  (bill.medicineCharges || 0) +
                  (bill.otherCharges || 0) +
                  (bill.items?.reduce((sum, it) => sum + Number(it.amount), 0) || 0)
                ).toFixed(2)}
              </span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-${Number(bill.discount).toFixed(2)}</span>
              </div>
            )}
            {bill.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Levies:</span>
                <span>+${Number(bill.tax).toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Payable:</span>
              <span className="text-brand-700 text-base">${Number(bill.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <p>Questions? Contact accounts at billing@aurahealth.com</p>
          <span className="font-semibold text-slate-700">Thank you for trusting AuraHealth</span>
        </div>
      </div>
    </Modal>
  );
};
