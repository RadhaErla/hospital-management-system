import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Printer, Activity, Pill } from 'lucide-react';

export const PrintablePrescription = ({ isOpen, onClose, prescription }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const doctorName = prescription.doctor?.user?.name || 'Medical Specialist';
  const doctorQualifications = prescription.doctor?.qualifications?.join(', ') || 'MBBS';
  const departmentName = prescription.doctor?.department?.name || 'Clinical Care';
  const patientName = prescription.patient?.user?.name || 'Patient';
  const patientId = prescription.patient?.patientId || 'N/A';
  const rxDate = new Date(prescription.date || prescription.createdAt).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Prescription"
      subtitle={`Prescription Issued on ${rxDate}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full no-print">
          <span className="text-xs text-slate-400">Click print to generate physical or PDF copy</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={handlePrint}>
              Print Prescription
            </Button>
          </div>
        </div>
      }
    >
      <div id="printable-area" className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-800">
        {/* Hospital Letterhead Header */}
        <div className="flex items-start justify-between border-b-2 border-brand-600 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                AuraHealth General Hospital & Medical Center
              </h2>
              <p className="text-xs text-slate-500">
                100 Health Sciences Plaza, NY 10001 • Tel: +1 (800) 555-0199 • support@aurahealth.com
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-brand-50 border border-brand-200 text-brand-800 rounded-lg text-xs font-bold uppercase tracking-wider">
              Official Rx
            </span>
          </div>
        </div>

        {/* Doctor & Patient Information Banner */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 uppercase font-semibold block tracking-wider">
              Attending Physician
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{doctorName}</p>
            <p className="text-slate-600">{doctorQualifications}</p>
            <p className="text-brand-700 font-medium">{departmentName}</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold block tracking-wider">
              Patient Information
            </span>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{patientName}</p>
            <p className="text-slate-600">Patient ID: <span className="font-semibold text-slate-800">{patientId}</span></p>
            <p className="text-slate-600">Date of Prescription: {rxDate}</p>
          </div>
        </div>

        {/* Clinical Diagnosis */}
        <div className="border-l-4 border-brand-600 pl-3 py-1">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Clinical Diagnosis
          </span>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {prescription.diagnosis}
          </p>
        </div>

        {/* Prescription Rx Symbol & Medicines Table */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-serif font-black text-brand-700 italic">℞</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Prescribed Medications
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescription.medicines?.map((med, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-500">{index + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{med.name}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{med.dosage}</td>
                    <td className="py-2.5 px-3 text-brand-700 font-medium">{med.frequency}</td>
                    <td className="py-2.5 px-3 text-slate-700">{med.duration}</td>
                    <td className="py-2.5 px-3 text-slate-600">{med.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Advice & Follow-up */}
        {prescription.additionalAdvice && (
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900">
            <span className="font-bold block mb-1">Clinical Advice & Instructions:</span>
            <p>{prescription.additionalAdvice}</p>
          </div>
        )}

        {/* Signature & Seal */}
        <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-500">
          <div>
            <p>Generated by AuraHealth Electronic Prescription System</p>
            <p className="text-[10px] text-slate-400">Valid without physical stamp if digitally verified</p>
          </div>
          <div className="text-center">
            <div className="w-44 border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-800 font-semibold">
              {doctorName}
            </div>
            <p className="text-[11px] font-semibold text-slate-700">Authorized Physician Signature</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
