import React, { useRef, useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

interface FotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function FotoUpload({ value, onChange }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const previewUrl = resolveAssetUrl(value);
  const hasPhoto = !!value;

  async function handleFile(file: File) {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5MB');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await api.post('/upload/foto', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.fotoUrl);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Gagal mengupload foto');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function handleFiles(files: FileList | null) {
    if (files && files.length > 0) handleFile(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function handleRemove() {
    onChange('');
    setError('');
  }

  function handleUrlSave() {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setManualUrl('');
    setShowUrl(false);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">Foto</label>

      {/* Preview jika sudah ada foto */}
      {hasPhoto && !uploading && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <div className="relative aspect-[16/9] bg-neutral-100">
            <img
              src={previewUrl}
              alt="Foto infrastruktur"
              className="h-full w-full object-cover"
            />
            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 hover:bg-black/40 hover:opacity-100 transition-all">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-neutral-700 shadow-md"
              >
                <Icon name="image" className="h-3.5 w-3.5" />
                Ganti
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-medium text-danger-600 shadow-md"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload area */}
      {!hasPhoto && !uploading && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            dragOver
              ? 'border-primary-400 bg-primary-50'
              : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100/50',
          )}
        >
          <Icon name="image" className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700">
            Drag & drop foto di sini
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            atau klik untuk pilih file (JPG, PNG, WebP, maks 5MB)
          </p>
        </div>
      )}

      {/* Uploading state */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <span className="text-sm text-neutral-600">Mengupload...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">
          {error}
        </p>
      )}

      {/* URL manual toggle */}
      {!showUrl ? (
        <button
          type="button"
          onClick={() => setShowUrl(true)}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          Atau isi URL manual
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <Button size="sm" onClick={handleUrlSave} disabled={!manualUrl.trim()}>
            Simpan
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowUrl(false); setManualUrl(''); }}>
            Batal
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
