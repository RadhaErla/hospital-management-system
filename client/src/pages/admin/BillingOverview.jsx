import React, { useState, useEffect } from 'react';
import { Receipt, Printer, CreditCard, Filter, Download } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { PrintableInvoice } from '../../components/billing/PrintableInvoice';
import api from '../../services/api';

export const BillingOverview = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedBillForPrint, setSelectedBillForPrint] = useState(null);

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

  const handleStatusOverride = async (billId, newStatus) => {
    try {
      await api.put(`/bills/${billId}/payment`, {
        paymentStatus: newStatus,
        paymentMethod: 'Cash',
      });
      fetchBills();
    } catch (err) {
      alert(err.message || 'Failed to update billing status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Hospital Billing & Revenue Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit hospital invoices, review fee breakdowns, and override payment settlement statuses
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
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
        <Loader message="Loading financial records..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Invoice #' },
              { header: 'Patient Name & ID' },
              { header: 'Breakdown' },
              { header: 'Total ($)' },
              { header: 'Status' },
              { header: 'Override Status' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={bills}
            emptyMessage="No invoices found."
            renderRow={(bill) => (
              <tr key={bill._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                  #{bill.invoiceNumber}
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{bill.patient?.user?.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{bill.patient?.patientId}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  <span>Doc: ${bill.doctorFee || 0}</span> •{' '}
                  <span>Lab: ${bill.labCharges || 0}</span> •{' '}
                  <span>Med: ${bill.medicineCharges || 0}</span>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={bill.paymentStatus}
                    onChange={(e) => handleStatusOverride(bill._id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={() => setSelectedBillForPrint(bill)}
                  >
                    Print
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

      {/* Printable Invoice Modal */}
      <PrintableInvoice
        isOpen={!!selectedBillForPrint}
        onClose={() => setSelectedBillForPrint(null)}
        bill={selectedBillForPrint}
      />
    </div>
  );
};
