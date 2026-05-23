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
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlVal, setUrlVal] = useState('');
  const [uploading, setUploading] = useState(false);

  // Editor state — hanya visual preview, tidak crop
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [editorPreview, setEditorPreview] = useState('');

  const preview = resolveAssetUrl(value);
  const hasPhoto = !!value;

  function openEditor(file: File) {
    const url = URL.createObjectURL(file);
    setEditorFile(file);
    setEditorPreview(url);
    setEditorOpen(true);
    setError('');
  }

  function closeEditor() {
    if (editorPreview) URL.revokeObjectURL(editorPreview);
    setEditorOpen(false);
    setEditorFile(null);
    setEditorPreview('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function pickFile(file: File) {
    setError('');
    if (!file.type.startsWith('image/')) { setError('Format tidak didukung'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Maks 5 MB'); return; }
    openEditor(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  }

  // Upload file asli — tanpa crop/resize
  async function save() {
    if (!editorFile) return;
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('foto', editorFile);
      const res = await api.post('/upload/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.fotoUrl);
      closeEditor();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Gagal upload');
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">Foto</label>

      {/* ── Preview existing photo ── */}
      {hasPhoto && !editorOpen && (
        <div className="group relative rounded-xl overflow-hidden border border-neutral-200 w-full max-w-sm">
          <img src={preview} alt="Foto" className="w-full aspect-[16/10] object-cover bg-neutral-100" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="h-8 px-3 rounded-lg bg-white text-[11px] font-medium text-neutral-800 shadow inline-flex items-center gap-1.5 active:scale-95 transition-transform">
              <Icon name="image" className="h-3 w-3" /> Ganti
            </button>
            <button type="button" onClick={() => onChange('')}
              className="h-8 w-8 rounded-lg bg-white text-danger-500 shadow flex items-center justify-center active:scale-95 transition-transform">
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Drop zone ── */}
      {!hasPhoto && !editorOpen && (
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileRef.current?.click()}
          className={cn('w-full max-w-sm cursor-pointer rounded-xl border-2 border-dashed py-10 px-6 text-center transition-all', dragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400')}>
          <Icon name="image" className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700">Klik atau drop foto</p>
          <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP • Maks 5 MB</p>
        </div>
      )}

      {/* ── EDITOR: preview with 16:10 guide overlay ── */}
      {editorOpen && (
        <div className="w-full max-w-sm space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
            {/* Foto — aspect ratio asli */}
            <img src={editorPreview} alt="Preview" className="w-full object-contain" />

            {/* Overlay kotak 16:10 + grid */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Dim area luar kotak */}
              <div className="absolute inset-0 bg-black/30" />

              {/* Kotak 16:10 transparan (hole) */}
              <div className="relative w-[85%] aspect-[16/10] bg-transparent border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]">
                {/* Grid 3x3 */}
                <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />

                {/* Corner ticks */}
                <div className="absolute -top-px -left-px w-4 h-px bg-white" />
                <div className="absolute -top-px -left-px h-4 w-px bg-white" />
                <div className="absolute -top-px -right-px w-4 h-px bg-white" />
                <div className="absolute -top-px -right-px h-4 w-px bg-white" />
                <div className="absolute -bottom-px -left-px w-4 h-px bg-white" />
                <div className="absolute -bottom-px -left-px h-4 w-px bg-white" />
                <div className="absolute -bottom-px -right-px w-4 h-px bg-white" />
                <div className="absolute -bottom-px -right-px h-4 w-px bg-white" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={closeEditor} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
              Batal
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
                Ganti
              </button>
              <Button size="sm" onClick={save} isLoading={uploading}>
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-danger-600">{error}</p>}

      {/* URL manual */}
      {!editorOpen && (!showUrl ? (
        <button type="button" onClick={() => setShowUrl(true)} className="text-[11px] text-neutral-400 hover:text-primary-600">Atau isi URL →</button>
      ) : (
        <div className="flex gap-2 items-center max-w-sm">
          <input type="url" value={urlVal} onChange={e => setUrlVal(e.target.value)} placeholder="https://..."
            className="flex-1 h-8 rounded-lg border border-neutral-200 px-2.5 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/20" />
          <Button size="sm" onClick={() => { if (urlVal.trim()) { onChange(urlVal.trim()); setUrlVal(''); setShowUrl(false); } }} disabled={!urlVal.trim()}>OK</Button>
          <button type="button" onClick={() => { setShowUrl(false); setUrlVal(''); }} className="text-neutral-400"><Icon name="x" className="h-3.5 w-3.5" /></button>
        </div>
      ))}

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { if (e.target.files?.[0]) pickFile(e.target.files[0]); }} />
    </div>
  );
}
