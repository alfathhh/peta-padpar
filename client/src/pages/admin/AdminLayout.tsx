import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../../components/ui/Icon';
import { cn } from '../../lib/cn';
import { useAuthStore } from '../../store/authStore';

const NAV: Array<{ to: string; label: string; end: boolean; icon: IconName }> = [
  { to: '/admin', label: 'Dashboard', end: true, icon: 'dashboard' },
  { to: '/admin/infrastruktur', label: 'Infrastruktur', end: false, icon: 'database' },
  { to: '/admin/kategori', label: 'Kategori', end: false, icon: 'tag' },
  { to: '/admin/statistik', label: 'Statistik', end: false, icon: 'chart' },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-60 flex-col bg-white border-r border-neutral-200 transition-transform duration-200 ease-out',
          'lg:static lg:z-auto lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-neutral-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-brand">
            <span className="text-[10px] font-bold text-white">PP</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-neutral-900">Peta Padpar</div>
            <div className="text-[10px] text-neutral-400">Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              )}
            >
              <Icon name={item.icon} className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="border-t border-neutral-100 p-3">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
              <span className="text-[11px] font-semibold text-neutral-600">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-neutral-900">{user?.username || 'Admin'}</div>
              <div className="text-[10px] text-neutral-400">Administrator</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 hover:text-danger-600 transition-colors"
          >
            <Icon name="log-out" className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 h-14 border-b border-neutral-200 bg-white px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 lg:hidden"
            aria-label="Menu"
          >
            <Icon name="menu" className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-semibold text-neutral-900">{title || 'Admin Panel'}</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
