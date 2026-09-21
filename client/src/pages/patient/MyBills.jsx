import React, { useState, useEffect } from 'react';
import { Receipt, CreditCard, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { PrintableInvoice } from '../../components/billing/PrintableInvoice';
import { PaymentModal } from '../../components/billing/PaymentModal';
import api from '../../services/api';

export const MyBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bills');
      if (res.data.success) {
        setBills(res.data.data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  if (loading) {
    return <Loader message="Loading invoices & billing statements..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Billing & Invoices
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review consultation fees, laboratory test charges, itemized statements, and payment receipts
        </p>
      </div>

      {bills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bills.map((bill) => {
            const isPending = bill.paymentStatus === 'Pending';

            return (
              <Card key={bill._id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        #{bill.invoiceNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Issued on {new Date(bill.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge size="sm">{bill.paymentStatus}</Badge>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Fee:</span>
                      <span className="font-semibold text-slate-800">
                        ${(bill.doctorFee || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Lab & Diagnostics:</span>
                      <span className="font-semibold text-slate-800">
                        ${(bill.labCharges || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pharmacy & Medicines:</span>
                      <span className="font-semibold text-slate-800">
                        ${(bill.medicineCharges || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                      <span>Total Amount:</span>
                      <span className="text-brand-700">${(bill.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={() => setSelectedBillForPrint(bill)}
                  >
                    View Invoice
                  </Button>
                  {isPending && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CreditCard}
                      onClick={() => setSelectedBillForPay(bill)}
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No bills found"
          description="Your invoices and statements will appear here after billing."
        />
      )}

      {/* Printable Invoice Modal */}
      <PrintableInvoice
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
        bill={selectedBillForPrint}
      />

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={!!selectedBillForPay}
        onClose={() => setSelectedBillForPay(null)}
        bill={selectedBillForPay}
        onSuccess={() => fetchBills()}
      />
    </div>
  );
};
