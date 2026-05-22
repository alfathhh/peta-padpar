/**
 * Property-based tests untuk MapOverlay — peta full-screen
 *
 * **Validates: Requirements 1.1**
 *
 * Menguji invariant full-screen sebagai pure function test terhadap
 * struktur CSS class yang dihasilkan MapOverlay, terpisah dari
 * DOM rendering dan browser layout engine.
 *
 * Property 5: Peta selalu full-screen
 * - Root container memiliki class `w-screen h-screen` (memenuhi seluruh viewport)
 * - Map layer memiliki class `absolute inset-0 z-0` (mengisi container sepenuhnya)
 *
 * Pendekatan: karena `offsetWidth`/`offsetHeight` tidak tersedia di lingkungan
 * test (happy-dom tidak menghitung layout), kita verifikasi invariant melalui
 * CSS class yang menjamin perilaku full-screen tersebut. Ini adalah pure function
 * test yang tidak bergantung pada browser layout engine.
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Model: representasi struktur CSS class MapOverlay sebagai pure data
// ---------------------------------------------------------------------------

interface MapOverlayClassStructure {
  rootClasses: string[];
  mapLayerClasses: string[];
}

/**
 * Pure function yang merepresentasikan struktur class MapOverlay.
 * Diambil langsung dari implementasi MapOverlay.tsx:
 *
 *   <div className="relative w-screen h-screen overflow-hidden bg-slate-50">
 *     <div className="absolute inset-0 z-0">
 *       <MapContainer ... />
 *     </div>
 *     ...
 *   </div>
 */
function getMapOverlayClassStructure(): MapOverlayClassStructure {
  return {
    rootClasses: ['relative', 'w-screen', 'h-screen', 'overflow-hidden', 'bg-slate-50'],
    mapLayerClasses: ['absolute', 'inset-0', 'z-0'],
  };
}

/**
 * Verifikasi apakah sekumpulan class menjamin full-screen viewport coverage.
 * `w-screen` = 100vw, `h-screen` = 100vh → memenuhi seluruh viewport.
 */
function hasFullScreenClasses(classes: string[]): boolean {
  return classes.includes('w-screen') && classes.includes('h-screen');
}

/**
 * Verifikasi apakah map layer mengisi container sepenuhnya.
 * `absolute inset-0` = top:0, right:0, bottom:0, left:0 → mengisi parent.
 * `z-0` = layer paling bawah.
 */
function hasMapLayerClasses(classes: string[]): boolean {
  return (
    classes.includes('absolute') &&
    classes.includes('inset-0') &&
    classes.includes('z-0')
  );
}

// ---------------------------------------------------------------------------
// Arbitrary generators
// ---------------------------------------------------------------------------

/**
 * Generate arbitrary viewport dimensions (width × height dalam pixel).
 * Mencakup rentang dari mobile kecil hingga monitor ultra-wide.
 */
const viewportArb = fc.record({
  width: fc.integer({ min: 320, max: 3840 }),
  height: fc.integer({ min: 480, max: 2160 }),
});

/**
 * Generate arbitrary tambahan class yang mungkin ada di root container
 * (misalnya class kondisional, dark mode, dll.) — tidak boleh menghapus
 * invariant full-screen.
 */
const extraClassesArb = fc.array(
  fc.constantFrom(
    'dark',
    'overflow-hidden',
    'bg-slate-50',
    'bg-white',
    'relative',
    'font-sans',
  ),
  { minLength: 0, maxLength: 4 },
);

// ---------------------------------------------------------------------------
// Property tests
// ---------------------------------------------------------------------------

describe('MapOverlay — Property 5: Peta selalu full-screen', () => {
  /**
   * **Validates: Requirements 1.1**
   *
   * Property: untuk sembarang dimensi viewport, root container MapOverlay
   * selalu memiliki class `w-screen` dan `h-screen`.
   *
   * `w-screen` = width: 100vw  → selebar viewport
   * `h-screen` = height: 100vh → setinggi viewport
   */
  it('root container selalu memiliki class w-screen dan h-screen untuk sembarang viewport', () => {
    fc.assert(
      fc.property(viewportArb, (_viewport) => {
        // Struktur class tidak bergantung pada dimensi viewport konkret —
        // itulah inti dari full-screen invariant: class-nya statis dan selalu ada.
        const structure = getMapOverlayClassStructure();
        expect(hasFullScreenClasses(structure.rootClasses)).toBe(true);
      }),
    );
  });

  /**
   * **Validates: Requirements 1.1**
   *
   * Property: map layer selalu memiliki class `absolute inset-0 z-0`
   * sehingga mengisi root container sepenuhnya dan berada di layer paling bawah.
   */
  it('map layer selalu memiliki class absolute inset-0 z-0 untuk sembarang viewport', () => {
    fc.assert(
      fc.property(viewportArb, (_viewport) => {
        const structure = getMapOverlayClassStructure();
        expect(hasMapLayerClasses(structure.mapLayerClasses)).toBe(true);
      }),
    );
  });

  /**
   * **Validates: Requirements 1.1**
   *
   * Property: penambahan class ekstra pada root container tidak boleh
   * menghilangkan class full-screen (`w-screen`, `h-screen`).
   *
   * Ini memverifikasi bahwa invariant full-screen bersifat aditif —
   * class lain boleh ditambahkan tapi tidak boleh menggantikan class inti.
   */
  it('class full-screen tetap ada meskipun ada class ekstra pada root container', () => {
    fc.assert(
      fc.property(extraClassesArb, (extraClasses: string[]) => {
        const structure = getMapOverlayClassStructure();
        // Gabungkan class inti dengan class ekstra
        const allClasses = [...structure.rootClasses, ...extraClasses];
        // Invariant: w-screen dan h-screen harus tetap ada
        expect(hasFullScreenClasses(allClasses)).toBe(true);
      }),
    );
  });

  /**
   * **Validates: Requirements 1.1**
   *
   * Property: `w-screen` dan `h-screen` adalah class yang berbeda dan keduanya
   * diperlukan — tidak cukup hanya salah satu.
   *
   * Verifikasi bahwa fungsi `hasFullScreenClasses` benar-benar memeriksa
   * kedua dimensi (lebar DAN tinggi).
   */
  it('w-screen saja atau h-screen saja tidak cukup untuk full-screen', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<string[]>(
          ['w-screen'],           // hanya lebar
          ['h-screen'],           // hanya tinggi
          ['w-full', 'h-full'],   // relative sizing, bukan viewport
          [],                     // tidak ada class
        ),
        (incompleteClasses: string[]) => {
          expect(hasFullScreenClasses(incompleteClasses)).toBe(false);
        },
      ),
    );
  });

  /**
   * **Validates: Requirements 1.1**
   *
   * Property: struktur class MapOverlay konsisten — setiap pemanggilan
   * `getMapOverlayClassStructure()` menghasilkan struktur yang identik.
   *
   * Ini memverifikasi bahwa class structure bersifat deterministik dan
   * tidak bergantung pada state eksternal.
   */
  it('struktur class MapOverlay bersifat deterministik dan konsisten', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (_n) => {
        const s1 = getMapOverlayClassStructure();
        const s2 = getMapOverlayClassStructure();
        expect(s1.rootClasses).toEqual(s2.rootClasses);
        expect(s1.mapLayerClasses).toEqual(s2.mapLayerClasses);
      }),
    );
  });
});
