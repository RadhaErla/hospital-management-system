import React from 'react';
import { Activity, Loader2 } from 'lucide-react';

export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-brand-50 border border-brand-100 shadow-sm">
        <Activity className="w-7 h-7 text-brand-600 animate-pulse" />
        <span className="absolute inset-0 rounded-2xl border-2 border-brand-400 border-t-transparent animate-spin"></span>
      </div>
      <p className="text-sm font-medium text-slate-600 tracking-wide">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
