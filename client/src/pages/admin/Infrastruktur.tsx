import React, { useCallback, useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer as LeafletMap, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Infrastruktur, InfrastrukturFormData, KategoriInfra } from '../../types';
import {
  ADMIN_PAGE_SIZE,
  BASEMAP_GOOGLE_ATTRIBUTION,
  BASEMAP_GOOGLE_ROAD,
  IDKAB_PADANG_PARIAMAN,
  MAP_CENTER,
} from '../../constants';
import { useKecamatanGeoJSON, useKorongGeoJSON, useNagariGeoJSON } from '../../hooks/useWilayahGeoJSON';
import { FotoUpload } from '../../components/admin/FotoUpload';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { resolveKategoriIcon } from '../../lib/categoryIcons';
import { cn } from '../../lib/cn';
import { CategoryBadge } from '../../components/admin/CategoryBadge';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const EMPTY_FORM: InfrastrukturFormData = {
  nama: '', kategori: '', alamat: '', fotoUrl: '',
  fotoCropX: 50, fotoCropY: 50, fotoCropZoom: 1,
  lat: '', lng: '',
  idkab: IDKAB_PADANG_PARIAMAN, idkec: '', iddesa: '', idsls: '',
};

function MapPicker({ lat, lng, onChange }: { lat: number | ''; lng: number | ''; onChange: (lat: number, lng: number) => void }) {
  const center = useMemo<[number, number]>(() => (lat !== '' && lng !== '' ? [lat, lng] : MAP_CENTER), [lat, lng]);
  const [pinPosition, setPinPosition] = useState<[number, number]>(center);
  const [isDragging, setIsDragging] = useState(false);
  const adminPinIcon = useMemo(
    () => L.divIcon({
      className: 'admin-location-pin',
      html: '<span class="admin-location-pin__halo"></span><span class="admin-location-pin__body"></span>',
      iconSize: [44, 44],
      iconAnchor: [22, 38],
    }),
    [],
  );

  useEffect(() => {
    if (isDragging) return;
    setPinPosition(center);
  }, [center, isDragging]);

  function SyncCenter({ position, enabled }: { position: [number, number]; enabled: boolean }) {
    const map = useMap();
    useEffect(() => {
      if (!enabled) return;
      map.panTo(position, { animate: true, duration: 0.25 });
    }, [enabled, map, position]);
    return null;
  }

  function commitPosition(pos: [number, number]) {
    setPinPosition(pos);
    onChange(pos[0], pos[1]);
  }

  function ClickHandler() {
    useMapEvents({ click(e) { commitPosition([e.latlng.lat, e.latlng.lng]); } });
    return null;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-3 py-2">
        <p className="text-xs text-neutral-600">Klik peta untuk memilih lokasi</p>
        <span className="text-[11px] font-mono text-neutral-500">
          {pinPosition[0].toFixed(5)}, {pinPosition[1].toFixed(5)}
        </span>
      </div>
      <div className="h-52">
        <LeafletMap center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <SyncCenter position={pinPosition} enabled={!isDragging} />
          <TileLayer url={BASEMAP_GOOGLE_ROAD} attribution={BASEMAP_GOOGLE_ATTRIBUTION} />
          <ClickHandler />
          {lat !== '' && lng !== '' && (
            <Marker
              position={pinPosition}
              draggable
              icon={adminPinIcon}
              eventHandlers={{
                dragstart() { setIsDragging(true); },
                dragend(event) {
                  const pos = event.target.getLatLng();
                  setIsDragging(false);
                  commitPosition([pos.lat, pos.lng]);
                },
              }}
            />
          )}
        </LeafletMap>
      </div>
    </div>
  );
}

