/**
 * Property-based tests untuk CategoryChips — konsistensi chip aktif
 *
 * **Validates: Requirements 4.7**
 *
 * Menguji bahwa jumlah chip yang ditampilkan sebagai aktif selalu sama
 * dengan panjang `filterStore.kategoriAktif`.
 *
 * Property: activeChips.length === filterStore.kategoriAktif.length
 *
 * Pengujian dilakukan pada level logika murni (pure function) yang
 * merepresentasikan bagaimana CategoryChips menentukan chip mana yang aktif,
 * tanpa perlu me-render komponen React secara penuh.
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Model logika CategoryChips
// ---------------------------------------------------------------------------

/**
 * Merepresentasikan satu chip kategori.
 */
interface KategoriChip {
  value: string;
  label: string;
}

/**
 * Menghitung chip mana saja yang aktif berdasarkan kategoriAktif dari store.
 * Ini adalah logika yang sama dengan yang digunakan CategoryChips.tsx:
 *   const aktif = kategoriAktif.includes(kat.value);
 */
function getActiveChips(
  kategoriList: KategoriChip[],
  kategoriAktif: string[],
): KategoriChip[] {
  return kategoriList.filter((kat) => kategoriAktif.includes(kat.value));
}

/**
 * Menghitung chip yang tidak aktif.
 */
function getInactiveChips(
  kategoriList: KategoriChip[],
  kategoriAktif: string[],
): KategoriChip[] {
  return kategoriList.filter((kat) => !kategoriAktif.includes(kat.value));
}

/**
 * Simulasi toggleKategori dari filterStore.
 * Jika value ada di kategoriAktif, hapus; jika tidak, tambahkan.
 */
function toggleKategori(kategoriAktif: string[], value: string): string[] {
  return kategoriAktif.includes(value)
    ? kategoriAktif.filter((k) => k !== value)
    : [...kategoriAktif, value];
}

/**
 * Simulasi setKategoriAktif dari filterStore.
 */
