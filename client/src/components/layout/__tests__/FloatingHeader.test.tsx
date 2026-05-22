import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingHeader from '../FloatingHeader';
import type { KategoriInfra } from '../../../types';

// Mock SearchBar to avoid complex dependencies (api calls, map store, etc.)
vi.mock('../../search/SearchBar', () => ({
  default: () => <input placeholder="Cari infrastruktur..." />,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  SlidersHorizontal: () => <svg data-testid="icon-filter" />,
  BarChart2: () => <svg data-testid="icon-statistik" />,
}));

const mockKategoriMap = new Map<string, KategoriInfra>([
  [
    'restoran',
    {
      id: 1,
      value: 'restoran',
      label: 'Restoran',
      icon: '🍽️',
      color: '#FF5733',
      urutan: 1,
    },
  ],
]);

const defaultProps = {
  kategoriMap: mockKategoriMap,
  onToggleFilter: vi.fn(),
  onToggleStatistik: vi.fn(),
  filterActive: false,
  statistikActive: false,
};

describe('FloatingHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Requirements 2.5, 2.6: Tombol Filter menampilkan active style saat filterActive=true
  it('tombol Filter menampilkan active style saat filterActive=true', () => {
    render(<FloatingHeader {...defaultProps} filterActive={true} />);

    const filterButton = screen.getByRole('button', { name: /toggle filter/i });

    // Active state: bg-emerald-50 text-emerald-700 border border-emerald-200
    expect(filterButton).toHaveClass('bg-emerald-50');
    expect(filterButton).toHaveClass('text-emerald-700');
    expect(filterButton).toHaveClass('border-emerald-200');
  });

  // Requirements 2.5, 2.6: Tombol Filter tidak menampilkan active style saat filterActive=false
  it('tombol Filter tidak menampilkan active style saat filterActive=false', () => {
    render(<FloatingHeader {...defaultProps} filterActive={false} />);

    const filterButton = screen.getByRole('button', { name: /toggle filter/i });

    // Inactive state: text-slate-600 hover:bg-slate-100
    expect(filterButton).not.toHaveClass('bg-emerald-50');
    expect(filterButton).not.toHaveClass('text-emerald-700');
    expect(filterButton).toHaveClass('text-slate-600');
  });

  // Requirements 2.5, 2.6: Tombol Statistik menampilkan active style saat statistikActive=true
  it('tombol Statistik menampilkan active style saat statistikActive=true', () => {
    render(<FloatingHeader {...defaultProps} statistikActive={true} />);

    const statistikButton = screen.getByRole('button', { name: /toggle statistik/i });

    // Active state: bg-emerald-50 text-emerald-700 border border-emerald-200
    expect(statistikButton).toHaveClass('bg-emerald-50');
    expect(statistikButton).toHaveClass('text-emerald-700');
    expect(statistikButton).toHaveClass('border-emerald-200');
  });

  // Requirements 2.5, 2.6: Tombol Statistik tidak menampilkan active style saat statistikActive=false
  it('tombol Statistik tidak menampilkan active style saat statistikActive=false', () => {
    render(<FloatingHeader {...defaultProps} statistikActive={false} />);

    const statistikButton = screen.getByRole('button', { name: /toggle statistik/i });

    // Inactive state: text-slate-600 hover:bg-slate-100
    expect(statistikButton).not.toHaveClass('bg-emerald-50');
    expect(statistikButton).not.toHaveClass('text-emerald-700');
    expect(statistikButton).toHaveClass('text-slate-600');
  });

  // Requirements 10.3: Teks "Peta Tematik" dan "Kab. Padang Pariaman" disembunyikan
  // bersama-sama pada breakpoint ≤ 640px menggunakan class hidden sm:block
  it('teks "Peta Tematik" dan "Kab. Padang Pariaman" berada dalam container yang sama dengan class hidden sm:block', () => {
    render(<FloatingHeader {...defaultProps} />);

    const petaTematikText = screen.getByText('Peta Tematik');
    const kabText = screen.getByText('Kab. Padang Pariaman');

    // Kedua teks harus berada dalam container yang sama
    const container = petaTematikText.closest('div');
    expect(container).not.toBeNull();
    expect(container).toContainElement(kabText);

    // Container harus memiliki class 'hidden' dan 'sm:block' untuk disembunyikan bersama-sama
    // pada layar ≤ 640px (Tailwind: hidden = display:none by default, sm:block = display:block at ≥640px)
    expect(container).toHaveClass('hidden');
    expect(container).toHaveClass('sm:block');
  });

  // Requirements 2.3: onToggleFilter dipanggil saat tombol Filter diklik
  it('onToggleFilter dipanggil saat tombol Filter diklik', () => {
    const onToggleFilter = vi.fn();
    render(<FloatingHeader {...defaultProps} onToggleFilter={onToggleFilter} />);

    const filterButton = screen.getByRole('button', { name: /toggle filter/i });
    fireEvent.click(filterButton);

    expect(onToggleFilter).toHaveBeenCalledTimes(1);
  });

  // Requirements 2.3: onToggleStatistik dipanggil saat tombol Statistik diklik
  it('onToggleStatistik dipanggil saat tombol Statistik diklik', () => {
    const onToggleStatistik = vi.fn();
    render(<FloatingHeader {...defaultProps} onToggleStatistik={onToggleStatistik} />);

    const statistikButton = screen.getByRole('button', { name: /toggle statistik/i });
    fireEvent.click(statistikButton);

    expect(onToggleStatistik).toHaveBeenCalledTimes(1);
  });

  // Verifikasi aria-pressed mencerminkan state aktif
  it('tombol Filter memiliki aria-pressed=true saat filterActive=true', () => {
    render(<FloatingHeader {...defaultProps} filterActive={true} />);

    const filterButton = screen.getByRole('button', { name: /toggle filter/i });
    expect(filterButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('tombol Statistik memiliki aria-pressed=true saat statistikActive=true', () => {
    render(<FloatingHeader {...defaultProps} statistikActive={true} />);

    const statistikButton = screen.getByRole('button', { name: /toggle statistik/i });
    expect(statistikButton).toHaveAttribute('aria-pressed', 'true');
  });
});