export default function AdminInfrastruktur() {
  useEffect(() => { document.title = 'Infrastruktur - Admin Peta Tematik'; }, []);

  const [list, setList] = useState<Infrastruktur[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [kategoriList, setKategoriList] = useState<KategoriInfra[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<InfrastrukturFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ berhasil: number; gagal: number; errors: { baris: number; pesan: string }[] } | null>(null);
  const { toast } = useToast();

  const kecamatanList = useKecamatanGeoJSON();
  const nagariList = useNagariGeoJSON(form.idkec);
  const korongList = useKorongGeoJSON(form.iddesa);

  useEffect(() => {
    async function fetchKategori() {
      try { const res = await api.get('/kategori'); setKategoriList(res.data); } catch (e) { console.error(e); }
    }
    fetchKategori();
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: ADMIN_PAGE_SIZE };
      if (search) params.search = search;
      if (filterKat) params.kategori = filterKat;
      const res = await api.get('/infrastruktur', { params });
      setList(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch { /* handled */ }
    finally { setLoading(false); }
  }, [filterKat, page, search]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit = (item: Infrastruktur) => {
    setForm({ nama: item.nama, kategori: item.kategori, alamat: item.alamat ?? '', fotoUrl: item.fotoUrl ?? '', fotoCropX: item.fotoCropX ?? 50, fotoCropY: item.fotoCropY ?? 50, fotoCropZoom: item.fotoCropZoom ?? 1, lat: item.lat, lng: item.lng, idkab: item.idkab, idkec: item.idkec, iddesa: item.iddesa, idsls: item.idsls ?? '' });
    setEditId(item.id); setFormError(''); setShowForm(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nama || !form.kategori || form.lat === '' || form.lng === '' || !form.idkec || !form.iddesa) {
      setFormError('Nama, kategori, koordinat, kecamatan, dan nagari wajib diisi'); return;
    }
    setSaving(true); setFormError('');
    try {
      if (editId) await api.put(`/infrastruktur/${editId}`, form);
      else await api.post('/infrastruktur', form);
      toast.success(editId ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
      setShowForm(false); fetchList();
    } catch (error: unknown) {
      setFormError((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;
    try { await api.delete(`/infrastruktur/${showDeleteId}`); toast.success('Data berhasil dihapus'); setShowDeleteId(null); fetchList(); }
    catch (error: unknown) { toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus'); setShowDeleteId(null); }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await api.post('/infrastruktur/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data); fetchList();
      toast.success(`Import selesai: ${res.data.berhasil} berhasil, ${res.data.gagal} gagal`);
    } catch (error: unknown) { toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal import'); }
    finally { setImporting(false); event.target.value = ''; }
  };

  const handleExport = async () => {
    const res = await api.get('/infrastruktur/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `infrastruktur_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/template/infrastruktur', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'template_infrastruktur.xlsx'; a.click(); URL.revokeObjectURL(url);
      toast.success('Template berhasil diunduh');
    } catch { toast.error('Gagal mengunduh template'); }
  };

  const getKategori = (value: string) => kategoriList.find((item) => item.value === value);

  return (
    <AdminLayout title="Infrastruktur">
      <div className="max-w-7xl space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className={cn(
              'cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium inline-flex items-center gap-1.5 transition-colors',
              importing ? 'opacity-50 pointer-events-none bg-neutral-50 text-neutral-400' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
            )}>
              <Icon name="database" className="h-3.5 w-3.5" />
              {importing ? 'Importing...' : 'Import'}
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
            <Button variant="secondary" size="sm" onClick={handleDownloadTemplate}>
              <Icon name="layers" className="h-3.5 w-3.5" />
              <span>Template</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Icon name="chart" className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari nama..."
              containerClassName="w-40"
            />
            <Select
              value={filterKat}
              onChange={(e) => { setFilterKat(e.target.value); setPage(1); }}
              containerClassName="w-40"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
            <Button onClick={openAdd} size="sm">
              <Icon name="plus" className="h-3.5 w-3.5" />
              <span>Tambah</span>
            </Button>
          </div>
        </div>

        {/* Import result */}
        {importResult && (
          <div className={cn(
            'flex items-center justify-between rounded-lg border p-3 text-sm',
            importResult.gagal > 0 ? 'border-warning-100 bg-warning-50 text-warning-700' : 'border-success-100 bg-success-50 text-success-700',
          )}>
            <span>Berhasil: <strong>{importResult.berhasil}</strong> &middot; Gagal: <strong>{importResult.gagal}</strong></span>
            <button type="button" onClick={() => setImportResult(null)} className="text-xs font-medium hover:underline">Tutup</button>
          </div>
        )}

        {/* Table */}
        <div className="admin-panel">
          <div className="flex justify-between border-b border-neutral-100 px-4 py-2.5 text-xs text-neutral-500">
            <span>{total.toLocaleString('id-ID')} data</span>
            <span>Hal. {page}/{totalPages || 1}</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="database" className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-600">Belum ada data</p>
              <p className="text-xs text-neutral-400 mt-1">Klik tambah untuk menambahkan data pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[720px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Kecamatan</th>
                    <th>Koordinat</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, index) => {
                    const kategori = getKategori(item.kategori);
                    return (
                      <tr key={item.id}>
                        <td className="text-xs text-neutral-400">{(page - 1) * ADMIN_PAGE_SIZE + index + 1}</td>
                        <td className="max-w-[200px]">
                          <span className="block truncate font-medium text-neutral-900">{item.nama}</span>
                        </td>
                        <td>
                          {kategori ? (
                            <Badge color={kategori.color}>
                              <Icon name={resolveKategoriIcon(kategori.icon, kategori.value, kategori.label)} className="h-3 w-3" />
                              {kategori.label}
                            </Badge>
                          ) : (
                            <span className="text-xs text-neutral-400">{item.kategori}</span>
                          )}
                        </td>
                        <td className="text-xs font-mono text-neutral-500">{item.idkec}</td>
                        <td className="text-xs font-mono text-neutral-400">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit">
                              <Icon name="pencil" className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setShowDeleteId(item.id)} aria-label="Hapus" className="text-danger-500 hover:bg-danger-50">
                              <Icon name="trash" className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-neutral-100 py-3">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="text-xs text-neutral-500 px-2">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editId ? 'Edit Infrastruktur' : 'Tambah Infrastruktur'}
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" form="infra-form" isLoading={saving}>Simpan</Button>
            </>
          }
        >
          <form id="infra-form" onSubmit={handleSave} className="space-y-5">
            <Input label="Nama" required value={form.nama} onChange={(e) => setForm(f => ({ ...f, nama: e.target.value }))} placeholder="Nama infrastruktur" />

            <div className="grid gap-3 sm:grid-cols-2">
              <Select label="Kategori" required value={form.kategori} onChange={(e) => setForm(f => ({ ...f, kategori: e.target.value }))}>
                <option value="">Pilih kategori</option>
                {kategoriList.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </Select>
              <Input label="Alamat" value={form.alamat} onChange={(e) => setForm(f => ({ ...f, alamat: e.target.value }))} placeholder="Alamat lengkap" />
            </div>

            <FotoUpload value={form.fotoUrl} onChange={(url) => setForm(f => ({ ...f, fotoUrl: url }))} cropMeta={{ fotoCropX: form.fotoCropX, fotoCropY: form.fotoCropY, fotoCropZoom: form.fotoCropZoom }} onCropChange={(meta) => setForm(f => ({ ...f, ...meta }))} />

            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-700">Koordinat *</label>
              <MapPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm(f => ({ ...f, lat, lng }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Latitude" type="number" step="any" value={form.lat} onChange={(e) => setForm(f => ({ ...f, lat: parseFloat(e.target.value) || '' }))} className="font-mono" />
                <Input label="Longitude" type="number" step="any" value={form.lng} onChange={(e) => setForm(f => ({ ...f, lng: parseFloat(e.target.value) || '' }))} className="font-mono" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Select label="Kecamatan" required value={form.idkec} onChange={(e) => setForm(f => ({ ...f, idkec: e.target.value, iddesa: '', idsls: '' }))}>
                <option value="">Pilih</option>
                {kecamatanList.map((item) => <option key={item.kode} value={item.kode}>{item.nama}</option>)}
              </Select>
              <Select label="Nagari" required value={form.iddesa} onChange={(e) => setForm(f => ({ ...f, iddesa: e.target.value, idsls: '' }))} disabled={!form.idkec}>
                <option value="">{form.idkec ? 'Pilih' : '—'}</option>
                {nagariList.map((item) => <option key={item.kode} value={item.kode}>{item.nama}</option>)}
              </Select>
              <Select label="Korong" value={form.idsls} onChange={(e) => setForm(f => ({ ...f, idsls: e.target.value }))} disabled={!form.iddesa}>
                <option value="">{form.iddesa ? 'Pilih' : '—'}</option>
                {korongList.map((item) => <option key={item.kode} value={item.kode}>{item.nama}</option>)}
              </Select>
            </div>

            {formError && (
              <div className="rounded-lg bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">{formError}</div>
            )}
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteId !== null}
          onClose={() => setShowDeleteId(null)}
          title="Hapus Data"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteId(null)}>Batal</Button>
              <Button variant="danger" onClick={confirmDelete}>Hapus</Button>
            </>
          }
        >
          <p className="text-sm text-neutral-600">Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.</p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
