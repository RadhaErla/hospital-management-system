import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const normalized = String(children || variant).toLowerCase().replace(/[\s-_]/g, '');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['confirmed', 'paid', 'completed', 'success', 'active'].includes(normalized)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['pending', 'inqueue'].includes(normalized)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['checkedin', 'inprogress'].includes(normalized)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['cancelled', 'rejected', 'failed', 'inactive'].includes(normalized)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['doctor', 'cardiology', 'specialist'].includes(normalized)) {
    style = 'bg-teal-50 text-teal-700 border-teal-200';
  } else if (['admin'].includes(normalized)) {
    style = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (['receptionist'].includes(normalized)) {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (['patient'].includes(normalized)) {
    style = 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${sizes[size] || sizes.md} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};
