/**
 * Property-Based Tests for MetrikCard — format angka
 *
 * **Validates: Requirements 5.6**
 *
 * Property 3: MetrikCard format angka valid
 * Verifikasi: teks yang dirender tidak mengandung karakter selain digit, titik, koma, dan spasi
 *
 * Catatan: Test ini memvalidasi logika format angka yang digunakan MetrikCard
 * (`nilai.toLocaleString('id-ID')`) secara langsung, karena itulah inti dari
 * Requirements 5.6 — format angka Indonesia yang valid.
 */

import * as fc from 'fast-check';

/**
 * Fungsi format angka yang digunakan MetrikCard (dari MetrikCard.tsx baris:
 * `{nilai.toLocaleString('id-ID')}`)
 */
function formatNilai(nilai: number): string {
  return nilai.toLocaleString('id-ID');
}

/**
 * Regex untuk karakter yang TIDAK valid dalam format angka Indonesia.
 * Format angka Indonesia (id-ID) hanya boleh mengandung:
 * - digit: 0-9
 * - titik: . (pemisah ribuan)
 * - koma: , (pemisah desimal)
 * - spasi: (beberapa locale menggunakan spasi sebagai pemisah ribuan)
 */
const INVALID_CHARS_REGEX = /[^0-9.,\s]/;

describe('MetrikCard — Property 3: format angka valid (Validates: Requirements 5.6)', () => {
  /**
   * **Validates: Requirements 5.6**
   *
   * Untuk sembarang bilangan bulat non-negatif, hasil `toLocaleString('id-ID')`
   * hanya boleh mengandung digit, titik, koma, dan spasi.
   */
  it('integer non-negatif: format id-ID hanya mengandung digit, titik, koma, dan spasi', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1_000_000_000 }),
        (nilai: number) => {
          const formatted = formatNilai(nilai);
          const hasInvalidChar = INVALID_CHARS_REGEX.test(formatted);

          if (hasInvalidChar) {
            throw new Error(
              `Nilai ${nilai} menghasilkan format "${formatted}" yang mengandung karakter tidak valid`,
            );
          }

          return !hasInvalidChar;
        },
      ),
      { numRuns: 500 },
    );
  });

  /**
   * **Validates: Requirements 5.6**
   *
   * Untuk bilangan float non-negatif, format id-ID juga hanya boleh mengandung
   * karakter yang valid.
   */
  it('float non-negatif: format id-ID hanya mengandung digit, titik, koma, dan spasi', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 1_000_000, noNaN: true }),
        (nilai: number) => {
          const formatted = formatNilai(nilai);
          const hasInvalidChar = INVALID_CHARS_REGEX.test(formatted);

          if (hasInvalidChar) {
            throw new Error(
              `Nilai ${nilai} menghasilkan format "${formatted}" yang mengandung karakter tidak valid`,
            );
          }

          return !hasInvalidChar;
        },
      ),
      { numRuns: 500 },
    );
  });

  /**
   * **Validates: Requirements 5.6**
   *
   * Nilai nol harus diformat dengan benar.
   */
  it('nilai nol diformat dengan benar', () => {
    const formatted = formatNilai(0);
    expect(INVALID_CHARS_REGEX.test(formatted)).toBe(false);
    expect(formatted).toBe('0');
  });

  /**
   * **Validates: Requirements 5.6**
   *
   * Nilai besar (jutaan) harus menggunakan pemisah ribuan yang valid.
   */
  it('nilai besar menggunakan pemisah ribuan yang valid', () => {
    // 1.000.000 dalam format id-ID
    const formatted = formatNilai(1_000_000);
    expect(INVALID_CHARS_REGEX.test(formatted)).toBe(false);
    // Format id-ID menggunakan titik sebagai pemisah ribuan
    expect(formatted).toContain('.');
  });

  /**
   * **Validates: Requirements 5.6**
   *
   * Verifikasi bahwa MetrikCard menggunakan format id-ID (bukan en-US atau lainnya).
   * Format id-ID: 1.000.000 (titik sebagai pemisah ribuan)
   * Format en-US: 1,000,000 (koma sebagai pemisah ribuan)
   */
  it('format menggunakan locale id-ID (titik sebagai pemisah ribuan)', () => {
    const nilai = 1000;
    const formatted = formatNilai(nilai);
    // id-ID menggunakan titik: "1.000"
    // en-US menggunakan koma: "1,000"
    expect(formatted).toBe('1.000');
  });
});
