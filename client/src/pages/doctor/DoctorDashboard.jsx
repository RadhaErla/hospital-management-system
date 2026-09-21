import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
  Upload,
  ClipboardList,
  Check,
  X,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { Table } from '../../components/common/Table';
import { PrescriptionModal } from '../../components/prescriptions/PrescriptionModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedAppForRx, setSelectedAppForRx] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, appRes] = await Promise.all([
        api.get('/analytics/doctor'),
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

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchDashboard();
    } catch (err) {
      alert(err.message || 'Failed to update appointment status.');
    }
  };

  if (loading) {
    return <Loader message="Loading physician dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner (Light Healthcare Style) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold">
            <Stethoscope className="w-3.5 h-3.5 text-brand-600" />
            <span>Physician Clinical Workspace</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {user?.name}
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Manage your daily consultation queue, review patient vitals, issue digital prescriptions, and record diagnoses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Clock}
            onClick={() => navigate('/doctor/availability')}
          >
            Manage Schedule
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
          <p className="text-[11px] text-slate-500 mt-1">Scheduled for today</p>
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
          <p className="text-[11px] text-slate-500 mt-1">Requires physician review</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed Consultations
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stats?.completedAppointments || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Visits completed</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {stats?.totalPatients || 0}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Unique patients treated</p>
        </Card>
      </div>

      {/* Today's Appointment Queue */}
      <Card
        title="Today's Consultation Schedule"
        subtitle={`Schedule queue for ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/doctor/appointments')}
          >
            All Appointments →
          </Button>
        }
      >
        <Table
          columns={[
            { header: 'Time Slot' },
            { header: 'Patient Name & ID' },
            { header: 'Reason / Concern' },
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
              <td className="px-5 py-3.5 text-xs text-slate-700 max-w-xs truncate">
                {app.reason}
              </td>
              <td className="px-5 py-3.5 whitespace-nowrap">
                <Badge size="sm">{app.status}</Badge>
              </td>
              <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                {app.status === 'Pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      icon={Check}
                      onClick={() => handleStatusUpdate(app._id, 'Confirmed')}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={X}
                      onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                    >
                      Reject
                    </Button>
                  </>
                )}

                {['Confirmed', 'Checked-In'].includes(app.status) && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={FileText}
                      onClick={() => setSelectedAppForRx(app)}
                    >
                      Prescribe
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={CheckCircle2}
                      onClick={() => handleStatusUpdate(app._id, 'Completed')}
                    >
                      Complete
                    </Button>
                  </>
                )}

                {app.status === 'Completed' && (
                  <span className="text-xs text-emerald-600 font-medium">Completed</span>
                )}
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Prescription Creation Modal */}
      <PrescriptionModal
        isOpen={!!selectedAppForRx}
        onClose={() => setSelectedAppForRx(null)}
        appointment={selectedAppForRx}
        onSuccess={() => fetchDashboard()}
      />
    </div>
  );
};
