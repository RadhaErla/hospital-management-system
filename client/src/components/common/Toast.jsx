import React from 'react';
import { Bell, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const Toast = () => {
  const { latestToast, setLatestToast } = useNotification();
  const navigate = useNavigate();

  if (!latestToast) return null;

  const handleClick = () => {
    if (latestToast.link) {
      navigate(latestToast.link);
    }
    setLatestToast(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3 p-4 bg-white border border-brand-200 rounded-xl shadow-xl shadow-brand-900/10">
        <div className="flex-shrink-0 p-2 rounded-lg bg-brand-50 text-brand-600">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1 cursor-pointer" onClick={handleClick}>
          <h4 className="text-sm font-semibold text-slate-900">{latestToast.title}</h4>
          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{latestToast.message}</p>
          {latestToast.link && (
            <span className="inline-block text-[11px] font-medium text-brand-600 hover:underline mt-1">
              View Details →
            </span>
          )}
        </div>
        <button
          onClick={() => setLatestToast(null)}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
