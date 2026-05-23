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
    if (!file.type.startsWith('image/')) { setError('Format tidak didukung. Gunakan JPG, PNG, atau WebP.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('File terlalu besar (maks 8 MB).'); return; }
    const r = new FileReader();
    r.onload = () => openEditor(String(r.result), file.name.replace(/\.[^.]+$/, '') || 'foto');
    r.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]); }
  function onFiles(fl: FileList | null) { if (fl?.[0]) pickFile(fl[0]); }

  // Pointer events for pan
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
    setZoom(z => Math.max(1, Math.min(3, +(z + (e.deltaY > 0 ? -0.1 : 0.1)).toFixed(2))));
  }

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
      setError(err?.response?.data?.error ?? err?.message ?? 'Gagal menyimpan foto.');
    } finally { setSaving(false); }
  }

  return (
    <>
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">Foto</label>

        {/* ── Preview: existing photo ── */}
        {hasPhoto && (
          <div className="group relative rounded-xl overflow-hidden border border-neutral-200 shadow-xs">
            <img src={preview} alt="Foto" className="w-full aspect-[16/9] object-cover bg-neutral-100" />
            {/* Gradient + actions on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
              <span className="text-[11px] font-medium text-white/70 tracking-wide uppercase">16:10 • WebP</span>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => openEditor(preview)}
                  className="h-8 px-3.5 rounded-lg bg-white text-xs font-semibold text-neutral-800 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center gap-1.5">
                  <Icon name="pencil" className="h-3 w-3" /> Edit
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="h-8 px-3.5 rounded-lg bg-white/90 text-xs font-semibold text-neutral-700 shadow-lg hover:bg-white transition-all inline-flex items-center gap-1.5">
                  <Icon name="image" className="h-3 w-3" /> Ganti
                </button>
                <button type="button" onClick={() => onChange('')}
                  className="h-8 w-8 rounded-lg bg-white/90 text-danger-500 shadow-lg hover:bg-white flex items-center justify-center transition-all">
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ── Drop zone: no photo ── */}
        {!hasPhoto && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'group cursor-pointer rounded-xl border-2 border-dashed py-10 px-6 text-center transition-all duration-200',
              dragOver
                ? 'border-primary-500 bg-primary-50 scale-[1.01] shadow-md'
                : 'border-neutral-300 bg-neutral-50/50 hover:border-primary-400 hover:bg-primary-50/30 hover:shadow-sm',
            )}
          >
            <div className={cn(
              'mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200',
              dragOver ? 'bg-primary-100 text-primary-600 scale-110' : 'bg-neutral-100 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-500',
            )}>
              <Icon name="image" className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800">
              {dragOver ? 'Lepaskan foto di sini' : 'Pilih atau jatuhkan foto'}
            </p>
            <p className="text-xs text-neutral-500 mt-1.5">
              JPG, PNG, WebP • Maks 8 MB • Akan di-crop ke rasio 16:10
            </p>
          </div>
        )}

        {/* Error */}
        {error && !editorOpen && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-100 px-3 py-2.5">
            <Icon name="x" className="h-3.5 w-3.5 text-danger-500 mt-0.5 shrink-0" />
            <p className="text-xs text-danger-700">{error}</p>
          </div>
        )}

        {/* URL manual */}
        {!showUrl ? (
          <button type="button" onClick={() => setShowUrl(true)}
            className="text-xs text-neutral-400 hover:text-primary-600 transition-colors duration-150">
            Atau masukkan URL foto →
          </button>
        ) : (
          <div className="flex gap-2 items-center animate-fade-in">
            <input type="url" value={urlVal} onChange={e => setUrlVal(e.target.value)} placeholder="https://..."
              className="flex-1 h-9 rounded-lg border border-neutral-200 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all" />
            <Button size="sm" onClick={() => { if (urlVal.trim()) { onChange(urlVal.trim()); setUrlVal(''); setShowUrl(false); } }} disabled={!urlVal.trim()}>
              Simpan
            </Button>
            <button type="button" onClick={() => { setShowUrl(false); setUrlVal(''); }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => onFiles(e.target.files)} />
      </div>

      {/* ══════════════════ EDITOR MODAL ══════════════════ */}
      <Modal
        isOpen={editorOpen}
        onClose={closeEditor}
        title="Atur Foto"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={closeEditor}>Batal</Button>
            <Button onClick={save} isLoading={saving}>
              Simpan Foto
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Canvas */}
          <div className="rounded-xl overflow-hidden bg-neutral-950 shadow-lg ring-1 ring-white/5">
            <div
              ref={canvasRef}
              className={cn(
                'relative aspect-[16/10] overflow-hidden touch-none select-none',
                panning ? 'cursor-grabbing' : 'cursor-grab',
              )}
              onPointerDown={pDown}
              onPointerMove={pMove}
              onPointerUp={pUp}
              onPointerCancel={pUp}
              onWheel={onWheel}
              onDoubleClick={() => { setZoom(1); setPx(0); setPy(0); setRot(0); }}
            >
              {src && (
                <img
                  src={src} alt="Edit" draggable={false}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover will-change-transform',
                    panning ? '' : 'transition-transform duration-200 ease-out',
                  )}
                  style={{
                    transform: `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${zoom})`,
                    transformOrigin: 'center',
                  }}
                />
              )}

              {/* Rule of thirds — SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 480 300">
                <line x1="160" y1="0" x2="160" y2="300" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="320" y1="0" x2="320" y2="300" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="480" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                <line x1="0" y1="200" x2="480" y2="200" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              </svg>

              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-l-[1.5px] border-t-[1.5px] border-white/50 rounded-tl" />
              <div className="absolute top-3 right-3 w-5 h-5 border-r-[1.5px] border-t-[1.5px] border-white/50 rounded-tr" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-l-[1.5px] border-b-[1.5px] border-white/50 rounded-bl" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-r-[1.5px] border-b-[1.5px] border-white/50 rounded-br" />

              {/* Center crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                <div className="w-6 h-px bg-white" />
                <div className="w-px h-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Zoom control — pill */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center bg-neutral-100 rounded-full p-0.5">
                <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - 0.2).toFixed(1)))}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-sm transition-all" title="Perkecil">
                  <Icon name="minus" className="h-3.5 w-3.5" />
                </button>
                <span className="w-14 text-center text-xs font-semibold text-neutral-700 tabular-nums">{zoom.toFixed(1)}×</span>
                <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + 0.2).toFixed(1)))}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white hover:shadow-sm transition-all" title="Perbesar">
                  <Icon name="plus" className="h-3.5 w-3.5" />
                </button>
              </div>

              <button type="button" onClick={() => setRot(r => (r + 90) % 360)}
                className="h-9 px-3.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 inline-flex items-center gap-1.5 transition-all active:scale-95">
                <Icon name="rotate-clockwise" className="h-3.5 w-3.5" /> Putar
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { setZoom(1); setPx(0); setPy(0); setRot(0); }}
                className="h-9 px-3.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-all active:scale-95">
                Reset
              </button>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="h-9 px-3.5 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-700 hover:bg-neutral-50 inline-flex items-center gap-1.5 transition-all active:scale-95">
                <Icon name="image" className="h-3.5 w-3.5" /> Ganti foto
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-neutral-400 text-center tracking-wide">
            DRAG untuk geser &nbsp;•&nbsp; SCROLL untuk zoom &nbsp;•&nbsp; DOUBLE-KLIK untuk reset
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-100 px-3 py-2.5">
              <Icon name="x" className="h-3.5 w-3.5 text-danger-500 mt-0.5 shrink-0" />
              <p className="text-xs text-danger-700">{error}</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
