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
    <div className="flex min-h-screen bg-neutral-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200/60 bg-white shadow-soft transition-transform duration-250',
          'lg:static lg:z-auto lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 border-b border-neutral-100 px-5 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-brand">
            <span className="select-none text-sm font-bold text-white">PP</span>
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-bold text-neutral-900">Admin Panel</div>
            <div className="truncate text-[10px] text-neutral-400">Padang Pariaman</div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'border-l-[3px] border-primary-500 bg-primary-50 pl-[9px] text-primary-700'
                  : 'border-l-[3px] border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              )}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-100 p-3">
          <div className="mb-1 flex items-center gap-3 px-3 py-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
              <span className="text-xs font-bold text-primary-700">{user?.username?.[0]?.toUpperCase() || 'A'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-neutral-900">{user?.username || 'Admin'}</div>
              <div className="text-[10px] text-neutral-400">Administrator</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-danger-600 transition-colors hover:bg-danger-50 focus:outline-none focus-visible:shadow-focus"
          >
            <Icon name="log-out" className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200/60 bg-white px-4 py-3 shadow-soft lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 lg:hidden"
          >
            <Icon name="menu" className="h-4 w-4" />
            <span>Menu</span>
          </button>
          <h1 className="font-display text-sm font-semibold text-neutral-900">{title || 'Admin Panel'}</h1>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6 lg:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
