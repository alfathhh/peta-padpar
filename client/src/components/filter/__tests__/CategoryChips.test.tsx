/**
 * Unit tests untuk CategoryChips
 *
 * Validates: Requirements 4.4, 4.5, 4.7, 4.8
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryChips from '../CategoryChips';
import { useFilterStore } from '../../../store/filterStore';
import type { KategoriInfra } from '../../../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reset filterStore ke state awal sebelum setiap test */
function resetStore() {
  useFilterStore.setState({ kategoriAktif: [] });
}

/** Buat KategoriInfra dummy */
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
  buatKategori({ id: 3, value: 'pasar', label: 'Pasar', urutan: 3 }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CategoryChips', () => {
  beforeEach(() => {
    resetStore();
  });

  // -------------------------------------------------------------------------
  // Req 4.5 & 4.8 — Toggle chip: inactive → active → inactive
  // -------------------------------------------------------------------------

  describe('toggle chip individual', () => {
    it('chip inactive → klik → chip menjadi active (emerald style)', () => {
      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const chipRestoran = screen.getByRole('button', {
        name: /filter kategori restoran/i,
      });

      // Awalnya inactive
      expect(chipRestoran).toHaveAttribute('aria-pressed', 'false');
      expect(chipRestoran).toHaveClass('bg-white');
      expect(chipRestoran).not.toHaveClass('bg-emerald-50');

      // Klik → active
      fireEvent.click(chipRestoran);

      expect(chipRestoran).toHaveAttribute('aria-pressed', 'true');
      expect(chipRestoran).toHaveClass('bg-emerald-50');
      expect(chipRestoran).toHaveClass('text-emerald-700');
      expect(chipRestoran).toHaveClass('border-emerald-200');
    });

    it('chip active → klik → chip menjadi inactive', () => {
      // Set state awal: restoran sudah aktif
      useFilterStore.setState({ kategoriAktif: ['restoran'] });

      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const chipRestoran = screen.getByRole('button', {
        name: /filter kategori restoran/i,
      });

      // Awalnya active
      expect(chipRestoran).toHaveAttribute('aria-pressed', 'true');
      expect(chipRestoran).toHaveClass('bg-emerald-50');

      // Klik → inactive
      fireEvent.click(chipRestoran);

      expect(chipRestoran).toHaveAttribute('aria-pressed', 'false');
      expect(chipRestoran).toHaveClass('bg-white');
      expect(chipRestoran).not.toHaveClass('bg-emerald-50');
    });

    it('toggle dua kali berturut-turut mengembalikan state ke kondisi semula (idempoten) — Req 4.8', () => {
      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const chipRestoran = screen.getByRole('button', {
        name: /filter kategori restoran/i,
      });

      // State awal: inactive
      expect(chipRestoran).toHaveAttribute('aria-pressed', 'false');

      // Toggle pertama → active
      fireEvent.click(chipRestoran);
      expect(chipRestoran).toHaveAttribute('aria-pressed', 'true');

      // Toggle kedua → kembali inactive (idempoten)
      fireEvent.click(chipRestoran);
      expect(chipRestoran).toHaveAttribute('aria-pressed', 'false');

      // Verifikasi store juga kembali ke state semula
      expect(useFilterStore.getState().kategoriAktif).not.toContain('restoran');
    });
  });

  // -------------------------------------------------------------------------
  // Req 4.5 — Tombol "Tampilkan Semua"
  // -------------------------------------------------------------------------

  describe('tombol "Tampilkan Semua"', () => {
    it('klik "Tampilkan Semua" → semua chip menjadi aktif', () => {
      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const btnSemua = screen.getByRole('button', { name: /tampilkan semua/i });

      // Awalnya tidak semua aktif
      expect(btnSemua).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(btnSemua);

      // Semua chip harus aktif
      const { kategoriAktif } = useFilterStore.getState();
      expect(kategoriAktif).toHaveLength(KATEGORI_LIST.length);
      KATEGORI_LIST.forEach((k) => {
        expect(kategoriAktif).toContain(k.value);
      });

      // Tombol "Semua" sendiri juga aktif
      expect(btnSemua).toHaveAttribute('aria-pressed', 'true');
    });

    it('semua chip aktif → klik "Tampilkan Semua" → semua chip nonaktif', () => {
      // Set semua aktif
      useFilterStore.setState({
        kategoriAktif: KATEGORI_LIST.map((k) => k.value),
      });

      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const btnSemua = screen.getByRole('button', { name: /tampilkan semua/i });

      // Awalnya semua aktif
      expect(btnSemua).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(btnSemua);

      // Semua chip harus nonaktif
      const { kategoriAktif } = useFilterStore.getState();
      expect(kategoriAktif).toHaveLength(0);

      expect(btnSemua).toHaveAttribute('aria-pressed', 'false');
    });

    it('setelah klik "Tampilkan Semua", setiap chip individual menampilkan emerald style', () => {
      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const btnSemua = screen.getByRole('button', { name: /tampilkan semua/i });
      fireEvent.click(btnSemua);

      KATEGORI_LIST.forEach((k) => {
        const chip = screen.getByRole('button', {
          name: new RegExp(`filter kategori ${k.label}`, 'i'),
        });
        expect(chip).toHaveAttribute('aria-pressed', 'true');
        expect(chip).toHaveClass('bg-emerald-50');
      });
    });
  });

  // -------------------------------------------------------------------------
  // Req 4.4 — Fallback ikon MapPin untuk kategori tidak dikenal
  // -------------------------------------------------------------------------

  describe('fallback ikon MapPin', () => {
    it('kategori dengan value tidak ada di KATEGORI_ICON_MAP → render ikon fallback (MapPin)', () => {
      const kategoriTidakDikenal: KategoriInfra[] = [
        buatKategori({
          id: 99,
          value: 'kategori_tidak_ada',
          label: 'Kategori Tidak Ada',
          urutan: 99,
        }),
      ];

      // Render tidak boleh throw error
      expect(() =>
        render(<CategoryChips kategoriList={kategoriTidakDikenal} />),
      ).not.toThrow();

      // Chip harus tetap ter-render
      const chip = screen.getByRole('button', {
        name: /filter kategori kategori tidak ada/i,
      });
      expect(chip).toBeInTheDocument();

      // Chip harus mengandung SVG (ikon Lucide MapPin)
      const svg = chip.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('kategori yang ada di KATEGORI_ICON_MAP juga merender ikon SVG', () => {
      const kategoriDikenal: KategoriInfra[] = [
        buatKategori({ id: 1, value: 'restoran', label: 'Restoran', urutan: 1 }),
      ];

      render(<CategoryChips kategoriList={kategoriDikenal} />);

      const chip = screen.getByRole('button', {
        name: /filter kategori restoran/i,
      });
      const svg = chip.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Req 4.7 — Sinkronisasi state dengan filterStore
  // -------------------------------------------------------------------------

  describe('sinkronisasi dengan filterStore', () => {
    it('chip aktif sesuai dengan kategoriAktif di store', () => {
      useFilterStore.setState({ kategoriAktif: ['kesehatan'] });

      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const chipKesehatan = screen.getByRole('button', {
        name: /filter kategori kesehatan/i,
      });
      const chipRestoran = screen.getByRole('button', {
        name: /filter kategori restoran/i,
      });

      expect(chipKesehatan).toHaveAttribute('aria-pressed', 'true');
      expect(chipRestoran).toHaveAttribute('aria-pressed', 'false');
    });

    it('jumlah chip aktif selalu sama dengan panjang kategoriAktif di store', () => {
      useFilterStore.setState({ kategoriAktif: ['restoran', 'pasar'] });

      render(<CategoryChips kategoriList={KATEGORI_LIST} />);

      const chipsAktif = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.getAttribute('aria-pressed') === 'true' &&
            btn.getAttribute('aria-label')?.startsWith('Filter kategori'),
        );

      expect(chipsAktif).toHaveLength(
        useFilterStore.getState().kategoriAktif.length,
      );
    });
  });

  // -------------------------------------------------------------------------
  // Edge case — daftar kategori kosong
  // -------------------------------------------------------------------------

  describe('edge case', () => {
    it('kategoriList kosong → menampilkan pesan "Tidak ada kategori tersedia"', () => {
      render(<CategoryChips kategoriList={[]} />);
      expect(
        screen.getByText(/tidak ada kategori tersedia/i),
      ).toBeInTheDocument();
    });
  });
});
