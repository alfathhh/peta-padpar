import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import {
  useKecamatanGeoJSON,
  useKorongGeoJSON,
  useNagariGeoJSON,
} from '../../hooks/useWilayahGeoJSON';
import { NAMA_KABUPATEN } from '../../constants';
import { Select } from '../ui/Select';
import { Icon } from '../ui/Icon';

export default function FilterWilayah() {
  const {
    idkec,
    iddesa,
    idsls,
    setIdkec,
    setIddesa,
    setIdsls,
    resetWilayah,
  } = useFilterStore();

  const kecamatanList = useKecamatanGeoJSON();
  const nagariList = useNagariGeoJSON(idkec);
  const korongList = useKorongGeoJSON(iddesa);

  const hasFilter = idkec !== '' || iddesa !== '' || idsls !== '';
  const kecLabel = kecamatanList.find(kecamatan => kecamatan.kode === idkec)?.nama;
  const nagariLabel = nagariList.find(nagari => nagari.kode === iddesa)?.nama;
  const korongLabel = korongList.find(korong => korong.kode === idsls)?.nama;
  const ringkasanWilayah = [NAMA_KABUPATEN, kecLabel, nagariLabel, korongLabel].filter(Boolean).join(' / ');

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-primary-700 shadow-soft">
            <Icon name="map-pin" className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">Wilayah aktif</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">{ringkasanWilayah}</p>
          </div>
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={resetWilayah}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-white px-3 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50 active:scale-[0.99]"
          >
            <Icon name="arrow-counterclockwise" className="h-3.5 w-3.5" />
            Kembali ke seluruh kabupaten
          </button>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Kabupaten</label>
        <div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm font-medium text-neutral-500">
          {NAMA_KABUPATEN}
        </div>
      </div>

      <Select label="Kecamatan" value={idkec} onChange={event => setIdkec(event.target.value)} className="h-11">
        <option value="">Semua Kecamatan</option>
        {kecamatanList.map(kecamatan => (
          <option key={kecamatan.kode} value={kecamatan.kode}>{kecamatan.nama}</option>
        ))}
      </Select>

      <Select
        label="Nagari / Desa"
        value={iddesa}
        onChange={event => setIddesa(event.target.value)}
        disabled={!idkec}
        className="h-11"
      >
        <option value="">Semua Nagari</option>
        {nagariList.map(nagari => (
          <option key={nagari.kode} value={nagari.kode}>{nagari.nama}</option>
        ))}
      </Select>

      <Select
        label="Korong / Dusun"
        value={idsls}
        onChange={event => setIdsls(event.target.value)}
        disabled={!iddesa}
        className="h-11"
      >
        <option value="">Semua Korong</option>
        {korongList.map(korong => (
          <option key={korong.kode} value={korong.kode}>{korong.nama}</option>
        ))}
      </Select>
    </div>
  );
}
