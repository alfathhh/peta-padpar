import React, { useRef, useState, useCallback, useEffect } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

export interface CropMeta {
  fotoCropX: number; // 0-100, focal point X %
  fotoCropY: number; // 0-100, focal point Y %
  fotoCropZoom: number; // >=1, scale factor
}

interface FotoUploadProps {
  value: string;
  onChange: (url: string) => void;
  cropMeta: CropMeta;
  onCropChange: (meta: CropMeta) => void;
}

const ASPECT = 16 / 10;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export function FotoUpload({ value, onChange, cropMeta, onCropChange }: FotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlVal, setUrlVal] = useState('');
  const [uploading, setUploading] = useState(false);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [editorPreview, setEditorPreview] = useState('');

  // Local crop state while editing
  const [localCrop, setLocalCrop] = useState<CropMeta>(cropMeta);

  const preview = resolveAssetUrl(value);
  const hasPhoto = !!value;

  // Sync local crop when opening editor for existing photo
  useEffect(() => {
    setLocalCrop(cropMeta);
  }, [cropMeta]);

  function openEditor(file: File) {
    const url = URL.createObjectURL(file);
    setEditorFile(file);
    setEditorPreview(url);
    setEditorOpen(true);
    setLocalCrop(cropMeta);
    setError('');
  }

  function openCropOnly() {
    // Re-open editor for existing photo (just crop adjustment)
    setEditorFile(null);
    setEditorPreview(preview);
    setEditorOpen(true);
    setLocalCrop(cropMeta);
    setError('');
  }

  function closeEditor() {
    if (editorPreview && editorFile) URL.revokeObjectURL(editorPreview);
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

  // Save: upload if new file, then commit crop metadata
  async function save() {
    setUploading(true); setError('');
    try {
      if (editorFile) {
        const fd = new FormData();
        fd.append('foto', editorFile);
        const res = await api.post('/upload/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        onChange(res.data.fotoUrl);
      }
      onCropChange(localCrop);
      closeEditor();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Gagal upload');
    } finally { setUploading(false); }
  }

  // Save crop-only (no upload)
  function saveCropOnly() {
    onCropChange(localCrop);
    closeEditor();
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-neutral-700">Foto</label>

      {/* Preview existing photo */}
      {hasPhoto && !editorOpen && (
        <div className="group relative rounded-xl overflow-hidden border border-neutral-200 w-full max-w-sm">
          <div className="w-full aspect-[16/10] overflow-hidden bg-neutral-100">
            <img
              src={preview}
              alt="Foto"
              className="w-full h-full"
              style={{
                objectFit: 'cover',
                objectPosition: `${cropMeta.fotoCropX}% ${cropMeta.fotoCropY}%`,
                transform: `scale(${cropMeta.fotoCropZoom})`,
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={openCropOnly}
              className="h-8 px-3 rounded-lg bg-white text-[11px] font-medium text-neutral-800 shadow inline-flex items-center gap-1.5 active:scale-95 transition-transform">
              <Icon name="image" className="h-3 w-3" /> Crop
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="h-8 px-3 rounded-lg bg-white text-[11px] font-medium text-neutral-800 shadow inline-flex items-center gap-1.5 active:scale-95 transition-transform">
              <Icon name="image" className="h-3 w-3" /> Ganti
            </button>
            <button type="button" onClick={() => { onChange(''); onCropChange({ fotoCropX: 50, fotoCropY: 50, fotoCropZoom: 1 }); }}
              className="h-8 w-8 rounded-lg bg-white text-danger-500 shadow flex items-center justify-center active:scale-95 transition-transform">
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Drop zone */}
      {!hasPhoto && !editorOpen && (
        <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={onDrop} onClick={() => fileRef.current?.click()}
          className={cn('w-full max-w-sm cursor-pointer rounded-xl border-2 border-dashed py-10 px-6 text-center transition-all', dragOver ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400')}>
          <Icon name="image" className="h-6 w-6 text-neutral-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-neutral-700">Klik atau drop foto</p>
          <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP • Maks 5 MB</p>
        </div>
      )}

      {/* CROP EDITOR: interactive drag + zoom */}
      {editorOpen && (
        <div className="w-full max-w-sm space-y-3">
          <CropEditor
            src={editorPreview}
            crop={localCrop}
            onCropChange={setLocalCrop}
          />

          {/* Zoom slider */}
          <div className="flex items-center gap-3 px-1">
            <Icon name="minus" className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={localCrop.fotoCropZoom}
              onChange={e => setLocalCrop(prev => ({ ...prev, fotoCropZoom: parseFloat(e.target.value) }))}
              className="flex-1 h-1.5 accent-primary-500"
            />
            <Icon name="plus" className="h-3.5 w-3.5 text-neutral-400" />
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
              <Button size="sm" onClick={editorFile ? save : saveCropOnly} isLoading={uploading}>
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

// ─── CropEditor: draggable image inside 16:10 viewport ───────────────────────
//
// Strategi: gambar diposisikan dengan translate(tx, ty) + scale(zoom).
// tx/ty dalam satuan pixel relatif terhadap container.
// Saat drag, kita langsung tambah dx/dy ke tx/ty → 1:1 smooth.
// Saat simpan, kita konversi (tx, ty, zoom) → (fotoCropX%, fotoCropY%).
//
// Konversi tx/ty → %:
//   Gambar setelah scale punya ukuran (W*zoom x H*zoom).
//   Overflow = (W*zoom - W) / 2 = W*(zoom-1)/2  (per sisi)
//   Range geser = W*(zoom-1)  (full range kiri ke kanan)
//   fotoCropX% = 50 - (tx / (W*(zoom-1)/2)) * 50   jika zoom>1, else 50

function cropFromTransform(tx: number, ty: number, zoom: number, W: number, H: number): { fotoCropX: number; fotoCropY: number } {
  if (zoom <= 1) return { fotoCropX: 50, fotoCropY: 50 };
  const maxTx = (W * (zoom - 1)) / 2;
  const maxTy = (H * (zoom - 1)) / 2;
  const fotoCropX = Math.round((50 - (tx / maxTx) * 50) * 10) / 10;
  const fotoCropY = Math.round((50 - (ty / maxTy) * 50) * 10) / 10;
  return {
    fotoCropX: Math.max(0, Math.min(100, fotoCropX)),
    fotoCropY: Math.max(0, Math.min(100, fotoCropY)),
  };
}

function transformFromCrop(fotoCropX: number, fotoCropY: number, zoom: number, W: number, H: number): { tx: number; ty: number } {
  if (zoom <= 1) return { tx: 0, ty: 0 };
  const maxTx = (W * (zoom - 1)) / 2;
  const maxTy = (H * (zoom - 1)) / 2;
  return {
    tx: ((50 - fotoCropX) / 50) * maxTx,
    ty: ((50 - fotoCropY) / 50) * maxTy,
  };
}

function CropEditor({
  src,
  crop,
  onCropChange,
}: {
  src: string;
  crop: CropMeta;
  onCropChange: (c: CropMeta) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal translate state in pixels — derived from crop on mount/zoom change
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const dragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, tx: 0, ty: 0 });

  // Helper: clamp translate so image never shows gap at edges
  const clamp = useCallback((nextTx: number, nextTy: number, zoom: number): { tx: number; ty: number } => {
    if (!containerRef.current) return { tx: nextTx, ty: nextTy };
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const maxTx = (W * (zoom - 1)) / 2;
    const maxTy = (H * (zoom - 1)) / 2;
    return {
      tx: Math.max(-maxTx, Math.min(maxTx, nextTx)),
      ty: Math.max(-maxTy, Math.min(maxTy, nextTy)),
    };
  }, []);

  // Sync translate when crop prop or zoom changes from outside (e.g. slider or initial open).
  // Use ResizeObserver to ensure clientWidth is ready after first paint.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function sync() {
      if (!el) return;
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (W === 0) return;
      const { tx: newTx, ty: newTy } = transformFromCrop(crop.fotoCropX, crop.fotoCropY, crop.fotoCropZoom, W, H);
      setTx(newTx);
      setTy(newTy);
    }

    // Run once dimensions are known
    sync();
    if (el.clientWidth === 0) {
      const ro = new ResizeObserver(() => { sync(); ro.disconnect(); });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [crop.fotoCropX, crop.fotoCropY, crop.fotoCropZoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    dragStart.current = { px: e.clientX, py: e.clientY, tx, ty };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [tx, ty]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    const nextTx = dragStart.current.tx + dx;
    const nextTy = dragStart.current.ty + dy;
    // Update visual immediately (no state batching delay)
    const clamped = clamp(nextTx, nextTy, crop.fotoCropZoom);
    setTx(clamped.tx);
    setTy(clamped.ty);
  }, [clamp, crop.fotoCropZoom]);

  const handlePointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    // Commit to parent only on release
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    onCropChange({ ...crop, ...cropFromTransform(tx, ty, crop.fotoCropZoom, W, H) });
  }, [crop, onCropChange, tx, ty]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round((crop.fotoCropZoom + delta) * 100) / 100));
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const clamped = clamp(tx, ty, newZoom);
    setTx(clamped.tx);
    setTy(clamped.ty);
    onCropChange({ ...crop, fotoCropZoom: newZoom, ...cropFromTransform(clamped.tx, clamped.ty, newZoom, W, H) });
  }, [clamp, crop, onCropChange, tx, ty]);

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ aspectRatio: `${ASPECT}` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <img
        src={src}
        alt="Crop preview"
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          objectFit: 'cover',
          transform: `translate(${tx}px, ${ty}px) scale(${crop.fotoCropZoom})`,
          // will-change untuk GPU compositing → smooth tanpa repaint
          willChange: 'transform',
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />

        {/* Crosshair tetap di tengah viewport */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-5 h-5">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60 -translate-x-1/2" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/60 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/50 text-[10px] text-white/70 pointer-events-none whitespace-nowrap">
        Drag untuk geser • Scroll untuk zoom
      </div>
    </div>
  );
}
