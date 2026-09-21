import React, { useState, useEffect } from 'react';
import { ClipboardList, Activity, Heart, Thermometer, User, Calendar } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const MyMedicalRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get('/auth/me');
        const patientId = profileRes.data.data.profile?._id;
        if (patientId) {
          const res = await api.get(`/medical-records/${patientId}`);
          if (res.data.success) {
            setRecords(res.data.data || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) {
    return <Loader message="Loading your medical records..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Electronic Medical Records (EMR)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Your complete clinical history, attending physician diagnoses, and recorded vitals
        </p>
      </div>

      {records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record._id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{record.diagnosis}</h3>
                  <p className="text-xs text-brand-600 font-medium mt-0.5">
                    Consultant: Dr. {record.doctor?.user?.name} ({record.doctor?.department?.name || 'Specialist'})
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-semibold block tracking-wider mb-1">
                    Symptoms Presented
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {record.symptoms}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold block tracking-wider mb-1">
                    Treatment & Therapy Plan
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {record.treatment}
                  </p>
                </div>
              </div>

              {/* Vitals Recorded */}
              {record.vitals && Object.values(record.vitals).some(Boolean) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider block mb-2">
                    Vitals Recorded at Visit
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {record.vitals.bp && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                          <span className="font-bold text-slate-800">{record.vitals.bp}</span>
                        </div>
                      </div>
                    )}
                    {record.vitals.pulse && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-500" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                          <span className="font-bold text-slate-800">{record.vitals.pulse}</span>
                        </div>
                      </div>
                    )}
                    {record.vitals.temperature && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-amber-500" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Temperature</span>
                          <span className="font-bold text-slate-800">{record.vitals.temperature}</span>
                        </div>
                      </div>
                    )}
                    {record.vitals.weight && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="text-[10px] text-slate-400 block">Weight</span>
                          <span className="font-bold text-slate-800">{record.vitals.weight}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No medical records found"
          description="Your medical records will appear here after your clinical consultations."
        />
      )}
    </div>
  );
};