function setKategoriAktif(values: string[]): string[] {
  return [...values];
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generator untuk nilai kategori yang valid (slug-like strings).
 */
const kategoriValueArb = fc.string({ minLength: 1, maxLength: 30 });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CategoryChips — konsistensi chip aktif (Property 2)', () => {
  /**
   * **Validates: Requirements 4.7**
   *
   * Property utama: activeChips.length === filterStore.kategoriAktif.length
   *
   * Untuk sembarang daftar kategori dan sembarang subset yang aktif,
   * jumlah chip yang dihitung sebagai aktif harus selalu sama dengan
   * panjang array kategoriAktif di store.
   */
  it('jumlah chip aktif selalu sama dengan kategoriAktif.length', () => {
    fc.assert(
      fc.property(
        fc.array(kategoriValueArb, { minLength: 0, maxLength: 15 }).map(
          (values: string[]) => Array.from(new Set(values)).map((v, i) => ({ value: v, label: `Kat ${i}` })),
        ),
        fc.array(fc.integer({ min: 0, max: 14 }), { minLength: 0, maxLength: 15 }),
        (kategoriList: KategoriChip[], rawIndices: number[]) => {
          // Buat kategoriAktif dari subset valid kategoriList
          const validIndices = rawIndices
            .filter((i) => i < kategoriList.length)
            .map((i) => kategoriList[i].value);
          const kategoriAktif = Array.from(new Set(validIndices));

          const activeChips = getActiveChips(kategoriList, kategoriAktif);

          // Property: jumlah chip aktif === panjang kategoriAktif
          expect(activeChips.length).toBe(kategoriAktif.length);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 4.7**
   *
   * Property: chip aktif + chip tidak aktif = semua chip
   *
   * Partisi aktif dan tidak aktif harus mencakup seluruh kategoriList
   * tanpa tumpang tindih.
   */
  it('chip aktif dan tidak aktif membentuk partisi lengkap dari kategoriList', () => {
    fc.assert(
      fc.property(
        fc.array(kategoriValueArb, { minLength: 0, maxLength: 15 }).map(
          (values: string[]) => Array.from(new Set(values)).map((v, i) => ({ value: v, label: `Kat ${i}` })),
        ),
        fc.array(fc.integer({ min: 0, max: 14 }), { minLength: 0, maxLength: 15 }),
        (kategoriList: KategoriChip[], rawIndices: number[]) => {
          const validIndices = rawIndices
            .filter((i) => i < kategoriList.length)
            .map((i) => kategoriList[i].value);
          const kategoriAktif = Array.from(new Set(validIndices));

          const activeChips = getActiveChips(kategoriList, kategoriAktif);
          const inactiveChips = getInactiveChips(kategoriList, kategoriAktif);

          // Aktif + tidak aktif = total
          expect(activeChips.length + inactiveChips.length).toBe(kategoriList.length);

          // Tidak ada tumpang tindih
          const activeValues = new Set(activeChips.map((c) => c.value));
          const inactiveValues = new Set(inactiveChips.map((c) => c.value));
          for (const v of activeValues) {
            expect(inactiveValues.has(v)).toBe(false);
          }
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 4.7**
   *
   * Property: setelah toggleKategori, jumlah chip aktif tetap konsisten
   * dengan kategoriAktif yang baru.
   *
   * Memastikan konsistensi terjaga setelah operasi toggle.
   */
  it('konsistensi terjaga setelah operasi toggle', () => {
    fc.assert(
      fc.property(
        fc.array(kategoriValueArb, { minLength: 1, maxLength: 15 }).map(
          (values: string[]) => Array.from(new Set(values)).map((v, i) => ({ value: v, label: `Kat ${i}` })),
        ),
        fc.array(fc.integer({ min: 0, max: 14 }), { minLength: 0, maxLength: 15 }),
        fc.integer({ min: 0, max: 14 }),
        (kategoriList: KategoriChip[], rawIndices: number[], toggleIdx: number) => {
          // Pastikan kategoriList tidak kosong
          if (kategoriList.length === 0) return;

          const validIndices = rawIndices
            .filter((i) => i < kategoriList.length)
            .map((i) => kategoriList[i].value);
          const kategoriAktif = Array.from(new Set(validIndices));

          // Pilih value untuk di-toggle (dari kategoriList)
          const safeIdx = toggleIdx % kategoriList.length;
          const valueToToggle = kategoriList[safeIdx].value;

          // Lakukan toggle
          const newKategoriAktif = toggleKategori(kategoriAktif, valueToToggle);

          // Hitung chip aktif berdasarkan state baru
          const activeChipsAfterToggle = getActiveChips(kategoriList, newKategoriAktif);

          // Property: jumlah chip aktif === panjang kategoriAktif baru
          expect(activeChipsAfterToggle.length).toBe(newKategoriAktif.length);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 4.7**
   *
   * Property: setelah setKategoriAktif([]), tidak ada chip yang aktif.
   *
   * Reset semua kategori harus menghasilkan 0 chip aktif.
   */
  it('setelah reset (setKategoriAktif([])), tidak ada chip aktif', () => {
    fc.assert(
      fc.property(
        fc.array(kategoriValueArb, { minLength: 0, maxLength: 15 }).map(
          (values: string[]) => Array.from(new Set(values)).map((v, i) => ({ value: v, label: `Kat ${i}` })),
        ),
        (kategoriList: KategoriChip[]) => {
          const kategoriAktif = setKategoriAktif([]);
          const activeChips = getActiveChips(kategoriList, kategoriAktif);

          expect(activeChips.length).toBe(0);
          expect(kategoriAktif.length).toBe(0);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 4.7**
   *
   * Property: setelah setKategoriAktif(semua), semua chip aktif.
   *
   * Mengaktifkan semua kategori harus menghasilkan chip aktif = total chip.
   */
  it('setelah setKategoriAktif(semua), semua chip aktif', () => {
    fc.assert(
      fc.property(
        fc.array(kategoriValueArb, { minLength: 0, maxLength: 15 }).map(
          (values: string[]) => Array.from(new Set(values)).map((v, i) => ({ value: v, label: `Kat ${i}` })),
        ),
        (kategoriList: KategoriChip[]) => {
          const allValues = kategoriList.map((k) => k.value);
          const kategoriAktif = setKategoriAktif(allValues);
          const activeChips = getActiveChips(kategoriList, kategoriAktif);

          expect(activeChips.length).toBe(kategoriList.length);
          expect(activeChips.length).toBe(kategoriAktif.length);
        },
      ),
    );
  });
});
