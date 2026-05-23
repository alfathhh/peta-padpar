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
    if (!file.type.startsWith('image/')) { setError('Format tidak didukung'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Maks 8 MB'); return; }
    const r = new FileReader();
    r.onload = () => openEditor(String(r.result), file.name.replace(/\.[^.]+$/, '') || 'foto');
    r.readAsDataURL(file);
  }

  function onDrop(e: React.DragEvent) { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]); }
  function onFiles(fl: FileList | null) { if (fl?.[0]) pickFile(fl[0]); }

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
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H);

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
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">Foto</label>

        {/* ═══ PREVIEW ═══ */}
        {hasPhoto && !editorOpen && (
          <div className="group relative rounded-xl overflow-hidden border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow duration-300">
            <img src={preview} alt="Foto" className="w-full aspect-[16/9] object-cover bg-neutral-100" />
            {/* Cinematic gradient reveal */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            {/* Floating action bar — slides up */}
            <div className="absolute bottom-0 inset-x-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/50 uppercase tracking-[0.15em]">16 : 10 &bull; WebP</span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => openEditor(preview)}
                    className="h-8 px-3 rounded-lg bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-neutral-900 shadow-xl hover:bg-white active:scale-95 transition-all inline-flex items-center gap-1.5">
                    <Icon name="pencil" className="h-3 w-3" /> Edit
                  </button>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="h-8 px-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 text-[11px] font-semibold text-white shadow-xl hover:bg-white/30 active:scale-95 transition-all inline-flex items-center gap-1.5">
                    <Icon name="image" className="h-3 w-3" /> Ganti
                  </button>
                  <button type="button" onClick={() => onChange('')}
                    className="h-8 w-8 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-400/20 text-red-300 shadow-xl hover:bg-red-500/30 active:scale-95 flex items-center justify-center transition-all">
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ═══ DROP ZONE ═══ */}
        {!hasPhoto && !editorOpen && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              'group cursor-pointer relative rounded-xl border-2 border-dashed py-12 px-6 text-center overflow-hidden transition-all duration-300',
              dragOver
                ? 'border-primary-500 bg-primary-50/80 scale-[1.005] shadow-lg shadow-primary-500/10'
                : 'border-neutral-300/80 bg-gradient-to-b from-neutral-50 to-white hover:border-primary-400/60 hover:shadow-sm',
            )}
          >
            {/* Subtle pattern background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            <div className={cn(
              'relative mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300',
              dragOver ? 'bg-primary-100 text-primary-600 scale-110 rotate-3' : 'bg-neutral-100/80 text-neutral-400 group-hover:bg-primary-50 group-hover:text-primary-500 group-hover:scale-105',
            )}>
              <Icon name="image" className="h-6 w-6" />
            </div>
            <p className="relative text-sm font-semibold text-neutral-800">
              {dragOver ? 'Lepaskan untuk upload' : 'Pilih atau jatuhkan foto'}
            </p>
            <p className="relative text-xs text-neutral-500 mt-1.5">
              JPG, PNG, WebP &bull; Maks 8 MB &bull; Crop 16:10
            </p>
          </div>
        )}

        {/* Error */}
        {error && !editorOpen && (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 animate-slide-down">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Icon name="x" className="h-3 w-3 text-red-600" />
            </div>
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* URL manual */}
        {!editorOpen && (
          !showUrl ? (
            <button type="button" onClick={() => setShowUrl(true)}
              className="text-[11px] text-neutral-400 hover:text-primary-600 transition-colors duration-200 tracking-wide">
              ATAU MASUKKAN URL &rarr;
            </button>
          ) : (
            <div className="flex gap-2 items-center animate-fade-in">
              <input type="url" value={urlVal} onChange={e => setUrlVal(e.target.value)} placeholder="https://..."
                className="flex-1 h-9 rounded-lg border border-neutral-200 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15 transition-all" />
              <Button size="sm" onClick={() => { if (urlVal.trim()) { onChange(urlVal.trim()); setUrlVal(''); setShowUrl(false); } }} disabled={!urlVal.trim()}>OK</Button>
              <button type="button" onClick={() => { setShowUrl(false); setUrlVal(''); }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors">
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        )}

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => onFiles(e.target.files)} />
      </div>


      {/* ═══════════ FULLSCREEN EDITOR — Cinematic ═══════════ */}
      {editorOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-[#0c0c0f]">
          {/* Top bar — frosted glass */}
          <div className="relative z-10 flex items-center justify-between h-14 px-5 border-b border-white/[0.06] bg-[#0c0c0f]/80 backdrop-blur-xl">
            <button type="button" onClick={closeEditor}
              className="h-8 px-4 rounded-lg text-[12px] font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all">
              Batal
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 text-center">
              <p className="text-[11px] font-semibold text-white/90 tracking-wide">ATUR KOMPOSISI</p>
              <p className="text-[10px] text-white/30 mt-0.5">{name}.webp &bull; 1280×800</p>
            </div>
            <button type="button" onClick={save} disabled={saving}
              className="h-8 px-5 rounded-lg bg-white text-[12px] font-bold text-[#0c0c0f] hover:bg-white/90 disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-white/10">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

          {/* Canvas area — centered with padding */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
            <div
              ref={canvasRef}
              className={cn(
                'relative overflow-hidden rounded-lg shadow-2xl shadow-black/60 ring-1 ring-white/[0.08]',
                panning ? 'cursor-grabbing' : 'cursor-grab',
              )}
              style={{ width: 'min(90vw, 800px)', aspectRatio: '16 / 10' }}
              onPointerDown={pDown}
              onPointerMove={pMove}
              onPointerUp={pUp}
              onPointerCancel={pUp}
              onWheel={onWheel}
              onDoubleClick={() => { setZoom(1); setPx(0); setPy(0); setRot(0); }}
            >
              {src && (
                <img src={src} alt="" draggable={false}
                  className={cn('absolute inset-0 w-full h-full object-cover will-change-transform select-none', panning ? '' : 'transition-transform duration-200 ease-out')}
                  style={{ transform: `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${zoom})`, transformOrigin: 'center' }}
                />
              )}
              {/* Dashed rule-of-thirds */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 480 300" fill="none">
                <line x1="160" y1="0" x2="160" y2="300" stroke="white" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="6 4" />
                <line x1="320" y1="0" x2="320" y2="300" stroke="white" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="6 4" />
                <line x1="0" y1="100" x2="480" y2="100" stroke="white" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="6 4" />
                <line x1="0" y1="200" x2="480" y2="200" stroke="white" strokeOpacity="0.12" strokeWidth="0.6" strokeDasharray="6 4" />
              </svg>
              {/* Corner L-brackets */}
              <div className="absolute top-3 left-3 w-6 h-6 border-l-[2px] border-t-[2px] border-white/40 rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-6 h-6 border-r-[2px] border-t-[2px] border-white/40 rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-l-[2px] border-b-[2px] border-white/40 rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-r-[2px] border-b-[2px] border-white/40 rounded-br-sm" />
            </div>
          </div>

          {/* Bottom toolbar — floating glass panel */}
          <div className="relative z-10 border-t border-white/[0.06] bg-[#0c0c0f]/80 backdrop-blur-xl px-5 py-4">
            <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
              {/* Zoom pill */}
              <div className="inline-flex items-center gap-0.5 bg-white/[0.06] rounded-full p-1 border border-white/[0.08]">
                <button type="button" onClick={() => setZoom(z => Math.max(1, +(z - 0.2).toFixed(1)))}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <Icon name="minus" className="h-3 w-3" />
                </button>
                <span className="w-12 text-center text-[11px] font-bold text-white/80 tabular-nums tracking-wide">{zoom.toFixed(1)}×</span>
                <button type="button" onClick={() => setZoom(z => Math.min(3, +(z + 0.2).toFixed(1)))}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                  <Icon name="plus" className="h-3 w-3" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setRot(r => (r + 90) % 360)}
                  className="h-8 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/10 inline-flex items-center gap-1.5 transition-all active:scale-95">
                  <Icon name="rotate-clockwise" className="h-3.5 w-3.5" /> Putar
                </button>
                <button type="button" onClick={() => { setZoom(1); setPx(0); setPy(0); setRot(0); }}
                  className="h-8 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95">
                  Reset
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="h-8 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/10 inline-flex items-center gap-1.5 transition-all active:scale-95">
                  <Icon name="image" className="h-3.5 w-3.5" /> Ganti
                </button>
              </div>
            </div>
            {/* Hint */}
            <p className="text-center text-[10px] text-white/25 mt-3 tracking-[0.2em] uppercase">
              Drag geser &nbsp;&bull;&nbsp; Scroll zoom &nbsp;&bull;&nbsp; Double-klik reset
            </p>
          </div>
        </div>
      )}
    </>
  );
}
