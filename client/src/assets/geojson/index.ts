// Re-export GeoJSON data as typed ES modules.
// Vite bundles these into the JS output — the raw .geojson files are never served as public URLs.
// The inline Vite plugin in vite.config.ts handles .geojson → ES module transformation.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import kecamatan from './kecamatan.geojson';
// @ts-ignore
import kabupaten from './kabupaten.geojson';
// @ts-ignore
import nagari from './nagari.geojson';
// @ts-ignore
import korong from './korong.geojson';

export const kecamatanGeoJSON = kecamatan as GeoJSON.FeatureCollection;
export const kabupatenGeoJSON = kabupaten as GeoJSON.FeatureCollection;
export const nagariGeoJSON    = nagari    as GeoJSON.FeatureCollection;
export const korongGeoJSON    = korong    as GeoJSON.FeatureCollection;
