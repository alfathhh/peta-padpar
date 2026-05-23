import React, { useRef, useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface FotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const OUTPUT_W = 1280;
const OUTPUT_H = 800;

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.crossOrigin = 'anonymous';
    i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
}

function toBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((res, rej) => {
    c.toBlob(b => b ? res(b) : rej(new Error('fail')), 'image/webp', 0.88);
  });
}

export function FotoUpload({ value, onChange }: FotoUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlVal, setUrlVal] = useState('');

  // Editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [src, setSrc] = useState('');
  const [name, setName] = useState('foto');
  const [zoom, setZoom] = useState(1);
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);
  const [rot, setRot] = useState(0);
  const [panning, setPanning] = useState(false);
  const [saving, setSaving] = useState(false);

  const preview = resolveAssetUrl(value);
  const hasPhoto = !!value;

  // ─── Helpers ───
  function openEditor(imgSrc: string, fileName = 'foto') {
    setSrc(imgSrc); setName(fileName);
    setZoom(1); setPx(0); setPy(0); setRot(0);
    setEditorOpen(true); setError('');
  }

  function closeEditor() {
    setEditorOpen(false); setSrc('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function pickFile(file: File) {
    setError('');
    if (!file.type.startsWith('image/')) { setError('File harus gambar (JPG/PNG/WebP)'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Maks 8 MB'); return; }
    const r = new FileReader();
    r.onload = () => openEditor(String(r.result), file.name.replace(/\.[^.]+$/, '') || 'foto');
    r.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]); }
  function onFiles(fl: FileList | null) { if (fl?.[0]) pickFile(fl[0]); }

  // ─── Editor interactions ───
  function pDown(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = { x: e.clientX, y: e.clientY, px, py };
    setPanning(true); e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    setPx(dragRef.current.px + (e.clientX - dragRef.current.x));
    setPy(dragRef.current.py + (e.clientY - dragRef.current.y));
  }
  function pUp(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = null; setPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.max(1, Math.min(3, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }

  // ─── Save ───
  async function save() {
    if (!src) return;
    setSaving(true); setError('');
    try {
      const img = await loadImg(src);
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_W; canvas.height = OUTPUT_H;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);

      const rect = canvasRef.current?.getBoundingClientRect();
      const sc = OUTPUT_W / (rect?.width || OUTPUT_W);
      const isRot = rot % 180 !== 0;
      const sw = isRot ? img.height : img.width;
      const sh = isRot ? img.width : img.height;
      const base = Math.max(OUTPUT_W / sw, OUTPUT_H / sh) * zoom;

      ctx.save();
      ctx.translate(OUTPUT_W / 2 + px * sc, OUTPUT_H / 2 + py * sc);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -(img.width * base) / 2, -(img.height * base) / 2, img.width * base, img.height * base);
      ctx.restore();

      const blob = await toBlob(canvas);
      const safe = name.toLowerCase().replace(/[^a-z0-9-_]+/g, '-') || 'foto';
      const fd = new FormData();
      fd.append('foto', new File([blob], `${safe}.webp`, { type: 'image/webp' }));
      const res = await api.post('/upload/foto', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(res.data.fotoUrl);
      closeEditor();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">Foto</label>

        {/* ── Has photo: show preview ── */}
        {hasPhoto && (
          <div className="group relative rounded-lg border border-neutral-200 overflow-hidden">
            <img src={preview} alt="Foto" className="w-full aspect-[16/9] object-cover bg-neutral-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="absolute bottom-0 inset-x-0 p-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button type="button" onClick={() => openEditor(preview)}
                className="h-8 px-3 rounded-md bg-white/90 backdrop-blur text-xs font-medium text-neutral-800 shadow-sm inline-flex items-center gap-1.5 hover:bg-white transition-colors">
                <Icon name="pencil" className="h-3 w-3" /> Edit
              </button>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="h-8 px-3 rounded-md bg-white/90 backdrop-blur text-xs font-medium text-neutral-800 shadow-sm inline-flex items-center gap-1.5 hover:bg-white transition-colors">
                <Icon name="image" className="h-3 w-3" /> Ganti
              </button>
              <button type="button" onClick={() => onChange('')}
                className="h-8 px-3 rounded-md bg-white/90 backdrop-blur text-xs font-medium text-danger-600 shadow-sm inline-flex items-center gap-1.5 hover:bg-white transition-colors">
                <Icon name="trash" className="h-3 w-3" /> Hapus
              </button>
            </div>
          </div>
        )}

        {/* ── No photo: drop zone ── */}
        {!hasPhoto && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'cursor-pointer rounded-lg border-2 border-dashed py-8 px-4 text-center transition-all duration-150',
              dragOver ? 'border-primary-400 bg-primary-50 scale-[1.01]' : 'border-neutral-300 bg-neutral-50 hover:border-primary-300 hover:bg-primary-50/30',
            )}
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
              <Icon name="image" className="h-5 w-5 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-700">Klik atau drag foto ke sini</p>
            <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP — maks 8 MB</p>
          </div>
        )}

        {/* Error */}
        {error && !editorOpen && (
          <p className="rounded-md bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">{error}</p>
        )}

        {/* URL manual */}
        {!showUrl ? (
          <button type="button" onClick={() => setShowUrl(true)} className="text-xs text-neutral-500 hover:text-primary-600 transition-colors">
            Atau masukkan URL foto →
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input type="url" value={urlVal} onChange={e => setUrlVal(e.target.value)} placeholder="https://example.com/foto.jpg"
              className="flex-1 h-9 rounded-lg border border-neutral-200 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
            <Button size="sm" onClick={() => { if (urlVal.trim()) { onChange(urlVal.trim()); setUrlVal(''); setShowUrl(false); } }} disabled={!urlVal.trim()}>OK</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowUrl(false); setUrlVal(''); }}>×</Button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => onFiles(e.target.files)} />
      </div>

      {/* ══════ EDITOR MODAL ══════ */}
      <Modal
        isOpen={editorOpen}
        onClose={closeEditor}
        title="Edit Foto"
        description="Atur posisi dan zoom foto sebelum disimpan. Output: 16:10 WebP."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeEditor}>Batal</Button>
            <Button onClick={save} isLoading={saving}>Simpan Foto</Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Canvas area */}
          <div className="rounded-lg overflow-hidden border border-neutral-200 bg-neutral-900">
            <div
              ref={canvasRef}
              className={cn('relative aspect-[16/10] overflow-hidden touch-none select-none', panning ? 'cursor-grabbing' : 'cursor-grab')}
              onPointerDown={pDown}
              onPointerMove={pMove}
              onPointerUp={pUp}
              onPointerCancel={pUp}
              onWheel={onWheel}
            >
              {src && (
                <img
                  src={src} alt="Edit" draggable={false}
                  className={cn('absolute inset-0 w-full h-full object-cover will-change-transform', panning ? '' : 'transition-transform duration-150 ease-out')}
                  style={{ transform: `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${zoom})`, transformOrigin: 'center' }}
                />
              )}
              {/* Rule of thirds */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 300 187.5">
                <line x1="100" y1="0" x2="100" y2="187.5" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
                <line x1="200" y1="0" x2="200" y2="187.5" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
                <line x1="0" y1="62.5" x2="300" y2="62.5" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
                <line x1="0" y1="125" x2="300" y2="125" stroke="white" strokeOpacity="0.15" strokeWidth="0.5" />
              </svg>
              {/* Corner marks */}
              <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-white/40 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-white/40 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-white/40 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-white/40 rounded-br-sm" />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: zoom + rotate */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - 0.2).toFixed(1)))}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-xs transition-all" title="Zoom out">
                  <Icon name="minus" className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center text-xs font-mono text-neutral-600">{zoom.toFixed(1)}×</span>
                <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + 0.2).toFixed(1)))}
                  className="h-7 w-7 rounded-md flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-xs transition-all" title="Zoom in">
                  <Icon name="plus" className="h-3.5 w-3.5" />
                </button>
              </div>

              <button type="button" onClick={() => setRot(r => (r + 90) % 360)}
                className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 inline-flex items-center gap-1.5 transition-colors">
                <Icon name="rotate-clockwise" className="h-3.5 w-3.5" /> Rotasi
              </button>
            </div>

            {/* Right: reset + change photo */}
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setZoom(1); setPx(0); setPy(0); setRot(0); }}
                className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                Reset
              </button>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-700 hover:bg-neutral-50 inline-flex items-center gap-1.5 transition-colors">
                <Icon name="image" className="h-3.5 w-3.5" /> Ganti foto
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="text-xs text-neutral-400 text-center">Drag untuk geser • Scroll untuk zoom • Double-klik untuk reset</p>

          {/* Error inside editor */}
          {error && (
            <p className="rounded-md bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">{error}</p>
          )}
        </div>
      </Modal>
    </>
  );
}
