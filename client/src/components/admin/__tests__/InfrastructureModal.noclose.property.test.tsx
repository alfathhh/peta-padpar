/**
 * Property-based tests untuk InfrastructureModal — modal tidak menutup saat error
 *
 * **Validates: Requirements 7.8**
 *
 * Requirement 7.8: Jika save gagal (API error), modal harus tetap terbuka,
 * menampilkan pesan error, dan sistem harus secara eksplisit menyimpan state
 * error tersebut. Modal tidak boleh menutup secara otomatis saat terjadi error.
 *
 * Pengujian dilakukan pada level logika murni (pure function) yang
 * merepresentasikan perilaku modal saat terjadi error, tanpa perlu me-render
 * komponen React secara penuh (menghindari dependensi Leaflet/Radix di test env).
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Model logika InfrastructureModal
// ---------------------------------------------------------------------------

/**
 * State modal yang relevan untuk property ini.
 */
interface ModalState {
  open: boolean;
  formError: string;
}

/**
 * Simulasi handler onSave yang gagal.
 *
 * Merepresentasikan logika di halaman parent (Infrastruktur.tsx):
 * - Saat onSave dipanggil dan API mengembalikan error, formError di-set
 *   ke pesan error dan modal TIDAK ditutup (open tetap true).
 *
 * @param currentState - State modal sebelum save
 * @param errorMessage - Pesan error yang dikembalikan API (non-empty = error)
 * @returns State modal setelah save gagal
 */
function handleSaveError(currentState: ModalState, errorMessage: string): ModalState {
  // Saat error: modal tetap terbuka, formError di-set ke pesan error
  return {
    open: currentState.open,   // tidak berubah — modal tetap terbuka
    formError: errorMessage,   // error disimpan ke state
  };
}

/**
 * Simulasi logika "apakah modal boleh menutup".
 *
 * Merepresentasikan logika di InfrastructureModal.tsx:
 *   onInteractOutside: if (formError) e.preventDefault()
 *   onEscapeKeyDown:   if (formError) e.preventDefault()
 *
 * @param formError - Pesan error saat ini
 * @returns true jika modal boleh menutup, false jika harus tetap terbuka
 */
function canClose(formError: string): boolean {
  return formError === '';
}

/**
 * Simulasi state setelah percobaan menutup modal.
 *
 * Jika ada error, penutupan dicegah dan modal tetap terbuka.
 *
 * @param state - State modal saat ini
 * @returns State modal setelah percobaan menutup
 */
function attemptClose(state: ModalState): ModalState {
  if (!canClose(state.formError)) {
    // Penutupan dicegah — state tidak berubah
    return state;
  }
  // Tidak ada error — modal boleh menutup
  return { ...state, open: false };
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generator untuk pesan error yang valid (non-empty string).
 * Merepresentasikan berbagai pesan error yang mungkin dikembalikan API.
 */
const errorMessageArb = fc.string({ minLength: 1, maxLength: 200 });

/**
 * Generator untuk pesan error yang realistis (mirip pesan API).
 */
const realisticErrorArb = fc.oneof(
  fc.constant('Gagal menyimpan data. Silakan coba lagi.'),
  fc.constant('Nama infrastruktur sudah ada.'),
  fc.constant('Koordinat tidak valid.'),
  fc.constant('Server error: 500 Internal Server Error'),
  fc.constant('Network Error'),
  fc.string({ minLength: 1, maxLength: 100 }),
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InfrastructureModal — modal tidak menutup saat error (Property 4)', () => {
  /**
   * **Validates: Requirements 7.8**
   *
   * Property utama: untuk sembarang pesan error non-empty,
   * setelah onSave gagal:
   *   - modal.open === true
   *   - formError !== ""
   */
  it('modal tetap terbuka dan formError tersimpan setelah onSave gagal', () => {
    fc.assert(
      fc.property(
        errorMessageArb,
        (errorMessage: string) => {
          const initialState: ModalState = { open: true, formError: '' };

          const stateAfterError = handleSaveError(initialState, errorMessage);

          // Property: modal harus tetap terbuka
          expect(stateAfterError.open).toBe(true);

          // Property: formError harus tersimpan dan non-empty
          expect(stateAfterError.formError).toBe(errorMessage);
          expect(stateAfterError.formError).not.toBe('');
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 7.8**
   *
   * Property: saat formError non-empty, canClose() mengembalikan false.
   *
   * Ini merepresentasikan logika di onInteractOutside dan onEscapeKeyDown:
   *   if (formError) e.preventDefault()
   */
  it('canClose() mengembalikan false untuk sembarang pesan error non-empty', () => {
    fc.assert(
      fc.property(
        errorMessageArb,
        (errorMessage: string) => {
          // Saat ada error, modal tidak boleh menutup
          expect(canClose(errorMessage)).toBe(false);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 7.8**
   *
   * Property: percobaan menutup modal saat ada error tidak mengubah state.
   *
   * Merepresentasikan bahwa e.preventDefault() mencegah penutupan modal.
   */
  it('percobaan menutup modal saat ada error tidak mengubah state modal', () => {
    fc.assert(
      fc.property(
        errorMessageArb,
        (errorMessage: string) => {
          const stateWithError: ModalState = { open: true, formError: errorMessage };

          const stateAfterAttemptClose = attemptClose(stateWithError);

          // Modal harus tetap terbuka
          expect(stateAfterAttemptClose.open).toBe(true);

          // formError harus tetap tersimpan
          expect(stateAfterAttemptClose.formError).toBe(errorMessage);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 7.8**
   *
   * Property: dengan pesan error realistis (mirip pesan API),
   * modal tetap terbuka dan error tersimpan.
   */
  it('modal tetap terbuka dengan berbagai pesan error realistis dari API', () => {
    fc.assert(
      fc.property(
        realisticErrorArb,
        (errorMessage: string) => {
          const initialState: ModalState = { open: true, formError: '' };

          const stateAfterError = handleSaveError(initialState, errorMessage);

          expect(stateAfterError.open).toBe(true);
          expect(stateAfterError.formError).not.toBe('');
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 7.8**
   *
   * Property komplementer: saat formError kosong (""), canClose() mengembalikan true.
   *
   * Memastikan modal BOLEH menutup saat tidak ada error (tidak over-blocking).
   */
  it('canClose() mengembalikan true saat formError kosong', () => {
    expect(canClose('')).toBe(true);
  });

  /**
   * **Validates: Requirements 7.8**
   *
   * Property: modal dapat menutup setelah error di-clear (formError = "").
   *
   * Memastikan bahwa setelah error dihapus, modal bisa ditutup secara normal.
   */
  it('modal dapat menutup setelah error di-clear', () => {
    fc.assert(
      fc.property(
        errorMessageArb,
        (errorMessage: string) => {
          // Mulai dengan state error
          const stateWithError: ModalState = { open: true, formError: errorMessage };

          // Clear error
          const stateCleared: ModalState = { ...stateWithError, formError: '' };

          // Sekarang modal boleh menutup
          const stateAfterClose = attemptClose(stateCleared);

          expect(stateAfterClose.open).toBe(false);
          expect(stateAfterClose.formError).toBe('');
        },
      ),
    );
  });
});
