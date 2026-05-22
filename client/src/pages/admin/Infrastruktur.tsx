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
  nama: '',
  kategori: '',
  alamat: '',
  fotoUrl: '',
  lat: '',
  lng: '',
  idkab: IDKAB_PADANG_PARIAMAN,
  idkec: '',
  iddesa: '',
  idsls: '',
};

function MapPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number | '';
  lng: number | '';
  onChange: (lat: number, lng: number) => void;
}) {
  const center = useMemo<[number, number]>(() => (lat !== '' && lng !== '' ? [lat, lng] : MAP_CENTER), [lat, lng]);
  const [pinPosition, setPinPosition] = useState<[number, number]>(center);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
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
    if (isDraggingPin) return;
    setPinPosition(center);
  }, [center, isDraggingPin]);

  function SyncMapCenter({ position, enabled }: { position: [number, number]; enabled: boolean }) {
    const map = useMap();

    useEffect(() => {
      if (!enabled) return;
      map.panTo(position, { animate: true, duration: 0.25 });
    }, [enabled, map, position]);

    return null;
  }

  function commitPosition(position: [number, number]) {
    setPinPosition(position);
    onChange(position[0], position[1]);
  }

  function ClickHandler() {
    useMapEvents({
      click(event) {
        commitPosition([event.latlng.lat, event.latlng.lng]);
      },
    });

    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-soft">
      <div className="flex items-center justify-between border-b border-neutral-200/70 bg-white px-3 py-2">
      <div>
        <p className="text-xs font-semibold text-neutral-800">Pilih titik di peta</p>
          <p className="text-[11px] text-neutral-500">Klik peta untuk pindah cepat, atau geser pin untuk penyesuaian halus.</p>
        </div>
        <Badge variant="neutral">Google Road</Badge>
      </div>
      <div className="h-60">
        <LeafletMap center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <SyncMapCenter position={pinPosition} enabled={!isDraggingPin} />
          <TileLayer url={BASEMAP_GOOGLE_ROAD} attribution={BASEMAP_GOOGLE_ATTRIBUTION} />
          <ClickHandler />
          {lat !== '' && lng !== '' && (
            <Marker
              position={pinPosition}
              draggable
              icon={adminPinIcon}
              eventHandlers={{
                dragstart() {
                  setIsDraggingPin(true);
                },
                dragend(event) {
                  const posisiBaru = event.target.getLatLng();
                  setIsDraggingPin(false);
                  commitPosition([posisiBaru.lat, posisiBaru.lng]);
                },
              }}
            />
          )}
        </LeafletMap>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200/70 bg-white px-3 py-2">
        <span className="text-[11px] font-medium text-neutral-500">Koordinat sementara</span>
        <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-mono text-[11px] text-neutral-700">
          {pinPosition[0].toFixed(6)}, {pinPosition[1].toFixed(6)}
        </span>
      </div>
    </div>
  );
}

