import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/Toast';

const ClientMap          = React.lazy(() => import('./pages/ClientMap'));
const Login              = React.lazy(() => import('./pages/admin/Login'));
const Dashboard          = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminKategori      = React.lazy(() => import('./pages/admin/Kategori'));
const AdminInfrastruktur = React.lazy(() => import('./pages/admin/Infrastruktur'));
const AdminStatistik     = React.lazy(() => import('./pages/admin/Statistik'));
const NotFound           = React.lazy(() => import('./pages/NotFound'));

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-neutral-500 font-medium">Memuat halaman...</p>
      </div>
    </div>
  );
}

interface ErrorBoundaryState { hasError: boolean; }
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <div className="bg-white rounded-2xl shadow-pop p-8 max-w-sm w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="font-display font-semibold text-xl text-neutral-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-sm text-neutral-500 mb-6">Halaman mengalami error yang tidak terduga.</p>
            <button onClick={() => window.location.reload()} className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PublicAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <React.Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<ClientMap />} />
              <Route path="/admin/login" element={<PublicAdminRoute><Login /></PublicAdminRoute>} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/kategori" element={<ProtectedRoute><AdminKategori /></ProtectedRoute>} />
              <Route path="/admin/infrastruktur" element={<ProtectedRoute><AdminInfrastruktur /></ProtectedRoute>} />
              <Route path="/admin/statistik" element={<ProtectedRoute><AdminStatistik /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
