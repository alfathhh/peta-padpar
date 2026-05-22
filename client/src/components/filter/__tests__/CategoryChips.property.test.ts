/**
 * Property-based tests untuk CategoryChips — toggle idempoten
 *
 * Validates: Requirements 4.8
 *
 * Menguji logika toggle kategori sebagai pure function, terpisah dari
 * React component rendering dan Zustand store.
 */

import * as fc from 'fast-check';

/**
 * Pure toggle function — logika yang sama dengan filterStore.toggleKategori.
 * Jika value ada di state, hapus; jika tidak ada, tambahkan.
 */
function toggleKategori(state: string[], value: string): string[] {
  return state.includes(value)
    ? state.filter((k) => k !== value)
    : [...state, value];
}

describe('CategoryChips — toggle idempoten (Property 1)', () => {
  /**
   * **Validates: Requirements 4.8**
   *
   * Property: toggle(toggle(state, v), v) === state
   *
   * Memanggil toggle pada chip yang sama dua kali berturut-turut harus
   * mengembalikan state ke kondisi semula.
   */
  it('toggle dua kali berturut-turut mengembalikan state semula', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary state: array of unique strings
        fc.array(fc.string({ minLength: 1, maxLength: 20 })).map((arr: string[]) =>
          Array.from(new Set(arr)),
        ),
        // Generate arbitrary kategori value
        fc.string({ minLength: 1, maxLength: 20 }),
        (state: string[], value: string) => {
          const afterFirstToggle = toggleKategori(state, value);
          const afterSecondToggle = toggleKategori(afterFirstToggle, value);

          // State setelah dua kali toggle harus identik dengan state awal
          expect(afterSecondToggle).toEqual(state);
        },
      ),
    );
  });

  it('toggle sekali menambahkan value jika belum ada', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 })).map((arr: string[]) =>
          Array.from(new Set(arr)),
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (state: string[], value: string) => {
          // Pastikan value tidak ada di state awal
          const cleanState = state.filter((k) => k !== value);
          const result = toggleKategori(cleanState, value);

          expect(result).toContain(value);
          expect(result.length).toBe(cleanState.length + 1);
        },
      ),
    );
  });

  it('toggle sekali menghapus value jika sudah ada', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 })).map((arr: string[]) =>
          Array.from(new Set(arr)),
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (state: string[], value: string) => {
          // Pastikan value ada di state
          const stateWithValue = state.includes(value)
            ? state
            : [...state, value];
          const result = toggleKategori(stateWithValue, value);

          expect(result).not.toContain(value);
          expect(result.length).toBe(stateWithValue.length - 1);
        },
      ),
    );
  });
});