export default function AdminInfrastruktur() {
  useEffect(() => {
    document.title = 'Infrastruktur - Admin Peta Tematik';
  }, []);

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
  const [importResult, setImportResult] = useState<{
    berhasil: number;
    gagal: number;
    errors: { baris: number; pesan: string }[];
  } | null>(null);
  const { toast } = useToast();

  const kecamatanList = useKecamatanGeoJSON();
  const nagariList = useNagariGeoJSON(form.idkec);
  const korongList = useKorongGeoJSON(form.iddesa);

  useEffect(() => {
    async function fetchKategori() {
      try {
        const res = await api.get('/kategori');
        setKategoriList(res.data);
      } catch (error) {
        console.error(error);
      }
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
    } catch {
      // handled by empty state
    } finally {
      setLoading(false);
    }
  }, [filterKat, page, search]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item: Infrastruktur) => {
    setForm({
      nama: item.nama,
      kategori: item.kategori,
      alamat: item.alamat ?? '',
      fotoUrl: item.fotoUrl ?? '',
      lat: item.lat,
      lng: item.lng,
      idkab: item.idkab,
      idkec: item.idkec,
      iddesa: item.iddesa,
      idsls: item.idsls ?? '',
    });
    setEditId(item.id);
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.nama || !form.kategori || form.lat === '' || form.lng === '' || !form.idkec || !form.iddesa) {
      setFormError('Nama, kategori, koordinat, kecamatan, dan nagari wajib diisi');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editId) {
        await api.put(`/infrastruktur/${editId}`, form);
      } else {
        await api.post('/infrastruktur', form);
      }

      toast.success(editId ? 'Data berhasil diperbarui' : 'Data berhasil ditambahkan');
      setShowForm(false);
      fetchList();
    } catch (error: unknown) {
      setFormError(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;

    try {
      await api.delete(`/infrastruktur/${showDeleteId}`);
      toast.success('Data berhasil dihapus');
      setShowDeleteId(null);
      fetchList();
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus',
      );
      setShowDeleteId(null);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/infrastruktur/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult(res.data);
      fetchList();
      toast.success(`Import selesai: ${res.data.berhasil} berhasil, ${res.data.gagal} gagal`);
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal import',
      );
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleExport = async () => {
    const res = await api.get('/infrastruktur/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `infrastruktur_${new Date().toISOString().split('T')[0]}.xlsx`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/template/infrastruktur', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'template_infrastruktur.xlsx';
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Template berhasil diunduh');
    } catch {
      toast.error('Gagal mengunduh template');
    }
  };

  const getKategori = (value: string) => kategoriList.find((item) => item.value === value);

  return (
    <AdminLayout title="Manajemen Infrastruktur">
      <div className="max-w-7xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <label
              className={cn(
                'cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1.5',
                importing
                  ? 'pointer-events-none bg-neutral-100 text-neutral-500 opacity-60'
                  : 'border-success-500/20 bg-success-50 text-success-600 hover:bg-success-500/10',
              )}
            >
              <Icon name="database" className="h-4 w-4" />
              {importing ? 'Importing...' : 'Import Excel'}
              <input type="file" accept=".xlsx" className="hidden" onChange={handleImport} disabled={importing} />
            </label>
            <Button variant="secondary" size="sm" onClick={handleDownloadTemplate}>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="layers" className="h-4 w-4" />
                <span>Template</span>
              </span>
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="chart" className="h-4 w-4" />
                <span>Export Excel</span>
              </span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama..."
              containerClassName="w-44"
            />
            <Select
              value={filterKat}
              onChange={(event) => {
                setFilterKat(event.target.value);
                setPage(1);
              }}
              containerClassName="w-44"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Button onClick={openAdd}>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="plus" className="h-4 w-4" />
                <span>Tambah</span>
              </span>
            </Button>
          </div>
        </div>

        {importResult && (
          <div
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border p-3 text-sm',
              importResult.gagal > 0
                ? 'border-warning-500/20 bg-warning-50 text-warning-700'
                : 'border-success-500/20 bg-success-50 text-success-700',
            )}
          >
            <span>Berhasil: <b>{importResult.berhasil}</b> | Gagal: <b>{importResult.gagal}</b></span>
            <button type="button" onClick={() => setImportResult(null)} className="text-xs font-semibold hover:underline">
              Tutup
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-soft">
          <div className="flex justify-between border-b border-neutral-100 px-4 py-2.5 text-xs text-neutral-500">
            <span>{total.toLocaleString('id-ID')} data</span>
            <span>Hal. {page}/{totalPages || 1}</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-10 w-full" />)}</div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-neutral-600">Belum ada data infrastruktur</p>
              <p className="mt-1 text-xs text-neutral-400">Klik tombol tambah untuk menambahkan data pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[760px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Nama</th>
                    <th>Kategori</th>
                    <th>Kecamatan</th>
                    <th>Koordinat</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, index) => {
                    const kategori = getKategori(item.kategori);

                    return (
                      <tr key={item.id}>
                        <td className="text-xs text-neutral-400">{(page - 1) * ADMIN_PAGE_SIZE + index + 1}</td>
                        <td className="max-w-[220px] font-medium text-neutral-900">
                          <span className="block truncate">{item.nama}</span>
                        </td>
                        <td>
                          {kategori ? (
                            <Badge color={kategori.color}>
                              <span className="inline-flex items-center gap-1.5">
                                <Icon name={resolveKategoriIcon(kategori.icon, kategori.value, kategori.label)} className="h-3.5 w-3.5" />
                                <span>{kategori.label}</span>
                              </span>
                            </Badge>
                          ) : (
                            <span className="text-xs text-neutral-400">{item.kategori}</span>
                          )}
                        </td>
                        <td className="text-xs font-mono text-neutral-500">{item.idkec}</td>
                        <td className="text-xs font-mono text-neutral-400">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit">
                              <Icon name="pencil" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDeleteId(item.id)}
                              aria-label="Hapus"
                              className="text-danger-500 hover:bg-danger-50"
                            >
                              <Icon name="trash" className="h-4 w-4" />
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
            <div className="flex items-center justify-center gap-2 border-t border-neutral-100 px-4 py-3">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Prev
              </Button>
              <span className="px-2 text-xs text-neutral-500">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editId ? 'Edit Infrastruktur' : 'Tambah Infrastruktur'}
          description="Atur detail lokasi, foto, dan wilayah. Perubahan koordinat akan langsung tercermin di mini-map tanpa refresh ulang."
          size="lg"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" form="infra-form" isLoading={saving}>Simpan</Button>
            </>
          }
        >
          <form id="infra-form" onSubmit={handleSave} className="space-y-5">
            <Input
              label="Nama"
              required
              value={form.nama}
              onChange={(event) => setForm((current) => ({ ...current, nama: event.target.value }))}
              placeholder="Nama infrastruktur"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Kategori"
                required
                value={form.kategori}
                onChange={(event) => setForm((current) => ({ ...current, kategori: event.target.value }))}
              >
                <option value="">Pilih kategori</option>
                {kategoriList.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>

              <Input
                label="Alamat"
                value={form.alamat}
                onChange={(event) => setForm((current) => ({ ...current, alamat: event.target.value }))}
                placeholder="Alamat lengkap"
              />
            </div>

            <FotoUpload value={form.fotoUrl} onChange={(url) => setForm((current) => ({ ...current, fotoUrl: url }))} />

            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">Koordinat *</label>
                <p className="text-xs text-neutral-500">Klik peta untuk memilih lokasi, atau rapikan presisi lewat input latitude dan longitude.</p>
              </div>
              <MapPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm((current) => ({ ...current, lat, lng }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(event) => setForm((current) => ({ ...current, lat: parseFloat(event.target.value) || '' }))}
                  className="font-mono"
                  hint="Gunakan angka desimal agar titik lebih akurat."
                />
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={form.lng}
                  onChange={(event) => setForm((current) => ({ ...current, lng: parseFloat(event.target.value) || '' }))}
                  className="font-mono"
                  hint="Pin bisa diklik di peta atau digeser langsung untuk penyesuaian halus."
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <Select
                label="Kecamatan"
                required
                value={form.idkec}
                onChange={(event) => setForm((current) => ({ ...current, idkec: event.target.value, iddesa: '', idsls: '' }))}
              >
                <option value="">Pilih kecamatan</option>
                {kecamatanList.map((item) => (
                  <option key={item.kode} value={item.kode}>
                    {item.nama}
                  </option>
                ))}
              </Select>

              <Select
                label="Nagari / Desa"
                required
                value={form.iddesa}
                onChange={(event) => setForm((current) => ({ ...current, iddesa: event.target.value, idsls: '' }))}
                disabled={!form.idkec}
              >
                <option value="">{form.idkec ? 'Pilih nagari' : 'Pilih kecamatan dulu'}</option>
                {nagariList.map((item) => (
                  <option key={item.kode} value={item.kode}>
                    {item.nama}
                  </option>
                ))}
              </Select>

              <Select
                label="Korong"
                value={form.idsls}
                onChange={(event) => setForm((current) => ({ ...current, idsls: event.target.value }))}
                disabled={!form.iddesa}
              >
                <option value="">{form.iddesa ? 'Pilih korong' : 'Pilih nagari dulu'}</option>
                {korongList.map((item) => (
                  <option key={item.kode} value={item.kode}>
                    {item.nama}
                  </option>
                ))}
              </Select>
            </div>

            {formError && (
              <div role="alert" className="rounded-xl border border-danger-500/20 bg-danger-50 px-3 py-2 text-xs text-danger-600">
                {formError}
              </div>
            )}
          </form>
        </Modal>

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
          <p className="text-sm text-neutral-600">Apakah Anda yakin ingin menghapus data infrastruktur ini? Tindakan ini tidak dapat dibatalkan.</p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
