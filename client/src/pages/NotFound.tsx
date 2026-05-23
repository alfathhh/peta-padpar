import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  React.useEffect(() => {
    document.title = 'Halaman Tidak Ditemukan — Peta Tematik Padang Pariaman';
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
      <p className="text-7xl font-bold text-neutral-200 mb-4">404</p>
      <h1 className="text-xl font-semibold text-neutral-900 mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-sm text-neutral-500 max-w-sm mb-8">
        Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center h-9 px-4 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Kembali ke Peta
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center h-9 px-4 rounded-lg border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
        >
          Halaman Sebelumnya
        </button>
      </div>
    </div>
  );
}
