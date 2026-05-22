import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  React.useEffect(() => {
    document.title = 'Halaman Tidak Ditemukan — Peta Tematik Padang Pariaman';
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mx-auto">
          <span className="text-6xl select-none" role="img" aria-label="Peta">🗺️</span>
        </div>
        <div className="absolute -top-1 -right-1 w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-white shadow-soft">
          <span className="text-xl font-bold text-yellow-600">?</span>
        </div>
      </div>
      <h1 className="font-display font-bold text-6xl text-neutral-900 mb-3">404</h1>
      <h2 className="font-display font-semibold text-xl text-neutral-700 mb-3">Halaman Tidak Ditemukan</h2>
      <p className="text-sm text-neutral-500 max-w-sm mb-8">
        Sepertinya Anda tersesat di peta. Halaman yang Anda cari tidak ada atau sudah dipindahkan.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/" className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
          ← Kembali ke Peta
        </Link>
        <button type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center h-10 px-6 rounded-xl border border-neutral-200 text-neutral-700 text-sm font-medium hover:bg-neutral-100 transition-colors">
          Halaman Sebelumnya
        </button>
      </div>
      <p className="mt-12 text-xs text-neutral-400">Peta Tematik Interaktif Kabupaten Padang Pariaman</p>
    </div>
  );
}
