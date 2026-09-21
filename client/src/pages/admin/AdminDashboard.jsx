import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  History,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import {
  RevenueChart,
  AppointmentsChart,
  DepartmentShareChart,
  StatusDistributionChart,
} from '../../components/charts/AnalyticsCharts';
import api from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/admin');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <Loader message="Loading hospital analytics & operational data..." />;
  }

  const counts = stats?.counts || {};
  const charts = stats?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Executive Hospital Administration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time clinical operations, department performance, revenue collections, and appointment tracking
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            ${(counts.totalRevenue || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Settled Collections
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Patients
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {counts.totalPatients || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Registered health records</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Medical Doctors
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mt-2">
            {counts.totalDoctors || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Active licensed specialists</p>
        </Card>

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
            {counts.totalAppointments || 0}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {counts.completedAppointments || 0} completed visits
          </p>
        </Card>
      </div>

      {/* Recharts Analytics: 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={charts.revenueByMonth || []} />
        <AppointmentsChart data={charts.appointmentsByMonth || []} />
        <DepartmentShareChart data={charts.patientsByDepartment || []} />
        <StatusDistributionChart data={charts.statusDistribution || []} />
      </div>
    </div>
  );
};
