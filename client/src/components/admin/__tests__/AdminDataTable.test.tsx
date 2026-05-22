/**
 * Unit tests untuk AdminDataTable
 *
 * Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.7
 *
 * @vitest-environment happy-dom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminDataTable } from '../AdminDataTable';
import type { Infrastruktur, KategoriInfra } from '../../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buatInfrastruktur(overrides: Partial<Infrastruktur> = {}): Infrastruktur {
  return {
    id: 1,
    nama: 'Infrastruktur Test',
    kategori: 'restoran',
    alamat: 'Jl. Test No. 1',
    fotoUrl: undefined,
    lat: -0.5,
    lng: 100.1,
    idkab: '1306',
    idkec: '1306010',
    iddesa: '1306010001',
    idsls: undefined,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buatKategori(overrides: Partial<KategoriInfra> = {}): KategoriInfra {
  return {
    id: 1,
    value: 'restoran',
    label: 'Restoran',
    icon: '🍽️',
    color: '#FF5733',
    urutan: 1,
    ...overrides,
  };
}

const KATEGORI_LIST: KategoriInfra[] = [
  buatKategori({ id: 1, value: 'restoran',     label: 'Restoran',     urutan: 1 }),
  buatKategori({ id: 2, value: 'kesehatan',    label: 'Kesehatan',    urutan: 2 }),
  buatKategori({ id: 3, value: 'rumah_ibadah', label: 'Rumah Ibadah', urutan: 3 }),
  buatKategori({ id: 4, value: 'pasar',        label: 'Pasar',        urutan: 4 }),
  buatKategori({ id: 5, value: 'toko',         label: 'Toko',         urutan: 5 }),
  buatKategori({ id: 6, value: 'lainnya',      label: 'Lainnya',      urutan: 6 }),
];

const defaultProps = {
  data: [],
  kategoriList: KATEGORI_LIST,
  loading: false,
  total: 0,
  page: 1,
  totalPages: 1,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onPageChange: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdminDataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Req 6.7 — Setiap item di array data menghasilkan tepat satu baris di tabel
  // -------------------------------------------------------------------------

  describe('Req 6.7 — satu baris per item data', () => {
    it('array data kosong → tidak ada baris data di tbody', () => {
      render(<AdminDataTable {...defaultProps} data={[]} />);

      // Empty state ditampilkan, bukan tabel
      expect(screen.getByText(/belum ada data infrastruktur/i)).toBeInTheDocument();
    });

    it('array data dengan 1 item → tepat 1 baris di tabel', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Warung Makan A' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const rows = screen.getAllByRole('row');
      // rows[0] = header row, rows[1] = data row
      expect(rows).toHaveLength(2);
    });

    it('array data dengan 3 item → tepat 3 baris di tabel', () => {
      const data = [
        buatInfrastruktur({ id: 1, nama: 'Warung A' }),
        buatInfrastruktur({ id: 2, nama: 'Klinik B' }),
        buatInfrastruktur({ id: 3, nama: 'Masjid C' }),
      ];
      render(<AdminDataTable {...defaultProps} data={data} total={3} />);

      const rows = screen.getAllByRole('row');
      // rows[0] = header, rows[1..3] = data rows
      expect(rows).toHaveLength(4);
    });

    it('array data dengan 5 item → tepat 5 baris di tabel', () => {
      const data = Array.from({ length: 5 }, (_, i) =>
        buatInfrastruktur({ id: i + 1, nama: `Item ${i + 1}` })
      );
      render(<AdminDataTable {...defaultProps} data={data} total={5} />);

      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(6); // 1 header + 5 data
    });

    it('setiap baris menampilkan nama item yang sesuai', () => {
      const data = [
        buatInfrastruktur({ id: 1, nama: 'Warung Padang' }),
        buatInfrastruktur({ id: 2, nama: 'Puskesmas Lubuk' }),
      ];
      render(<AdminDataTable {...defaultProps} data={data} total={2} />);

      expect(screen.getByText('Warung Padang')).toBeInTheDocument();
      expect(screen.getByText('Puskesmas Lubuk')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 6.4 — Tombol aksi tersembunyi (opacity-0) dan muncul saat hover (group-hover:opacity-100)
  // -------------------------------------------------------------------------

  describe('Req 6.4 — tombol aksi visibility classes', () => {
    it('container tombol aksi memiliki class opacity-0 secara default', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Test Item' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      // Cari container aksi berdasarkan class opacity-0
      const aksiContainer = document.querySelector('.opacity-0');
      expect(aksiContainer).toBeInTheDocument();
    });

    it('container tombol aksi memiliki class group-hover:opacity-100', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Test Item' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      // Cari container aksi berdasarkan class group-hover:opacity-100
      const aksiContainer = document.querySelector('.group-hover\\:opacity-100');
      expect(aksiContainer).toBeInTheDocument();
    });

    it('baris tabel memiliki class group untuk mendukung group-hover', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Test Item' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      // Baris data (bukan header) harus memiliki class 'group'
      const rows = screen.getAllByRole('row');
      const dataRow = rows[1]; // rows[0] = header
      expect(dataRow).toHaveClass('group');
    });

    it('tombol Edit memiliki aria-label yang benar', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Warung Test' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const editButton = screen.getByRole('button', { name: /edit warung test/i });
      expect(editButton).toBeInTheDocument();
    });

    it('tombol Hapus memiliki aria-label yang benar', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Warung Test' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const hapusButton = screen.getByRole('button', { name: /hapus warung test/i });
      expect(hapusButton).toBeInTheDocument();
    });

    it('klik tombol Edit memanggil onEdit dengan item yang benar', () => {
      const onEdit = vi.fn();
      const item = buatInfrastruktur({ id: 42, nama: 'Warung Edit' });
      render(<AdminDataTable {...defaultProps} data={[item]} total={1} onEdit={onEdit} />);

      const editButton = screen.getByRole('button', { name: /edit warung edit/i });
      fireEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(item);
    });

    it('klik tombol Hapus memanggil onDelete dengan id yang benar', () => {
      const onDelete = vi.fn();
      const item = buatInfrastruktur({ id: 99, nama: 'Warung Hapus' });
      render(<AdminDataTable {...defaultProps} data={[item]} total={1} onDelete={onDelete} />);

      const hapusButton = screen.getByRole('button', { name: /hapus warung hapus/i });
      fireEvent.click(hapusButton);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(99);
    });
  });

  // -------------------------------------------------------------------------
  // Req 6.5 — Badge kategori menampilkan warna semantik yang benar per kategori
  // -------------------------------------------------------------------------

  describe('Req 6.5 — badge kategori warna semantik', () => {
    it('kategori "restoran" → badge dengan class bg-orange-50 text-orange-600', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'restoran' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Restoran');
      expect(badge).toHaveClass('bg-orange-50');
      expect(badge).toHaveClass('text-orange-600');
    });

    it('kategori "kesehatan" → badge dengan class bg-blue-50 text-blue-600', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'kesehatan' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Kesehatan');
      expect(badge).toHaveClass('bg-blue-50');
      expect(badge).toHaveClass('text-blue-600');
    });

    it('kategori "rumah_ibadah" → badge dengan class bg-emerald-50 text-emerald-700', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'rumah_ibadah' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Rumah Ibadah');
      expect(badge).toHaveClass('bg-emerald-50');
      expect(badge).toHaveClass('text-emerald-700');
    });

    it('kategori "pasar" → badge dengan class bg-amber-50 text-amber-600', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'pasar' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Pasar');
      expect(badge).toHaveClass('bg-amber-50');
      expect(badge).toHaveClass('text-amber-600');
    });

    it('kategori "toko" → badge dengan class bg-violet-50 text-violet-600', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'toko' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Toko');
      expect(badge).toHaveClass('bg-violet-50');
      expect(badge).toHaveClass('text-violet-600');
    });

    it('kategori "lainnya" → badge dengan class bg-slate-50 text-slate-600', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'lainnya' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Lainnya');
      expect(badge).toHaveClass('bg-slate-50');
      expect(badge).toHaveClass('text-slate-600');
    });

    it('kategori tidak dikenal → fallback bg-slate-50 text-slate-600 (nilai mentah ditampilkan)', () => {
      const kategoriTidakDikenal: KategoriInfra[] = [
        buatKategori({ id: 99, value: 'kategori_baru', label: 'Kategori Baru', urutan: 99 }),
      ];
      const data = [buatInfrastruktur({ id: 1, kategori: 'kategori_baru' })];
      render(
        <AdminDataTable
          {...defaultProps}
          data={data}
          total={1}
          kategoriList={kategoriTidakDikenal}
        />
      );

      const badge = screen.getByText('Kategori Baru');
      expect(badge).toHaveClass('bg-slate-50');
      expect(badge).toHaveClass('text-slate-600');
    });

    it('badge kategori menampilkan ikon SVG (Lucide 14px)', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'restoran' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const badge = screen.getByText('Restoran').closest('span');
      expect(badge).not.toBeNull();
      const svg = badge!.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('kategori tidak ada di kategoriList → menampilkan nilai mentah tanpa badge', () => {
      const data = [buatInfrastruktur({ id: 1, kategori: 'kategori_tidak_ada' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      // Nilai mentah ditampilkan sebagai teks biasa
      expect(screen.getByText('kategori_tidak_ada')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 6.6 — Pagination memanggil onPageChange dengan nomor halaman yang benar
  // -------------------------------------------------------------------------

  describe('Req 6.6 — pagination', () => {
    it('pagination tidak ditampilkan saat totalPages <= 1', () => {
      render(<AdminDataTable {...defaultProps} totalPages={1} page={1} />);

      expect(screen.queryByRole('button', { name: /prev/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });

    it('pagination ditampilkan saat totalPages > 1', () => {
      render(<AdminDataTable {...defaultProps} totalPages={3} page={1} total={60} />);

      expect(screen.getByRole('button', { name: /← prev/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next →/i })).toBeInTheDocument();
    });

    it('klik tombol Next → onPageChange dipanggil dengan page + 1', () => {
      const onPageChange = vi.fn();
      render(
        <AdminDataTable
          {...defaultProps}
          totalPages={3}
          page={1}
          total={60}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next →/i });
      fireEvent.click(nextButton);

      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('klik tombol Prev → onPageChange dipanggil dengan page - 1', () => {
      const onPageChange = vi.fn();
      render(
        <AdminDataTable
          {...defaultProps}
          totalPages={3}
          page={2}
          total={60}
          onPageChange={onPageChange}
        />
      );

      const prevButton = screen.getByRole('button', { name: /← prev/i });
      fireEvent.click(prevButton);

      expect(onPageChange).toHaveBeenCalledTimes(1);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('tombol Prev dinonaktifkan saat page = 1', () => {
      render(<AdminDataTable {...defaultProps} totalPages={3} page={1} total={60} />);

      const prevButton = screen.getByRole('button', { name: /← prev/i });
      expect(prevButton).toBeDisabled();
    });

    it('tombol Next dinonaktifkan saat page = totalPages', () => {
      render(<AdminDataTable {...defaultProps} totalPages={3} page={3} total={60} />);

      const nextButton = screen.getByRole('button', { name: /next →/i });
      expect(nextButton).toBeDisabled();
    });

    it('tombol Prev aktif saat page > 1', () => {
      render(<AdminDataTable {...defaultProps} totalPages={3} page={2} total={60} />);

      const prevButton = screen.getByRole('button', { name: /← prev/i });
      expect(prevButton).not.toBeDisabled();
    });

    it('tombol Next aktif saat page < totalPages', () => {
      render(<AdminDataTable {...defaultProps} totalPages={3} page={2} total={60} />);

      const nextButton = screen.getByRole('button', { name: /next →/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('indikator halaman menampilkan page / totalPages yang benar', () => {
      render(<AdminDataTable {...defaultProps} totalPages={5} page={3} total={100} />);

      // Teks "3 / 5" harus muncul di pagination
      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 6.3 — Baris data memiliki class group dan style yang benar
  // -------------------------------------------------------------------------

  describe('Req 6.3 — style baris data', () => {
    it('setiap baris data memiliki class border-b border-slate-100', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Test' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      expect(dataRow).toHaveClass('border-b');
      expect(dataRow).toHaveClass('border-slate-100');
    });

    it('setiap baris data memiliki class hover:bg-slate-50/50', () => {
      const data = [buatInfrastruktur({ id: 1, nama: 'Test' })];
      render(<AdminDataTable {...defaultProps} data={data} total={1} />);

      const rows = screen.getAllByRole('row');
      const dataRow = rows[1];
      expect(dataRow.className).toContain('hover:bg-slate-50/50');
    });
  });

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  describe('loading state', () => {
    it('saat loading=true, menampilkan skeleton dan bukan tabel', () => {
      render(<AdminDataTable {...defaultProps} loading={true} />);

      // Skeleton: div dengan animate-pulse
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);

      // Tidak ada tabel
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('saat loading=false dan data kosong, menampilkan empty state', () => {
      render(<AdminDataTable {...defaultProps} loading={false} data={[]} />);

      expect(screen.getByText(/belum ada data infrastruktur/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Info baris — total dan halaman
  // -------------------------------------------------------------------------

  describe('info baris', () => {
    it('menampilkan total data yang diformat', () => {
      render(<AdminDataTable {...defaultProps} total={1234} page={1} totalPages={62} />);

      // Format Indonesia: 1.234
      expect(screen.getByText('1.234 data')).toBeInTheDocument();
    });

    it('menampilkan nomor halaman saat ini dan total halaman', () => {
      render(<AdminDataTable {...defaultProps} total={40} page={2} totalPages={2} />);

      expect(screen.getByText('Hal. 2/2')).toBeInTheDocument();
    });
  });
});
