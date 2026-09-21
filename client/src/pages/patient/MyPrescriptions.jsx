import React, { useState, useEffect } from 'react';
import { FileText, Printer, Calendar, Stethoscope, Eye } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { PrintablePrescription } from '../../components/prescriptions/PrintablePrescription';
import api from '../../services/api';

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get('/auth/me');
        const patientId = profileRes.data.data.profile?._id;
        if (patientId) {
          const res = await api.get(`/prescriptions/${patientId}`);
          if (res.data.success) {
            setPrescriptions(res.data.data || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  if (loading) {
    return <Loader message="Loading your prescriptions..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          My Prescriptions
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Access active medications, dosage frequencies, and printable doctor prescriptions
        </p>
      </div>

      {prescriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <Card key={rx._id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rx.diagnosis}</h3>
                    <p className="text-xs text-brand-600 font-medium">
                      Dr. {rx.doctor?.user?.name} ({rx.doctor?.department?.name || 'Clinic'})
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(rx.date).toLocaleDateString()}
                  </span>
                </div>

                {/* Medicines List Preview */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Prescribed Medications ({rx.medicines?.length || 0})
                  </span>
                  <div className="space-y-1.5">
                    {rx.medicines?.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between border border-slate-200/60"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{med.name}</span>
                          <span className="text-slate-500 ml-1.5">({med.dosage})</span>
                        </div>
                        <span className="text-brand-700 font-medium text-[11px]">
                          {med.frequency} • {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {rx.additionalAdvice && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100 mb-4">
                    "{rx.additionalAdvice}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => setSelectedRx(rx)}
                >
                  Print Prescription
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No prescriptions found"
          description="Your medical prescriptions issued by physicians will be listed here."
        />
      )}

      {/* Printable Modal */}
      <PrintablePrescription
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        prescription={selectedRx}
      />
    </div>
  );
};
