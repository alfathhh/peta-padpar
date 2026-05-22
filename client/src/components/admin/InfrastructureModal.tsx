import React, { useRef, useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import {
  X,
  UploadCloud,
  ChevronDown,
  Check,
  MapPin,
} from 'lucide-react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { InfrastrukturFormData, KategoriInfra } from '../../types';
import { KATEGORI_ICON_MAP } from '../../lib/kategoriIcons';
import { useKecamatanGeoJSON, useNagariGeoJSON, useKorongGeoJSON } from '../../hooks/useWilayahGeoJSON';
import { cn } from '../../lib/cn';
import { BASEMAP_GOOGLE_ATTRIBUTION, BASEMAP_GOOGLE_ROAD, MAP_CENTER } from '../../constants';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface InfrastructureModalProps {
  open: boolean;
  onClose: () => void;
  editId: number | null;
  form: InfrastrukturFormData;
  onFormChange: (form: InfrastrukturFormData) => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  saving: boolean;
  formError: string;
  kategoriList: KategoriInfra[];
}

// ─── Input style ────────────────────────────────────────────────────────────
const inputClass =
  'w-full bg-white border border-slate-200 shadow-sm ' +
  'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ' +
  'transition-all duration-200 rounded-xl px-3 py-2 text-sm outline-none';

const labelClass = 'text-sm font-medium text-slate-700 mb-1.5 block';

// ─── MapPicker ───────────────────────────────────────────────────────────────
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onChange(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function MapReady() {
  const map = useMap();
  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize?.({ animate: false });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [map]);
  return null;
}

function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | '';
  lng: number | '';
  onChange: (lat: number, lng: number) => void;
}) {
  const center: [number, number] =
    lat !== '' && lng !== '' ? [lat, lng] : MAP_CENTER;

  return (
    <div
      className="rounded-xl overflow-hidden border border-slate-200 cursor-crosshair"
      style={{ height: 200 }}
    >
      <LeafletMap
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <TileLayer
          url={BASEMAP_GOOGLE_ROAD}
          attribution={BASEMAP_GOOGLE_ATTRIBUTION}
          maxZoom={20}
        />
        <ClickHandler onChange={onChange} />
        <MapReady />
        {lat !== '' && lng !== '' && <Marker position={[lat, lng]} />}
      </LeafletMap>
    </div>
  );
}

