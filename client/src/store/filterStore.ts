import { create } from 'zustand';
import { IDKAB_PADANG_PARIAMAN } from '../constants';

interface FilterState {
  // Filter kategori infrastruktur (array of kategori.value)
  kategoriAktif: string[];
  toggleKategori: (value: string) => void;
  setKategoriAktif: (values: string[]) => void;
  resetKategori: () => void;

  // Filter wilayah cascade — menyimpan kode BPS penuh (idkec 7 digit, iddesa 10 digit, idsls 14 digit)
  idkab: string;
  idkec: string;
  iddesa: string;
  idsls: string;
  setIdkec: (v: string) => void;
  setIddesa: (v: string) => void;
  setIdsls: (v: string) => void;
  resetWilayah: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  kategoriAktif: [],

  toggleKategori: (value) =>
    set((state) => ({
      kategoriAktif: state.kategoriAktif.includes(value)
        ? state.kategoriAktif.filter((k) => k !== value)
        : [...state.kategoriAktif, value],
    })),

  setKategoriAktif: (values) => set({ kategoriAktif: values }),
  resetKategori: () => set({ kategoriAktif: [] }),

  // Wilayah: default seluruh kabupaten
  idkab: IDKAB_PADANG_PARIAMAN,
  idkec: '',
  iddesa: '',
  idsls: '',

  setIdkec:  (v) => set({ idkec: v, iddesa: '', idsls: '' }),
  setIddesa: (v) => set({ iddesa: v, idsls: '' }),
  setIdsls:  (v) => set({ idsls: v }),

  resetWilayah: () => set({ idkec: '', iddesa: '', idsls: '' }),
}));
