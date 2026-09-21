import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toast } from '../common/Toast';

export const RoleLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  // Determine dynamic title and breadcrumb trail from route
  const pathParts = location.pathname.split('/').filter(Boolean);
  const portalName = pathParts[0] ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Portal';
  const rawTitle = pathParts[pathParts.length - 1] || 'Dashboard';
  const pageTitle = rawTitle
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const breadcrumbs = [
    { label: `${portalName} Portal`, path: `/${pathParts[0] || 'patient'}/dashboard` },
    ...(pathParts.length > 1 ? [{ label: pageTitle, path: location.pathname }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar */}
      <Sidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar
          onOpenSidebar={() => setIsMobileOpen(true)}
          pageTitle={pageTitle}
          breadcrumbs={breadcrumbs}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Real-time Toast Notifications */}
      <Toast />
    </div>
  );
};
