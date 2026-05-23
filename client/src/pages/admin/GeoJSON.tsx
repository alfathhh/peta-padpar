import React, { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/cn';

type Layer = 'kabupaten' | 'kecamatan' | 'nagari' | 'korong';

interface LayerInfo {
  layer: Layer;
  size: number | null;
  updatedAt: string | null;
  featureCount: number | null;
}

const LAYER_META: Record<Layer, { label: string; desc: string; requiredProps: string }> = {
  kabupaten: {
    label: 'Kabupaten',
    desc: 'Batas wilayah kabupaten. Ditampilkan sebagai latar belakang peta.',
    requiredProps: 'idkab',
  },
  kecamatan: {
    label: 'Kecamatan',
    desc: 'Batas kecamatan. Ditampilkan saat belum ada filter wilayah aktif.',
    requiredProps: 'idkec, nmkec',
  },
  nagari: {
    label: 'Nagari / Desa',
    desc: 'Batas nagari. Ditampilkan saat filter kecamatan aktif.',
    requiredProps: 'idkec, iddesa, nmdesa',
  },
  korong: {
    label: 'Korong / Dusun',
    desc: 'Batas korong. Ditampilkan saat filter nagari aktif.',
    requiredProps: 'idkec, iddesa, idsls, nmsls',
  },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

interface LayerCardProps {
  info: LayerInfo;
  onUpload: (layer: Layer, file: File) => Promise<void>;
  onDelete: (layer: Layer) => Promise<void>;
  uploading: boolean;
  deleting: boolean;
}

function LayerCard({ info, onUpload, onDelete, uploading, deleting }: LayerCardProps) {
  const meta = LAYER_META[info.layer];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const hasFile = info.size !== null;

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onUpload(info.layer, files[0]);
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex h-2 w-2 rounded-full shrink-0',
              hasFile ? 'bg-success-500' : 'bg-neutral-300',
            )} />
            <h3 className="font-semibold text-neutral-900 text-sm">{meta.label}</h3>
          </div>
          <p className="mt-1 text-xs text-neutral-500">{meta.desc}</p>
        </div>

        {hasFile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(info.layer)}
            isLoading={deleting}
            className="text-danger-500 hover:bg-danger-50 shrink-0"
            aria-label={`Hapus ${meta.label}`}
          >
            <Icon name="trash" className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Stats */}
      {hasFile && (
        <div className="grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100 text-center">
          <div className="px-3 py-3">
            <p className="text-xs text-neutral-500">Ukuran</p>
            <p className="mt-0.5 text-sm font-medium text-neutral-900">{formatBytes(info.size!)}</p>
          </div>
          <div className="px-3 py-3">
            <p className="text-xs text-neutral-500">Features</p>
            <p className="mt-0.5 text-sm font-medium text-neutral-900">
              {info.featureCount !== null ? info.featureCount.toLocaleString('id-ID') : '—'}
            </p>
          </div>
          <div className="px-3 py-3">
            <p className="text-xs text-neutral-500">Diperbarui</p>
            <p className="mt-0.5 text-xs font-medium text-neutral-700">
              {info.updatedAt ? formatDate(info.updatedAt) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        className={cn(
          'relative m-4 rounded-lg border-2 border-dashed transition-colors',
          dragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300',
          (uploading || deleting) && 'pointer-events-none opacity-60',
        )}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".geojson,.json"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
          {uploading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              <p className="text-xs text-neutral-500">Mengupload...</p>
            </>
          ) : (
            <>
              <Icon name="layers" className="h-5 w-5 text-neutral-400" />
              <p className="text-xs text-neutral-600">
                {hasFile ? 'Drag & drop untuk ganti, atau' : 'Drag & drop file GeoJSON, atau'}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
              >
                {hasFile ? 'Pilih file baru' : 'Pilih file'}
              </Button>
              <p className="text-[11px] text-neutral-400">
                .geojson / .json · maks 50MB · wajib: <code className="font-mono">{meta.requiredProps}</code>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminGeoJSON() {
  useEffect(() => { document.title = 'GeoJSON — Admin Peta Tematik'; }, []);

  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Layer | null>(null);
  const [deleting, setDeleting] = useState<Layer | null>(null);
  const { toast } = useToast();

  const fetchInfo = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<LayerInfo[]>('/geojson-admin/info');
      setLayers(res.data);
    } catch {
      toast.error('Gagal memuat info GeoJSON');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchInfo(); }, [fetchInfo]);

  async function handleUpload(layer: Layer, file: File) {
    setUploading(layer);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.put(`/geojson-admin/${layer}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(
        `${LAYER_META[layer].label} berhasil diperbarui — ${res.data.featureCount?.toLocaleString('id-ID') ?? '?'} features`
      );
      fetchInfo();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? `Gagal upload ${layer}`);
    } finally {
      setUploading(null);
    }
  }

  async function handleDelete(layer: Layer) {
    if (!confirm(`Hapus file GeoJSON layer "${LAYER_META[layer].label}"?\nLayer ini tidak akan tampil di peta sampai file baru diupload.`)) return;
    setDeleting(layer);
    try {
      await api.delete(`/geojson-admin/${layer}`);
      toast.success(`${LAYER_META[layer].label} berhasil dihapus`);
      fetchInfo();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? `Gagal hapus ${layer}`);
    } finally {
      setDeleting(null);
    }
  }

  const allLayers: Layer[] = ['kabupaten', 'kecamatan', 'nagari', 'korong'];
  const filledCount = layers.filter(l => l.size !== null).length;

  return (
    <AdminLayout title="Manajemen GeoJSON">
      <div className="max-w-5xl space-y-5">
        {/* Summary bar */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">
              {loading ? '...' : `${filledCount} dari 4 layer tersedia`}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchInfo}>
            <Icon name="layers" className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Info box */}
        <div className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-xs text-primary-700 space-y-1">
          <p className="font-medium">Cara kerja GeoJSON</p>
          <p>File disimpan di <code className="font-mono">server/data/geojson/</code> dan di-serve via API yang hanya bisa diakses dari domain frontend.</p>
          <p>Setelah upload, browser akan otomatis load versi terbaru saat next page refresh (cache 1 jam).</p>
        </div>

        {/* Layer cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {allLayers.map(l => (
              <div key={l} className="h-48 animate-pulse rounded-xl bg-neutral-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {allLayers.map(layer => {
              const info = layers.find(l => l.layer === layer) ?? {
                layer,
                size: null,
                updatedAt: null,
                featureCount: null,
              };
              return (
                <LayerCard
                  key={layer}
                  info={info}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  uploading={uploading === layer}
                  deleting={deleting === layer}
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
