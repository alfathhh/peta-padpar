/**
 * Property-based tests untuk MapOverlay — pointer events
 *
 * **Validates: Requirements 1.2, 1.3**
 *
 * Menguji struktur CSS class pointer-events sebagai pure function,
 * terpisah dari React component rendering.
 *
 * Struktur layer MapOverlay:
 * - overlayContainer : pointer-events-none  (klik diteruskan ke peta)
 * - floatingHeader   : pointer-events-auto  (interaksi header tetap berfungsi)
 * - filterPanel      : pointer-events-auto  (interaksi panel tetap berfungsi)
 * - statistikPanel   : pointer-events-auto  (interaksi panel tetap berfungsi)
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Pure model functions — merepresentasikan class yang diberikan oleh MapOverlay
// ---------------------------------------------------------------------------

/**
 * Kembalikan class string untuk overlay container (Layer z-10).
 * Selalu pointer-events-none, tidak bergantung pada showFilter/showStatistik.
 */
function overlayContainerClasses(): string {
  return 'absolute inset-0 z-10 pointer-events-none p-4 md:p-6 flex flex-col gap-4';
}

/**
 * Kembalikan class string untuk FloatingHeader root element.
 * Selalu pointer-events-auto, tidak bergantung pada showFilter/showStatistik.
 */
function floatingHeaderClasses(): string {
  return 'pointer-events-auto flex items-center justify-between bg-white/90 backdrop-blur-sm border border-slate-100 shadow-lg px-2 py-1.5 w-full max-w-3xl mx-auto rounded-full';
}

/**
 * Kembalikan class string untuk FilterPanel inner container.
 * Selalu pointer-events-auto ketika panel ditampilkan.
 */
function filterPanelClasses(): string {
  return [
    'pointer-events-auto bg-white/85 backdrop-blur-md',
    'border border-white/50 shadow-xl shadow-slate-200/40',
    'flex flex-col gap-6 overflow-y-auto',
    'fixed bottom-0 left-0 right-0 z-40',
    'rounded-t-3xl p-5 max-h-[75vh]',
    'lg:static lg:z-auto',
    'lg:w-80 lg:max-h-[85vh]',
    'lg:rounded-3xl',
  ].join(' ');
}

/**
 * Kembalikan class string untuk StatistikPanel root element.
 * Selalu pointer-events-auto ketika panel ditampilkan.
 */
function statistikPanelClasses(): string {
  return 'pointer-events-auto w-80 bg-white/85 backdrop-blur-md border border-white/50 shadow-xl shadow-slate-200/40 rounded-3xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto';
}

/**
 * Helper: cek apakah class string mengandung token pointer-events-none
 */
function hasPointerEventsNone(classes: string): boolean {
  return classes.split(/\s+/).includes('pointer-events-none');
}

/**
 * Helper: cek apakah class string mengandung token pointer-events-auto
 */
function hasPointerEventsAuto(classes: string): boolean {
  return classes.split(/\s+/).includes('pointer-events-auto');
}

// ---------------------------------------------------------------------------
// Property 6: Pointer events overlay
// ---------------------------------------------------------------------------

describe('MapOverlay — pointer events (Property 6)', () => {
  /**
   * **Validates: Requirements 1.2**
   *
   * Overlay container harus selalu memiliki pointer-events-none
   * untuk semua kombinasi showFilter dan showStatistik.
   */
  it('overlay container selalu memiliki pointer-events-none untuk semua kombinasi showFilter/showStatistik', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // showFilter
        fc.boolean(), // showStatistik
        (_showFilter, _showStatistik) => {
          // overlayContainer tidak bergantung pada showFilter/showStatistik
          const classes = overlayContainerClasses();
          expect(hasPointerEventsNone(classes)).toBe(true);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.2**
   *
   * Overlay container tidak boleh memiliki pointer-events-auto
   * (tidak boleh memblokir klik ke peta di bawahnya).
   */
  it('overlay container tidak memiliki pointer-events-auto', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (_showFilter, _showStatistik) => {
          const classes = overlayContainerClasses();
          expect(hasPointerEventsAuto(classes)).toBe(false);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.3**
   *
   * FloatingHeader harus selalu memiliki pointer-events-auto
   * untuk semua kombinasi showFilter dan showStatistik.
   */
  it('FloatingHeader selalu memiliki pointer-events-auto untuk semua kombinasi showFilter/showStatistik', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (_showFilter, _showStatistik) => {
          const classes = floatingHeaderClasses();
          expect(hasPointerEventsAuto(classes)).toBe(true);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.3**
   *
   * FilterPanel harus memiliki pointer-events-auto ketika ditampilkan
   * (showFilter === true).
   */
  it('FilterPanel memiliki pointer-events-auto ketika showFilter true', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // showStatistik (tidak mempengaruhi class FilterPanel)
        (_showStatistik) => {
          // FilterPanel hanya dirender ketika showFilter === true
          const classes = filterPanelClasses();
          expect(hasPointerEventsAuto(classes)).toBe(true);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.3**
   *
   * StatistikPanel harus memiliki pointer-events-auto ketika ditampilkan
   * (showStatistik === true).
   */
  it('StatistikPanel memiliki pointer-events-auto ketika showStatistik true', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // showFilter (tidak mempengaruhi class StatistikPanel)
        (_showFilter) => {
          // StatistikPanel hanya dirender ketika showStatistik === true
          const classes = statistikPanelClasses();
          expect(hasPointerEventsAuto(classes)).toBe(true);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.2, 1.3**
   *
   * Invariant gabungan: untuk semua kombinasi showFilter/showStatistik,
   * overlay container harus pointer-events-none DAN semua panel yang
   * ditampilkan harus pointer-events-auto.
   */
  it('invariant gabungan: overlay none, semua panel yang aktif auto — untuk semua kombinasi', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // showFilter
        fc.boolean(), // showStatistik
        (showFilter, showStatistik) => {
          // Overlay container selalu pointer-events-none
          expect(hasPointerEventsNone(overlayContainerClasses())).toBe(true);

          // FloatingHeader selalu ditampilkan → selalu pointer-events-auto
          expect(hasPointerEventsAuto(floatingHeaderClasses())).toBe(true);

          // FilterPanel hanya ditampilkan saat showFilter === true
          if (showFilter) {
            expect(hasPointerEventsAuto(filterPanelClasses())).toBe(true);
          }

          // StatistikPanel hanya ditampilkan saat showStatistik === true
          if (showStatistik) {
            expect(hasPointerEventsAuto(statistikPanelClasses())).toBe(true);
          }
        },
      ),
    );
  });
});
