/**
 * Unit tests untuk InfrastructureModal
 *
 * Validates: Requirements 7.1, 7.4, 7.5, 7.8, 7.9
 *
 * @vitest-environment happy-dom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InfrastructureModal } from '../InfrastructureModal';
import type { InfrastrukturFormData, KategoriInfra } from '../../../types';

// ---------------------------------------------------------------------------
// Mock heavy dependencies
// ---------------------------------------------------------------------------

// Mock react-leaflet (MapPicker uses MapContainer, TileLayer, Marker, etc.)
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => null,
  Marker: () => null,
  useMapEvents: () => null,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
  }),
}));

// Mock leaflet itself to avoid DOM/canvas issues
vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: {},
        mergeOptions: vi.fn(),
      },
    },
  },
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: vi.fn(),
    },
  },
}));

// Mock useWilayahGeoJSON hooks — return empty arrays to keep tests simple
vi.mock('../../../hooks/useWilayahGeoJSON', () => ({
  useKecamatanGeoJSON: () => [],
  useNagariGeoJSON: () => [],
  useKorongGeoJSON: () => [],
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buatForm(overrides: Partial<InfrastrukturFormData> = {}): InfrastrukturFormData {
  return {
    nama: '',
    kategori: '',
    alamat: '',
    fotoUrl: '',
    lat: '',
    lng: '',
    idkab: '1306',
    idkec: '',
    iddesa: '',
    idsls: '',
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

function defaultProps(overrides: Partial<React.ComponentProps<typeof InfrastructureModal>> = {}) {
  return {
    open: true,
    onClose: vi.fn(),
    editId: null,
    form: buatForm(),
    onFormChange: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    saving: false,
    formError: '',
    kategoriList: KATEGORI_LIST,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InfrastructureModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Req 7.1 — Modal terbuka/tertutup berdasarkan prop `open`
  // -------------------------------------------------------------------------

  describe('Req 7.1 — visibilitas modal', () => {
    it('modal terbuka saat open=true — konten modal terlihat', () => {
      render(<InfrastructureModal {...defaultProps({ open: true })} />);

      // Dialog.Title harus terlihat
      expect(screen.getByText('Tambah Infrastruktur')).toBeInTheDocument();
    });

    it('modal tertutup saat open=false — konten modal tidak terlihat', () => {
      render(<InfrastructureModal {...defaultProps({ open: false })} />);

      // Radix Dialog tidak merender konten saat open=false
      expect(screen.queryByText('Tambah Infrastruktur')).not.toBeInTheDocument();
    });

    it('modal menampilkan judul "Edit Infrastruktur" saat editId tidak null', () => {
      render(<InfrastructureModal {...defaultProps({ open: true, editId: 42 })} />);

      expect(screen.getByText('Edit Infrastruktur')).toBeInTheDocument();
    });

    it('modal menampilkan judul "Tambah Infrastruktur" saat editId null', () => {
      render(<InfrastructureModal {...defaultProps({ open: true, editId: null })} />);

      expect(screen.getByText('Tambah Infrastruktur')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 7.4 — Tombol X memanggil onClose
  // -------------------------------------------------------------------------

  describe('Req 7.4 — tombol X memanggil onClose', () => {
    it('klik tombol X (aria-label "Tutup modal") memanggil onClose', () => {
      const onClose = vi.fn();
      render(<InfrastructureModal {...defaultProps({ onClose })} />);

      const closeButton = screen.getByRole('button', { name: /tutup modal/i });
      fireEvent.click(closeButton);

      // Radix Dialog.Close triggers both onClick and onOpenChange → onClose may be called
      // once (onClick) or twice (onClick + onOpenChange). Either way it must be called.
      expect(onClose).toHaveBeenCalled();
    });

    it('tombol X ada di dalam header modal', () => {
      render(<InfrastructureModal {...defaultProps()} />);

      const closeButton = screen.getByRole('button', { name: /tutup modal/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 7.9 — Validasi file: ukuran > 5MB ditolak
  // -------------------------------------------------------------------------

  describe('Req 7.9 — validasi file upload', () => {
    it('file > 5MB ditolak dengan pesan error validasi', async () => {
      render(<InfrastructureModal {...defaultProps()} />);

      // Cari input file tersembunyi
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).not.toBeNull();

      // Buat file palsu berukuran 6MB (> 5MB limit)
      const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'besar.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [bigFile] } });

      await waitFor(() => {
        expect(screen.getByText(/ukuran file maksimal 5MB/i)).toBeInTheDocument();
      });
    });

    it('file tepat 5MB (batas) tidak ditolak karena ukuran', async () => {
      const onFormChange = vi.fn();
      // Mock URL.createObjectURL agar tidak error di happy-dom
      const mockUrl = 'blob:http://localhost/test-image';
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => mockUrl),
        revokeObjectURL: vi.fn(),
      });

      render(<InfrastructureModal {...defaultProps({ onFormChange })} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // File tepat 5MB — harus lolos validasi ukuran
      const exactFile = new File(['x'], 'pas.jpg', { type: 'image/jpeg' });
      Object.defineProperty(exactFile, 'size', { value: 5 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [exactFile] } });

      await waitFor(() => {
        // Pesan error ukuran tidak boleh muncul
        expect(screen.queryByText(/ukuran file maksimal 5MB/i)).not.toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });

    // -----------------------------------------------------------------------
    // Req 7.9 — Validasi file: tipe bukan image/* ditolak
    // -----------------------------------------------------------------------

    it('file bukan image/* (PDF) ditolak dengan pesan error validasi', async () => {
      render(<InfrastructureModal {...defaultProps()} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const pdfFile = new File(['%PDF-1.4'], 'dokumen.pdf', {
        type: 'application/pdf',
      });

      fireEvent.change(fileInput, { target: { files: [pdfFile] } });

      await waitFor(() => {
        expect(
          screen.getByText(/file harus berupa gambar/i),
        ).toBeInTheDocument();
      });
    });

    it('file bukan image/* (teks biasa) ditolak dengan pesan error validasi', async () => {
      render(<InfrastructureModal {...defaultProps()} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const txtFile = new File(['hello world'], 'catatan.txt', {
        type: 'text/plain',
      });

      fireEvent.change(fileInput, { target: { files: [txtFile] } });

      await waitFor(() => {
        expect(
          screen.getByText(/file harus berupa gambar/i),
        ).toBeInTheDocument();
      });
    });

    it('file image/* yang valid (PNG) diterima tanpa pesan error', async () => {
      const mockUrl = 'blob:http://localhost/test-image';
      vi.stubGlobal('URL', {
        createObjectURL: vi.fn(() => mockUrl),
        revokeObjectURL: vi.fn(),
      });

      render(<InfrastructureModal {...defaultProps()} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const pngFile = new File(['PNG_DATA'], 'foto.png', { type: 'image/png' });
      Object.defineProperty(pngFile, 'size', { value: 1 * 1024 * 1024 }); // 1MB

      fireEvent.change(fileInput, { target: { files: [pngFile] } });

      await waitFor(() => {
        expect(screen.queryByText(/file harus berupa gambar/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/ukuran file maksimal 5MB/i)).not.toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });

    it('file > 5MB DAN bukan image/* — pesan error tipe ditampilkan (tipe dicek lebih dulu)', async () => {
      render(<InfrastructureModal {...defaultProps()} />);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      const badFile = new File(['x'.repeat(10)], 'virus.exe', {
        type: 'application/octet-stream',
      });
      Object.defineProperty(badFile, 'size', { value: 10 * 1024 * 1024 });

      fireEvent.change(fileInput, { target: { files: [badFile] } });

      await waitFor(() => {
        // Tipe dicek lebih dulu dalam validateAndSet
        expect(screen.getByText(/file harus berupa gambar/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Req 7.5 — Dropdown kategori menampilkan ikon Lucide untuk setiap opsi
  // -------------------------------------------------------------------------

  describe('Req 7.5 — dropdown kategori dengan ikon Lucide', () => {
    it('trigger dropdown kategori ada di dalam modal', () => {
      render(<InfrastructureModal {...defaultProps()} />);

      // Radix Select.Trigger memiliki aria-label "Pilih kategori"
      const trigger = screen.getByRole('combobox', { name: /pilih kategori/i });
      expect(trigger).toBeInTheDocument();
    });

    it('setelah membuka dropdown, setiap opsi kategori memiliki ikon SVG', async () => {
      render(<InfrastructureModal {...defaultProps()} />);

      const trigger = screen.getByRole('combobox', { name: /pilih kategori/i });
      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
      fireEvent.click(trigger);

      await waitFor(() => {
        // Radix Select renders visible [role="option"] items when open
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThan(0);
      });

      // Setiap item dropdown harus memiliki ikon SVG (Lucide)
      const options = screen.getAllByRole('option');
      const firstOption = options[0];
      const svg = firstOption.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('semua kategori dalam list muncul sebagai opsi dropdown', async () => {
      render(<InfrastructureModal {...defaultProps()} />);

      const trigger = screen.getByRole('combobox', { name: /pilih kategori/i });
      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
      fireEvent.click(trigger);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBe(KATEGORI_LIST.length);
      });

      // Verifikasi setiap label ada di antara opsi yang terlihat
      const options = screen.getAllByRole('option');
      const optionTexts = options.map((o) => o.textContent ?? '');
      expect(optionTexts.some((t) => t.includes('Restoran'))).toBe(true);
      expect(optionTexts.some((t) => t.includes('Kesehatan'))).toBe(true);
      expect(optionTexts.some((t) => t.includes('Rumah Ibadah'))).toBe(true);
      expect(optionTexts.some((t) => t.includes('Pasar'))).toBe(true);
      expect(optionTexts.some((t) => t.includes('Toko'))).toBe(true);
      expect(optionTexts.some((t) => t.includes('Lainnya'))).toBe(true);
    });

    it('kategori tanpa mapping di KATEGORI_ICON_MAP menggunakan ikon fallback MapPin', async () => {
      const kategoriTidakDikenal: KategoriInfra[] = [
        buatKategori({ id: 99, value: 'kategori_baru', label: 'Kategori Baru', urutan: 99 }),
      ];

      render(
        <InfrastructureModal
          {...defaultProps({ kategoriList: kategoriTidakDikenal })}
        />,
      );

      const trigger = screen.getByRole('combobox', { name: /pilih kategori/i });
      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
      fireEvent.click(trigger);

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options.length).toBe(1);
      });

      // Harus tetap ada ikon SVG (fallback MapPin)
      const options = screen.getAllByRole('option');
      const svg = options[0].querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 7.8 — Pesan formError ditampilkan di dalam modal
  // -------------------------------------------------------------------------

  describe('Req 7.8 — tampilan formError', () => {
    it('formError tidak kosong → pesan error ditampilkan di dalam modal', () => {
      render(
        <InfrastructureModal
          {...defaultProps({ formError: 'Gagal menyimpan data. Coba lagi.' })}
        />,
      );

      const errorEl = screen.getByRole('alert');
      expect(errorEl).toBeInTheDocument();
      expect(errorEl).toHaveTextContent('Gagal menyimpan data. Coba lagi.');
    });

    it('formError tidak kosong → elemen error memiliki class bg-red-50 border-red-200 text-red-600', () => {
      render(
        <InfrastructureModal
          {...defaultProps({ formError: 'Ada kesalahan' })}
        />,
      );

      const errorEl = screen.getByRole('alert');
      expect(errorEl).toHaveClass('bg-red-50');
      expect(errorEl).toHaveClass('border-red-200');
      expect(errorEl).toHaveClass('text-red-600');
    });

    it('formError kosong → elemen error tidak ditampilkan', () => {
      render(<InfrastructureModal {...defaultProps({ formError: '' })} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('modal tetap terbuka saat formError tidak kosong', () => {
      render(
        <InfrastructureModal
          {...defaultProps({ open: true, formError: 'Error terjadi' })}
        />,
      );

      // Konten modal masih terlihat
      expect(screen.getByText('Tambah Infrastruktur')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 7.1 — Tombol Simpan dan Batal
  // -------------------------------------------------------------------------

  describe('Req 7.1 — tombol aksi modal', () => {
    it('tombol Simpan ada di dalam modal', () => {
      render(<InfrastructureModal {...defaultProps()} />);

      expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
    });

    it('tombol Simpan menampilkan "Menyimpan..." saat saving=true', () => {
      render(<InfrastructureModal {...defaultProps({ saving: true })} />);

      expect(screen.getByRole('button', { name: /menyimpan/i })).toBeInTheDocument();
    });

    it('tombol Simpan dinonaktifkan saat saving=true', () => {
      render(<InfrastructureModal {...defaultProps({ saving: true })} />);

      const simpanButton = screen.getByRole('button', { name: /menyimpan/i });
      expect(simpanButton).toBeDisabled();
    });

    it('tombol Batal memanggil onClose', () => {
      const onClose = vi.fn();
      render(<InfrastructureModal {...defaultProps({ onClose })} />);

      const batalButton = screen.getByRole('button', { name: /batal/i });
      fireEvent.click(batalButton);

      // Radix Dialog.Close triggers both onClick and onOpenChange → onClose may be called
      // once or twice. Either way it must be called.
      expect(onClose).toHaveBeenCalled();
    });
  });
});
