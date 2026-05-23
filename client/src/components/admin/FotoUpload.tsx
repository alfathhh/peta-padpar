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
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlVal, setUrlVal] = useState('');

  const preview = resolveAssetUrl(value);
  const hasPhoto = !!value;

  async function upload(file: File) {
    setError('');
    if (!file.type.startsWith('image/')) { setError('Format tidak didukung'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Maks 5 MB'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('foto', file);
      const res = await api.post('/upload/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.fotoUrl);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Gagal upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) upload(e.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">Foto</label>

      {/* Preview — square 1:1 */}
      {hasPhoto && !uploading && (
        <div className="group relative w-40 h-40 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
          <img src={preview} alt="Foto" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="h-7 px-2.5 rounded-md bg-white text-[11px] font-medium text-neutral-800 shadow inline-flex items-center gap-1">
              <Icon name="image" className="h-3 w-3" /> Ganti
            </button>
            <button type="button" onClick={() => onChange('')}
              className="h-7 w-7 rounded-md bg-white text-danger-500 shadow flex items-center justify-center">
              <Icon name="trash" className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Upload / drop zone */}
      {!hasPhoto && !uploading && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'w-40 h-40 cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all',
            dragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400',
          )}
        >
          <Icon name="image" className="h-5 w-5 text-neutral-400" />
          <span className="text-[11px] text-neutral-500 text-center px-2">Klik atau drop foto</span>
        </div>
      )}

      {/* Loading */}
      {uploading && (
        <div className="w-40 h-40 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-danger-600">{error}</p>}

      {/* URL manual */}
      {!showUrl ? (
        <button type="button" onClick={() => setShowUrl(true)} className="text-[11px] text-neutral-400 hover:text-primary-600">
          Atau isi URL →
        </button>
      ) : (
        <div className="flex gap-1.5 items-center">
          <input type="url" value={urlVal} onChange={e => setUrlVal(e.target.value)} placeholder="https://..."
            className="flex-1 h-8 rounded-lg border border-neutral-200 px-2.5 text-xs placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20" />
          <Button size="sm" onClick={() => { if (urlVal.trim()) { onChange(urlVal.trim()); setUrlVal(''); setShowUrl(false); } }} disabled={!urlVal.trim()}>OK</Button>
          <button type="button" onClick={() => { setShowUrl(false); setUrlVal(''); }} className="text-neutral-400 hover:text-neutral-600">
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]); }} />
    </div>
  );
}
