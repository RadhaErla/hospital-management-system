import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Printer, CreditCard, Banknote, Search, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { CreateBillModal } from '../../components/billing/CreateBillModal';
import { PrintableInvoice } from '../../components/billing/PrintableInvoice';
import { PaymentModal } from '../../components/billing/PaymentModal';
import api from '../../services/api';

export const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      let url = `/bills?page=${page}&limit=10`;
      if (status) url += `&paymentStatus=${status}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBills(res.data.data.items || []);
        setPagination(res.data.data.pagination || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Billing & Invoices Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate hospital invoices, record cash/card counter payments, and print official receipts
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          Generate New Bill
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['', 'Pending', 'Paid', 'Failed', 'Refunded'].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatus(st);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              status === st
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {st || 'All Invoices'}
          </button>
        ))}
      </div>

      {/* Bills Table */}
      {loading ? (
        <Loader message="Loading invoices..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Invoice #' },
              { header: 'Patient Name & ID' },
              { header: 'Date Issued' },
              { header: 'Total Amount' },
              { header: 'Payment Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={bills}
            emptyMessage="No bills found."
            renderRow={(bill) => {
              const isPending = bill.paymentStatus === 'Pending';

              return (
                <tr key={bill._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                    #{bill.invoiceNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {bill.patient?.user?.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      {bill.patient?.patientId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-700 whitespace-nowrap">
                    ${(bill.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge size="sm">{bill.paymentStatus}</Badge>
                    {bill.paymentMethod && (
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        via {bill.paymentMethod}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Printer}
                      onClick={() => setSelectedBillForPrint(bill)}
                    >
                      Print
                    </Button>
                    {isPending && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CreditCard}
                        onClick={() => setSelectedBillForPay(bill)}
                      >
                        Record Payment
                      </Button>
                    )}
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

      {/* Modals */}
      <CreateBillModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchBills()}
      />

      <PrintableInvoice
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
        bill={selectedBillForPrint}
      />

      <PaymentModal
        isOpen={!!selectedBillForPay}
        onClose={() => setSelectedBillForPay(null)}
        bill={selectedBillForPay}
        onSuccess={() => fetchBills()}
      />
    </div>
  );
};
