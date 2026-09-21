import React, { useState, useEffect } from 'react';
import { Users, Search, ClipboardList, FileText, Calendar, Plus, Eye } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';
import api from '../../services/api';

export const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Clinical history drawer/modal
  const [selectedPatientHistory, setSelectedPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [patientForRx, setPatientForRx] = useState(null);

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

  const openHistory = async (patient) => {
    try {
      setHistoryLoading(true);
      const res = await api.get(`/patients/${patient._id}/history`);
      if (res.data.success) {
        setSelectedPatientHistory(res.data.data);
      }
    } catch (e) {
      alert(e.message || 'Failed to fetch patient history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Patient Directory & Clinical History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review patient medical records, past consultations, vitals, and issue new prescriptions
          </p>
        </div>
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
        <Loader message="Loading patients..." />
      ) : (
        <div className="space-y-4">
          <Table
            columns={[
              { header: 'Patient Name & ID' },
              { header: 'Gender & Blood Group' },
              { header: 'Contact Phone' },
              { header: 'Allergies on File' },
              { header: 'Actions', className: 'text-right' },
            ]}
            data={patients}
            emptyMessage="No patients found."
            renderRow={(p) => (
              <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{p.user?.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{p.patientId}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-700">
                  {p.gender} • <Badge size="sm">{p.bloodGroup}</Badge>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  {p.user?.phone || 'N/A'}
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  {p.allergies?.length > 0 ? (
                    <span className="text-rose-600 font-medium">
                      {p.allergies.join(', ')}
                    </span>
                  ) : (
                    <span className="text-slate-400">None reported</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => openHistory(p)}
                  >
                    Clinical History
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={FileText}
                    onClick={() => setPatientForRx(p)}
                  >
                    New Rx
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

      {/* Patient History Modal */}
      {selectedPatientHistory && (
        <Modal
          isOpen={!!selectedPatientHistory}
          onClose={() => setSelectedPatientHistory(null)}
          title={`Clinical History: ${selectedPatientHistory.patient?.user?.name}`}
          subtitle={`Patient ID: ${selectedPatientHistory.patient?.patientId} • Blood Group: ${selectedPatientHistory.patient?.bloodGroup}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Medical Records */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-brand-600" />
                Medical Records ({selectedPatientHistory.medicalRecords?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedPatientHistory.medicalRecords?.map((rec) => (
                  <div key={rec._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{rec.diagnosis}</span>
                      <span className="text-slate-400 font-normal">
                        {new Date(rec.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">Treatment: {rec.treatment}</p>
                    {rec.vitals?.bp && (
                      <p className="text-[11px] text-brand-700 mt-1">
                        BP: {rec.vitals.bp} • Pulse: {rec.vitals.pulse} • Temp: {rec.vitals.temperature}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                Prescriptions Issued ({selectedPatientHistory.prescriptions?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedPatientHistory.prescriptions?.map((rx) => (
                  <div key={rx._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{rx.diagnosis}</span>
                      <span className="text-slate-400 font-normal">
                        {new Date(rx.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">
                      Medications: {rx.medicines?.map((m) => `${m.name} (${m.dosage})`).join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Prescription Modal */}
      <PrescriptionModal
        isOpen={!!patientForRx}
        onClose={() => setPatientForRx(null)}
        patientId={patientForRx?._id}
        onSuccess={() => fetchPatients()}
      />
    </div>
  );
};