// ─── PhotoDropZone ───────────────────────────────────────────────────────────
function PhotoDropZone({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');

  const validateAndSet = useCallback(
    (file: File) => {
      setFileError('');
      if (!file.type.startsWith('image/')) {
        setFileError('File harus berupa gambar (PNG, JPG, WebP, dll.)');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError('Ukuran file maksimal 5MB');
        return;
      }
      // Create a local object URL for preview; actual upload handled by parent
      const url = URL.createObjectURL(file);
      onChange(url);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSet(file);
      e.target.value = '';
    },
    [validateAndSet],
  );

  return (
    <div className="space-y-1.5">
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={value}
            alt="Preview foto"
            className="aspect-video w-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-xs font-medium text-slate-700 shadow-sm transition-colors"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-2.5 py-1 rounded-lg bg-red-50/90 hover:bg-red-100 text-xs font-medium text-red-600 shadow-sm transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload foto — klik atau seret file ke sini"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          className={cn(
            'border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8',
            'transition-all duration-200 cursor-pointer group',
            dragOver
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50',
          )}
        >
          <UploadCloud
            size={32}
            className={cn(
              'mb-2 transition-colors duration-200',
              dragOver
                ? 'text-emerald-500'
                : 'text-slate-300 group-hover:text-emerald-400',
            )}
          />
          <p className="text-sm text-slate-500">Klik atau seret foto ke sini</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP maks. 5MB</p>
        </div>
      )}

      {fileError && (
        <p className="text-xs text-red-600">{fileError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}

// ─── InfrastructureModal ─────────────────────────────────────────────────────
export function InfrastructureModal({
  open,
  onClose,
  editId,
  form,
  onFormChange,
  onSave,
  saving,
  formError,
  kategoriList,
}: InfrastructureModalProps) {
  const kecamatanList = useKecamatanGeoJSON();
  const nagariList = useNagariGeoJSON(form.idkec);
  const korongList = useKorongGeoJSON(form.iddesa);

  const set = useCallback(
    (patch: Partial<InfrastrukturFormData>) => onFormChange({ ...form, ...patch }),
    [form, onFormChange],
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        // Only allow closing via explicit onClose — never auto-close on error
        if (!isOpen) onClose();
      }}
    >
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" />

        {/* Content */}
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-white rounded-2xl shadow-2xl border border-slate-100',
            'w-full max-w-lg overflow-hidden p-6 gap-6 flex flex-col',
            'z-[101] max-h-[90vh] overflow-y-auto',
          )}
          // Prevent closing on outside click when there's an error
          onInteractOutside={(e) => {
            if (formError) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (formError) e.preventDefault();
          }}
          aria-describedby={formError ? 'infra-form-error' : undefined}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <Dialog.Title className="text-xl font-bold text-slate-900 tracking-tight">
              {editId ? 'Edit Infrastruktur' : 'Tambah Infrastruktur'}
            </Dialog.Title>
            <Dialog.Close
              onClick={onClose}
              className="hover:bg-slate-100 rounded-full p-1 text-slate-400 transition-colors"
              aria-label="Tutup modal"
            >
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* ── Form ── */}
          <form id="infra-form" onSubmit={onSave} className="space-y-4">
            {/* Nama */}
            <div>
              <label htmlFor="infra-nama" className={labelClass}>
                Nama <span className="text-red-500">*</span>
              </label>
              <input
                id="infra-nama"
                className={inputClass}
                placeholder="Nama infrastruktur"
                required
                value={form.nama}
                onChange={(e) => set({ nama: e.target.value })}
              />
            </div>

            {/* Kategori — Radix Select */}
            <div>
              <label className={labelClass}>
                Kategori <span className="text-red-500">*</span>
              </label>
              <Select.Root
                value={form.kategori}
                onValueChange={(v) => set({ kategori: v })}
              >
                <Select.Trigger
                  className={cn(
                    inputClass,
                    'flex items-center justify-between',
                    'data-[placeholder]:text-slate-400',
                  )}
                  aria-label="Pilih kategori"
                >
                  <Select.Value placeholder="-- Pilih Kategori --" />
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content
                    className="bg-white rounded-xl border border-slate-200 shadow-xl z-[200] overflow-hidden"
                    position="popper"
                    sideOffset={4}
                  >
                    <Select.Viewport className="p-1">
                      {kategoriList.map((kat) => {
                        const Icon = KATEGORI_ICON_MAP[kat.value] ?? MapPin;
                        return (
                          <Select.Item
                            key={kat.value}
                            value={kat.value}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 text-sm rounded-lg',
                              'cursor-pointer hover:bg-slate-50 focus:bg-slate-50 outline-none',
                              'data-[highlighted]:bg-slate-50',
                            )}
                          >
                            <Icon size={16} className="text-slate-500 shrink-0" />
                            <Select.ItemText>{kat.label}</Select.ItemText>
                            <Select.ItemIndicator className="ml-auto">
                              <Check size={14} className="text-emerald-500" />
                            </Select.ItemIndicator>
                          </Select.Item>
                        );
                      })}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Alamat */}
            <div>
              <label htmlFor="infra-alamat" className={labelClass}>
                Alamat
              </label>
              <input
                id="infra-alamat"
                className={inputClass}
                placeholder="Alamat lengkap"
                value={form.alamat}
                onChange={(e) => set({ alamat: e.target.value })}
              />
            </div>

            {/* Foto upload */}
            <div>
              <label className={labelClass}>Foto</label>
              <PhotoDropZone
                value={form.fotoUrl}
                onChange={(url) => set({ fotoUrl: url })}
              />
            </div>

            {/* Koordinat — MapPicker */}
            <div>
              <label className={labelClass}>
                Koordinat <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1 text-xs">
                  — klik peta untuk memilih lokasi
                </span>
              </label>
              <MapPicker
                lat={form.lat}
                lng={form.lng}
                onChange={(lat, lng) => set({ lat, lng })}
              />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label htmlFor="infra-lat" className="text-xs font-medium text-slate-600 mb-1 block">
                    Latitude
                  </label>
                  <input
                    id="infra-lat"
                    type="number"
                    step="any"
                    className={cn(inputClass, 'font-mono')}
                    placeholder="-0.5397"
                    value={form.lat}
                    onChange={(e) =>
                      set({ lat: e.target.value === '' ? '' : parseFloat(e.target.value) || '' })
                    }
                  />
                </div>
                <div>
                  <label htmlFor="infra-lng" className="text-xs font-medium text-slate-600 mb-1 block">
                    Longitude
                  </label>
                  <input
                    id="infra-lng"
                    type="number"
                    step="any"
                    className={cn(inputClass, 'font-mono')}
                    placeholder="100.1187"
                    value={form.lng}
                    onChange={(e) =>
                      set({ lng: e.target.value === '' ? '' : parseFloat(e.target.value) || '' })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Wilayah — Kecamatan / Nagari / Korong */}
            <div className="grid grid-cols-3 gap-3">
              {/* Kecamatan */}
              <div>
                <label htmlFor="infra-kec" className={labelClass}>
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  id="infra-kec"
                  className={inputClass}
                  value={form.idkec}
                  onChange={(e) =>
                    set({ idkec: e.target.value, iddesa: '', idsls: '' })
                  }
                >
                  <option value="">-- Pilih --</option>
                  {kecamatanList.map((k) => (
                    <option key={k.kode} value={k.kode}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nagari */}
              <div>
                <label htmlFor="infra-nagari" className={labelClass}>
                  Nagari <span className="text-red-500">*</span>
                </label>
                <select
                  id="infra-nagari"
                  className={inputClass}
                  value={form.iddesa}
                  disabled={!form.idkec}
                  onChange={(e) => set({ iddesa: e.target.value, idsls: '' })}
                >
                  <option value="">-- Pilih --</option>
                  {nagariList.map((n) => (
                    <option key={n.kode} value={n.kode}>
                      {n.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Korong */}
              <div>
                <label htmlFor="infra-korong" className={labelClass}>
                  Korong
                </label>
                <select
                  id="infra-korong"
                  className={inputClass}
                  value={form.idsls}
                  disabled={!form.iddesa}
                  onChange={(e) => set({ idsls: e.target.value })}
                >
                  <option value="">-- Pilih --</option>
                  {korongList.map((k) => (
                    <option key={k.kode} value={k.kode}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form error */}
            {formError && (
              <div
                id="infra-form-error"
                role="alert"
                className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2 text-sm"
              >
                {formError}
              </div>
            )}
          </form>

          {/* ── Footer ── */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Dialog.Close
              onClick={onClose}
              className={cn(
                'px-4 py-2 text-sm font-medium text-slate-600',
                'border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors',
              )}
            >
              Batal
            </Dialog.Close>
            <button
              type="submit"
              form="infra-form"
              disabled={saving}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white',
                'bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default InfrastructureModal;
