import React, { useState, useEffect } from 'react';
import { FlaskConical, Download, Calendar, FileCheck, Eye } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import api from '../../services/api';

export const MyLabReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const profileRes = await api.get('/auth/me');
        const patientId = profileRes.data.data.profile?._id;
        if (patientId) {
          const res = await api.get(`/lab-reports/${patientId}`);
          if (res.data.success) {
            setReports(res.data.data || []);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return <Loader message="Loading diagnostic lab reports..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Diagnostic & Laboratory Reports
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Access your pathology, hematology, biochemistry, and radiological investigation results
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <Card key={report._id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{report.testName}</h4>
                      <Badge size="sm" className="mt-0.5">
                        {report.category || 'General Pathology'}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4">
                  {report.doctor && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Referred Doctor:</span>
                      <span className="font-semibold text-slate-800">
                        Dr. {report.doctor.user?.name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Attachment:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">
                      {report.fileName || 'Diagnostic-Report.pdf'}
                    </span>
                  </div>
                  {report.notes && (
                    <div className="pt-1.5 border-t border-slate-200/60 text-slate-600">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Findings Note:
                      </span>
                      <p className="mt-0.5 italic">{report.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </a>
                <a
                  href={report.fileUrl}
                  download
                  className="inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none bg-brand-600 hover:bg-brand-700 text-white text-xs px-3 py-1.5 gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FlaskConical}
          title="No lab reports found"
          description="Your pathology and diagnostic investigation reports will appear here once ready."
        />
      )}
    </div>
  );
};
