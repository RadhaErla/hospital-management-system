import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  ClipboardList,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { BookingModal } from '../../components/appointments/BookingModal';
import { PrintablePrescription } from '../../components/prescriptions/PrintablePrescription';
import { PrintableInvoice } from '../../components/billing/PrintableInvoice';
import { PaymentModal } from '../../components/billing/PaymentModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [billToPay, setBillToPay] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/patient');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <Loader message="Loading your health portal..." />;
  }

  const nextApp = stats?.nextAppointment;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-700 via-teal-700 to-slate-900 rounded-3xl text-white shadow-xl shadow-brand-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-300">
            Patient Health Dashboard
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
            Access your consultation schedule, digital prescriptions, laboratory diagnostics, and invoices.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button
            size="lg"
            variant="secondary"
            icon={Plus}
            onClick={() => setIsBookingOpen(true)}
            className="shadow-lg"
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Appointments
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalAppointments || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Consultations to date</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Visits
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {stats?.pendingAppointments || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting confirmation</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Outstanding Invoices
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {stats?.outstandingBillsCount || 0}
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
            ${stats?.outstandingBalance || 0} balance due
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Medical Records
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {stats?.recentRecords?.length || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Clinical entries logged</p>
        </Card>
      </div>

      {/* Next Upcoming Appointment Banner */}
      {nextApp ? (
        <Card
          title="Upcoming Appointment"
          subtitle="Your next confirmed or pending consultation"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/patient/appointments')}
            >
              Manage Appointments
            </Button>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-base flex-shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Dr. {nextApp.doctor?.user?.name}
                  </h4>
                  <Badge size="sm">{nextApp.status}</Badge>
                </div>
                <p className="text-xs text-brand-700 font-medium">
                  {nextApp.doctor?.department?.name || 'Specialist'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Reason: {nextApp.reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Date</span>
                <span className="font-bold text-slate-900">{nextApp.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Time Slot</span>
                <span className="font-bold text-slate-900">
                  {nextApp.timeSlot?.startTime} - {nextApp.timeSlot?.endTime}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center border-dashed">
          <h4 className="text-sm font-bold text-slate-800">No Upcoming Appointments</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            You don't have any pending visits scheduled.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsBookingOpen(true)}>
            Schedule New Visit
          </Button>
        </Card>
      )}

      {/* Two Column Grid: Recent Prescriptions & Medical Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Prescriptions */}
        <Card
          title="Recent Prescriptions"
          subtitle="Issued by attending physicians"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient/prescriptions')}
            >
              View All →
            </Button>
          }
        >
          {stats?.recentPrescriptions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentPrescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">
                        {rx.diagnosis}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Dr. {rx.doctor?.user?.name} • {rx.medicines?.length || 0} medications
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrescription(rx)}
                  >
                    View Rx
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No prescriptions issued yet.</p>
          )}
        </Card>

        {/* Recent Medical Records */}
        <Card
          title="Recent Medical Records"
          subtitle="Clinical EMR history & vitals"
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/patient/records')}
            >
              View All →
            </Button>
          }
        >
          {stats?.recentRecords?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentRecords.map((rec) => (
                <div
                  key={rec._id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-xs font-bold text-slate-900">{rec.diagnosis}</h5>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rec.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{rec.treatment}</p>
                  {rec.vitals?.bp && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                      <span className="px-1.5 py-0.5 bg-slate-100 rounded">BP: {rec.vitals.bp}</span>
                      {rec.vitals.pulse && (
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded">
                          Pulse: {rec.vitals.pulse}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No medical records on file.</p>
          )}
        </Card>
      </div>

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => fetchStats()}
      />

      <PrintablePrescription
        isOpen={!!selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />

      <PrintableInvoice
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
      />

      <PaymentModal
        isOpen={!!billToPay}
        onClose={() => setBillToPay(null)}
        bill={billToPay}
        onSuccess={() => fetchStats()}
      />
    </div>
  );
};
