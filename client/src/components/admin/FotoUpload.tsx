import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../lib/api';
import { cn } from '../../lib/cn';
import { resolveAssetUrl } from '../../lib/assetUrl';
import { Icon } from '../ui/Icon';
import { Input } from '../ui/Input';

interface FotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const POPUP_FOTO_ASPECT = 16 / 10;
const OUTPUT_WIDTH = 1280;
const OUTPUT_HEIGHT = 800;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function blobFromCanvas(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Gagal memproses foto'));
      },
      'image/webp',
      0.88,
    );
  });
}

export function FotoUpload({ value, onChange }: FotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [editorSrc, setEditorSrc] = useState('');
  const [fileName, setFileName] = useState('foto-infrastruktur');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const previewUrl = resolveAssetUrl(value);

  function resetAdjustments() {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
  }

  function resetEditor() {
    setEditorSrc('');
    resetAdjustments();
    if (inputRef.current) inputRef.current.value = '';
  }

  function updateZoom(delta: number) {
    setZoom((current) => Math.max(1, Math.min(2.5, Number((current + delta).toFixed(2)))));
  }

  function prepareFile(file: File) {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Ukuran foto maksimal 8MB sebelum diproses.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name.replace(/\.[^.]+$/, '') || 'foto-infrastruktur');
      setEditorSrc(String(reader.result));
      resetAdjustments();
    };
    reader.onerror = () => setError('Foto gagal dibaca.');
    reader.readAsDataURL(file);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) prepareFile(file);
  }

  function openCurrentPhotoEditor() {
    if (!previewUrl) return;

    setError('');
    setFileName('foto-infrastruktur');
    setEditorSrc(previewUrl);
    resetAdjustments();
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStartRef.current = { x: event.clientX, y: event.clientY, panX, panY };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStartRef.current) return;

    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.panX + deltaX);
    setPanY(dragStartRef.current.panY + deltaY);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    dragStartRef.current = null;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    updateZoom(event.deltaY > 0 ? -0.08 : 0.08);
  }

  async function uploadWebp(blob: Blob) {
    const safeName = fileName.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-|-$/g, '') || 'foto';
    const file = new File([blob], `${safeName}.webp`, { type: 'image/webp' });
    const formData = new FormData();
    formData.append('foto', file);

    const res = await api.post('/upload/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    onChange(res.data.fotoUrl);
  }

  async function applyEditAndUpload() {
    if (!editorSrc) return;

    setUploading(true);
    setError('');

    try {
      const image = await loadImage(editorSrc);
      const width = OUTPUT_WIDTH;
      const height = OUTPUT_HEIGHT;
      const cropRect = cropRef.current?.getBoundingClientRect();
      const previewWidth = cropRect?.width || width;
      const outputScale = width / previewWidth;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas tidak tersedia');

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      const rotated = rotation % 180 !== 0;
      const sourceWidth = rotated ? image.height : image.width;
      const sourceHeight = rotated ? image.width : image.height;
      const baseScale = Math.max(width / sourceWidth, height / sourceHeight) * zoom;
      const translateX = panX * outputScale;
      const translateY = panY * outputScale;

      ctx.save();
      ctx.translate(width / 2 + translateX, height / 2 + translateY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(
        image,
        -(image.width * baseScale) / 2,
        -(image.height * baseScale) / 2,
        image.width * baseScale,
        image.height * baseScale,
      );
      ctx.restore();

      const blob = await blobFromCanvas(canvas);
      await uploadWebp(blob);
      resetEditor();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Foto gagal diproses.');
    } finally {
      setUploading(false);
    }
  }

  function handleManualSave() {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setShowManual(false);
    setManualUrl('');
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Foto Infrastruktur</p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">Atur fokus foto langsung pada preview.</p>
          </div>
          <BadgeChip text="WebP" />
        </div>

        {value && !editorSrc && (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="relative aspect-[16/10] bg-neutral-100">
              <img src={previewUrl} alt="Foto infrastruktur" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 p-3">
              <p className="text-xs font-medium text-neutral-500">Foto aktif siap tampil di popup dan detail infrastruktur.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openCurrentPhotoEditor}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                >
                  <Icon name="pencil" className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  <Icon name="image" className="h-3.5 w-3.5" />
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-danger-500/20 px-3 text-xs font-semibold text-danger-600 hover:bg-danger-50"
                >
                  <Icon name="x" className="h-3.5 w-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {editorSrc && <p className="text-xs font-medium text-neutral-500">Foto sedang dibuka di editor crop.</p>}

        {!value && !editorSrc && (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'cursor-pointer rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center transition-colors',
              'hover:border-primary-300 hover:bg-primary-50/40',
            )}
          >
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-white text-primary-700 shadow-soft">
              <Icon name="image" className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800">Pilih foto infrastruktur</p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              JPG, PNG, atau WebP. Foto bisa langsung digeser dan diperbesar sebelum diunggah.
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-xl border border-danger-500/20 bg-danger-50 px-3 py-2 text-xs text-danger-600">
            {error}
          </p>
        )}

        {!showManual ? (
          <button
            type="button"
            onClick={() => setShowManual(true)}
            className="text-xs font-semibold text-primary-700 hover:underline"
          >
            Isi URL manual
          </button>
        ) : (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Input
                type="url"
                value={manualUrl}
                onChange={(event) => setManualUrl(event.target.value)}
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleManualSave}
                className="h-10 rounded-xl bg-primary-500 px-3 text-xs font-semibold text-white hover:bg-primary-600"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowManual(false);
                  setManualUrl('');
                }}
                className="h-10 rounded-xl border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {editorSrc && (
        <div className="fixed inset-0 z-[5000] flex flex-col bg-neutral-950 text-white">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <button
              type="button"
              onClick={resetEditor}
              className="h-10 rounded-full px-4 text-sm font-semibold text-white/80 hover:bg-white/10"
            >
              Batal
            </button>
            <div className="min-w-0 text-center">
              <div className="truncate text-sm font-semibold">Edit foto</div>
              <div className="truncate text-[11px] text-white/50">{fileName}</div>
            </div>
            <button
              type="button"
              onClick={applyEditAndUpload}
              disabled={uploading}
              className="h-10 rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Memproses' : 'Simpan'}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-5">
            <div
              ref={cropRef}
              className={cn(
                'relative overflow-hidden bg-neutral-900 shadow-2xl touch-none',
                dragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
              style={{
                width: 'min(92vw, 760px, calc(58dvh * 1.6))',
                aspectRatio: POPUP_FOTO_ASPECT,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              onDoubleClick={resetAdjustments}
            >
              <img
                src={editorSrc}
                alt="Preview edit foto"
                className={cn(
                  'h-full w-full select-none object-cover will-change-transform',
                  dragging ? 'transition-none' : 'transition-transform duration-150 ease-out',
                )}
                draggable={false}
                style={{
                  transform: `translate3d(${panX}px, ${panY}px, 0) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center',
                }}
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/35" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:33.333%_33.333%]" />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-neutral-950/95 px-4 py-4">
            <div className="mx-auto flex max-w-4xl flex-col gap-3">
              <div className="flex items-center justify-center">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                  Rasio popup peta 16:10
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <EditorIconButton title="Zoom out" onClick={() => updateZoom(-0.12)}>
                  <Icon name="minus" className="h-4 w-4" />
                </EditorIconButton>
                <input
                  aria-label="Zoom foto"
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.01"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="w-full max-w-xs accent-white"
                />
                <EditorIconButton title="Zoom in" onClick={() => updateZoom(0.12)}>
                  <Icon name="plus" className="h-4 w-4" />
                </EditorIconButton>
                <span className="hidden min-w-14 text-center text-xs font-semibold text-white/70 sm:inline">{zoom.toFixed(2)}x</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((current) => (current + 90) % 360)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  <Icon name="rotate-clockwise" className="h-4 w-4" />
                  Rotasi
                </button>
                <button
                  type="button"
                  onClick={resetAdjustments}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  <Icon name="arrow-counterclockwise" className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-xs font-semibold text-white/80 hover:bg-white/10"
                >
                  <Icon name="image" className="h-4 w-4" />
                  Ganti foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorIconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/12 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      {children}
    </button>
  );
}

function BadgeChip({ text }: { text: string }) {
  return (
    <span className="inline-flex h-8 items-center rounded-full border border-primary-200 bg-primary-50 px-3 text-[11px] font-semibold text-primary-700">
      {text}
    </span>
  );
}
