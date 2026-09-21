import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  UserPlus,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Receipt,
  UserCheck,
  Building2,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { BookingModal } from '../../components/appointments/BookingModal';
import { CreateBillModal } from '../../components/billing/CreateBillModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedPatientForBill, setSelectedPatientForBill] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, appRes] = await Promise.all([
        api.get('/analytics/receptionist'),
        api.get(`/appointments?date=${new Date().toISOString().split('T')[0]}`),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (appRes.data.success) setTodayAppointments(appRes.data.data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: 'Checked-In' });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to check in patient.');
    }
  };

  if (loading) {
    return <Loader message="Loading front desk dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner (Light Healthcare Style) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>Front Desk & Patient Services</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Front Desk Portal — {user?.name}
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Register arriving patients, manage daily check-in queues, coordinate physician visits, and collect payments.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            icon={UserPlus}
            onClick={() => navigate('/receptionist/patients')}
          >
            Register Patient
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsBookingOpen(true)}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Visits
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stats?.todayAppointments || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Consultations scheduled today</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Checked-In
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stats?.checkedInPatients || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Waiting or in consultation</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Confirmation
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stats?.pendingAppointments || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Require doctor confirmation</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Invoices
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stats?.pendingPayments || 0}
          </h3>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Awaiting settlement</p>
        </Card>
      </div>

      {/* Today's Queue Table */}
      <Card
        title="Patient Arrival Queue & Check-In"
        subtitle={`Live queue for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/receptionist/appointments')}
          >
            All Appointments →
          </Button>
        }
      >
        <Table
          columns={[
            { header: 'Slot' },
            { header: 'Patient Name & ID' },
            { header: 'Assigned Physician' },
            { header: 'Status' },
            { header: 'Actions', className: 'text-right' },
          ]}
          data={todayAppointments}
          emptyMessage="No consultations scheduled for today."
          renderRow={(app) => (
            <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
              <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                {app.timeSlot?.startTime} – {app.timeSlot?.endTime}
              </td>
              <td className="px-5 py-3.5">
                <div className="font-semibold text-slate-900">{app.patient?.user?.name}</div>
                <div className="text-xs text-slate-400 font-mono">{app.patient?.patientId}</div>
              </td>
              <td className="px-5 py-3.5 text-xs">
                <div className="font-semibold text-slate-900">Dr. {app.doctor?.user?.name}</div>
                <div className="text-slate-500">{app.doctor?.roomNumber || 'Room 101'}</div>
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap">
                <Badge size="sm">{app.status}</Badge>
              </td>
              <td className="px-5 py-3.5 text-right space-x-2 whitespace-nowrap">
                {['Pending', 'Confirmed'].includes(app.status) && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={UserCheck}
                    onClick={() => handleCheckIn(app._id)}
                  >
                    Check In
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Receipt}
                  onClick={() => {
                    setSelectedPatientForBill(app.patient?._id);
                    setIsBillOpen(true);
                  }}
                >
                  Generate Bill
                </Button>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => fetchDashboard()}
      />

      {/* Bill Creation Modal */}
      <CreateBillModal
        isOpen={isBillOpen}
        onClose={() => {
          setIsBillOpen(false);
          setSelectedPatientForBill('');
        }}
        initialPatientId={selectedPatientForBill}
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
};
