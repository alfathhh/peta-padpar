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

const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = 800;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function blobFromCanvas(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => { if (blob) resolve(blob); else reject(new Error('Gagal')); }, 'image/webp', 0.88);
  });
}

export function FotoUpload({ value, onChange }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Editor state
  const [editorSrc, setEditorSrc] = useState('');
  const [fileName, setFileName] = useState('foto');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);

  const previewUrl = resolveAssetUrl(value);
  const hasPhoto = !!value;
  const editorOpen = !!editorSrc;

  function resetEditor() {
    setEditorSrc('');
    setZoom(1); setPanX(0); setPanY(0); setRotation(0);
    if (inputRef.current) inputRef.current.value = '';
  }

  function prepareFile(file: File) {
    setError('');
    if (!file.type.startsWith('image/')) { setError('File harus berupa gambar'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Maksimal 8MB'); return; }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name.replace(/\.[^.]+$/, '') || 'foto');
      setEditorSrc(String(reader.result));
      setZoom(1); setPanX(0); setPanY(0); setRotation(0);
    };
    reader.readAsDataURL(file);
  }

  function handleFiles(files: FileList | null) {
    if (files && files[0]) prepareFile(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  // Editor pointer interactions
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX, panY };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current) return;
    setPanX(dragStartRef.current.panX + (e.clientX - dragStartRef.current.x));
    setPanY(dragStartRef.current.panY + (e.clientY - dragStartRef.current.y));
  }
  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    dragStartRef.current = null; setDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.max(1, Math.min(3, z + (e.deltaY > 0 ? -0.08 : 0.08))));
  }

  async function applyAndUpload() {
    if (!editorSrc) return;
    setUploading(true); setError('');

    try {
      const image = await loadImage(editorSrc);
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_WIDTH; canvas.height = OUTPUT_HEIGHT;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#f4f4f5'; ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);

      const cropRect = cropRef.current?.getBoundingClientRect();
      const scale = OUTPUT_WIDTH / (cropRect?.width || OUTPUT_WIDTH);
      const rotated = rotation % 180 !== 0;
      const sw = rotated ? image.height : image.width;
      const sh = rotated ? image.width : image.height;
      const baseScale = Math.max(OUTPUT_WIDTH / sw, OUTPUT_HEIGHT / sh) * zoom;

      ctx.save();
      ctx.translate(OUTPUT_WIDTH / 2 + panX * scale, OUTPUT_HEIGHT / 2 + panY * scale);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, -(image.width * baseScale) / 2, -(image.height * baseScale) / 2, image.width * baseScale, image.height * baseScale);
      ctx.restore();

      const blob = await blobFromCanvas(canvas);
      const safeName = fileName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-') || 'foto';
      const file = new File([blob], `${safeName}.webp`, { type: 'image/webp' });
      const fd = new FormData(); fd.append('foto', file);
      const res = await api.post('/upload/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.fotoUrl);
      resetEditor();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Gagal upload');
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-700">Foto</label>

      {/* ─── PREVIEW ─── */}
      {hasPhoto && !editorOpen && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden">
          <div className="relative aspect-[16/9] bg-neutral-100">
            <img src={previewUrl} alt="Foto" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 hover:bg-black/40 hover:opacity-100 transition-all duration-200">
              <button type="button" onClick={() => { setEditorSrc(previewUrl); setFileName('foto'); setZoom(1); setPanX(0); setPanY(0); setRotation(0); }}
                className="h-8 px-3 rounded-lg bg-white text-xs font-medium text-neutral-700 shadow-md inline-flex items-center gap-1.5">
                <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
              </button>
              <button type="button" onClick={() => inputRef.current?.click()}
                className="h-8 px-3 rounded-lg bg-white text-xs font-medium text-neutral-700 shadow-md inline-flex items-center gap-1.5">
                <Icon name="image" className="h-3.5 w-3.5" /> Ganti
              </button>
              <button type="button" onClick={() => onChange('')}
                className="h-8 px-3 rounded-lg bg-white text-xs font-medium text-danger-600 shadow-md inline-flex items-center gap-1.5">
                <Icon name="trash" className="h-3.5 w-3.5" /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DROP ZONE ─── */}
      {!hasPhoto && !editorOpen && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            dragOver ? 'border-primary-400 bg-primary-50' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300',
          )}
        >
          <Icon name="image" className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700">Drag & drop foto</p>
          <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP — maks 8MB — akan di-crop 16:10</p>
        </div>
      )}

      {/* ─── INLINE EDITOR ─── */}
      {editorOpen && (
        <div className="rounded-lg border border-neutral-200 overflow-hidden bg-neutral-900">
          {/* Crop canvas */}
          <div
            ref={cropRef}
            className={cn('relative aspect-[16/10] overflow-hidden touch-none', dragging ? 'cursor-grabbing' : 'cursor-grab')}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            <img
              src={editorSrc}
              alt="Edit"
              draggable={false}
              className={cn(
                'h-full w-full select-none object-cover will-change-transform',
                dragging ? 'transition-none' : 'transition-transform duration-100',
              )}
              style={{
                transform: `translate(${panX}px, ${panY}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center',
              }}
            />
            {/* Grid overlay */}
            <div className="pointer-events-none absolute inset-0 border border-white/20" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:33.333%_33.333%]" />
            {/* Hint */}
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur">
              Drag untuk geser · Scroll untuk zoom
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 bg-neutral-800 px-3 py-2">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setZoom(z => Math.max(1, z - 0.15))}
                className="h-7 w-7 rounded flex items-center justify-center text-white/70 hover:bg-white/10" title="Zoom out">
                <Icon name="minus" className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] text-white/60 w-10 text-center font-mono">{zoom.toFixed(1)}x</span>
              <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.15))}
                className="h-7 w-7 rounded flex items-center justify-center text-white/70 hover:bg-white/10" title="Zoom in">
                <Icon name="plus" className="h-3.5 w-3.5" />
              </button>

              <div className="w-px h-4 bg-white/15 mx-1.5" />

              <button type="button" onClick={() => setRotation(r => (r + 90) % 360)}
                className="h-7 px-2 rounded text-[11px] font-medium text-white/70 hover:bg-white/10 flex items-center gap-1" title="Rotasi 90°">
                <Icon name="rotate-clockwise" className="h-3.5 w-3.5" /> Rotasi
              </button>

              <button type="button" onClick={() => { setZoom(1); setPanX(0); setPanY(0); setRotation(0); }}
                className="h-7 px-2 rounded text-[11px] font-medium text-white/70 hover:bg-white/10" title="Reset posisi">
                Reset
              </button>

              <div className="w-px h-4 bg-white/15 mx-1.5" />

              <button type="button" onClick={() => inputRef.current?.click()}
                className="h-7 px-2 rounded text-[11px] font-medium text-white/70 hover:bg-white/10 flex items-center gap-1" title="Pilih foto lain">
                <Icon name="image" className="h-3.5 w-3.5" /> Ganti
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" onClick={resetEditor}
                className="h-7 px-3 rounded text-xs font-medium text-white/70 hover:bg-white/10">
                Batal
              </button>
              <button type="button" onClick={applyAndUpload} disabled={uploading}
                className="h-7 px-3 rounded bg-white text-xs font-medium text-neutral-900 hover:bg-neutral-100 disabled:opacity-50">
                {uploading ? 'Memproses...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">{error}</p>
      )}

      {/* URL manual */}
      {!editorOpen && (
        <>
          {!showUrl ? (
            <button type="button" onClick={() => setShowUrl(true)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Atau isi URL manual
            </button>
          ) : (
            <div className="flex gap-2">
              <input type="url" value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="https://..."
                className="flex-1 h-9 rounded-lg border border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              <Button size="sm" onClick={() => { if (manualUrl.trim()) { onChange(manualUrl.trim()); setManualUrl(''); setShowUrl(false); } }} disabled={!manualUrl.trim()}>Simpan</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowUrl(false); setManualUrl(''); }}>Batal</Button>
            </div>
          )}
        </>
      )}

      {/* Hidden input */}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
        onChange={e => handleFiles(e.target.files)} />
    </div>
  );
}
