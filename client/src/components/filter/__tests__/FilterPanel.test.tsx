/**
 * Unit tests untuk FilterPanel
 *
 * Validates: Requirements 3.3, 3.4, 3.5, 10.1
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../FilterPanel';
import { useFilterStore } from '../../../store/filterStore';
import type { KategoriInfra } from '../../../types';
// KategoriInfra is used in buatKategori helper below

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock FilterWilayah — komponen ini bergantung pada GeoJSON dan hooks kompleks
vi.mock('../FilterWilayah', () => ({
  default: () => <div data-testid="filter-wilayah">FilterWilayah</div>,
}));

// Mock CategoryChips — komponen ini bergantung pada filterStore dan ikon Lucide
vi.mock('../CategoryChips', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => (
    <div data-testid="category-chips">
      CategoryChips ({props.kategoriList.length} kategori)
    </div>
  ),
}));

// Mock ikon Lucide X
vi.mock('lucide-react', () => ({
  X: () => <svg data-testid="icon-x" aria-hidden="true" />,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  buatKategori({ id: 1, value: 'restoran', label: 'Restoran', urutan: 1 }),
  buatKategori({ id: 2, value: 'kesehatan', label: 'Kesehatan', urutan: 2 }),
];

const defaultProps = {
  kategoriList: KATEGORI_LIST,
  onClose: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFilterStore.setState({ kategoriAktif: [], idkec: '', iddesa: '', idsls: '' });
  });

  // -------------------------------------------------------------------------
  // Req 3.4 — Panel merender FilterWilayah dan CategoryChips
  // -------------------------------------------------------------------------

  describe('merender sub-komponen', () => {
    it('merender komponen FilterWilayah', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByTestId('filter-wilayah')).toBeInTheDocument();
    });

    it('merender komponen CategoryChips', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByTestId('category-chips')).toBeInTheDocument();
    });

    it('meneruskan kategoriList ke CategoryChips', () => {
      render(<FilterPanel {...defaultProps} />);

      // CategoryChips mock menampilkan jumlah kategori
      expect(screen.getByTestId('category-chips')).toHaveTextContent(
        `${KATEGORI_LIST.length} kategori`,
      );
    });

    it('merender header "Filter Peta"', () => {
      render(<FilterPanel {...defaultProps} />);

      expect(screen.getByText(/filter peta/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 3.3 — Tombol X memanggil onClose
  // -------------------------------------------------------------------------

  describe('tombol X (tutup)', () => {
    it('tombol X memanggil onClose saat diklik', () => {
      const onClose = vi.fn();
      render(<FilterPanel {...defaultProps} onClose={onClose} />);

      const tombolTutup = screen.getByRole('button', { name: /tutup filter/i });
      fireEvent.click(tombolTutup);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('tombol X merender ikon X dari Lucide', () => {
      render(<FilterPanel {...defaultProps} />);

      const tombolTutup = screen.getByRole('button', { name: /tutup filter/i });
      expect(tombolTutup.querySelector('[data-testid="icon-x"]')).toBeInTheDocument();
    });

    it('menekan tombol Escape memanggil onClose', () => {
      const onClose = vi.fn();
      render(<FilterPanel {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Req 3.5 & 10.1 — Pada viewport < 1024px, panel memiliki class bottom sheet
  // -------------------------------------------------------------------------

  describe('class bottom sheet pada mobile (< 1024px)', () => {
    it('panel memiliki class fixed bottom-0 untuk bottom sheet', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      // Bottom sheet: fixed, bottom-0, left-0, right-0
      expect(panel).toHaveClass('fixed');
      expect(panel).toHaveClass('bottom-0');
      expect(panel).toHaveClass('left-0');
      expect(panel).toHaveClass('right-0');
    });

    it('panel memiliki class max-h-[75vh] untuk bottom sheet mobile', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      // Req 10.4: bottom sheet max-h-[75vh]
      expect(panel).toHaveClass('max-h-[75vh]');
    });

    it('panel memiliki class rounded-t-3xl untuk tampilan bottom sheet', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      expect(panel).toHaveClass('rounded-t-3xl');
    });

    it('panel memiliki class lg:static untuk override ke floating panel di desktop', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      // Di desktop (≥ lg), panel menjadi static (bukan fixed)
      expect(panel).toHaveClass('lg:static');
    });

    it('panel memiliki class lg:rounded-3xl untuk tampilan floating di desktop', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      expect(panel).toHaveClass('lg:rounded-3xl');
    });

    it('overlay mobile merender dengan class lg:hidden', () => {
      render(<FilterPanel {...defaultProps} />);

      // Overlay hanya tampil di mobile (< lg)
      const overlay = document.querySelector('.lg\\:hidden');
      expect(overlay).toBeInTheDocument();
    });

    it('klik overlay mobile memanggil onClose', () => {
      const onClose = vi.fn();
      render(<FilterPanel {...defaultProps} onClose={onClose} />);

      // Overlay adalah div dengan class lg:hidden yang bisa diklik
      const overlay = document.querySelector('.lg\\:hidden');
      expect(overlay).toBeInTheDocument();
      fireEvent.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Req 3.1 — Glassmorphism style
  // -------------------------------------------------------------------------

  describe('glassmorphism style', () => {
    it('panel memiliki class glassmorphism bg-white/85 backdrop-blur-md', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      expect(panel).toHaveClass('bg-white/85');
      expect(panel).toHaveClass('backdrop-blur-md');
    });

    it('panel memiliki class pointer-events-auto', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');

      expect(panel).toHaveClass('pointer-events-auto');
    });
  });

  // -------------------------------------------------------------------------
  // Aksesibilitas
  // -------------------------------------------------------------------------

  describe('aksesibilitas', () => {
    it('panel memiliki role="dialog" dan aria-modal="true"', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog');
      expect(panel).toHaveAttribute('aria-modal', 'true');
    });

    it('panel memiliki aria-label="Filter Peta"', () => {
      render(<FilterPanel {...defaultProps} />);

      const panel = screen.getByRole('dialog', { name: /filter peta/i });
      expect(panel).toBeInTheDocument();
    });
  });
});
