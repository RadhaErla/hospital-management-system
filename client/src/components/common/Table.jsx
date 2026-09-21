import React from 'react';
import { Loader2 } from 'lucide-react';

export const Table = ({
  columns = [],
  data = [],
  renderRow,
  keyExtractor = (item, index) => item._id || index,
  isLoading = false,
  emptyMessage = 'No records found',
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-soft">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
            {columns.map((col, idx) => (
              <th key={idx} className={`px-5 py-3.5 whitespace-nowrap ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-500 font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                  <span>Loading medical records...</span>
                </div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((item, index) => renderRow(item, index))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400 font-medium"
              >
                <p className="text-sm text-slate-500">{emptyMessage}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
