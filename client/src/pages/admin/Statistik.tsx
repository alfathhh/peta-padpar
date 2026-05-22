import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Statistik, StatistikFormData } from '../../types';
import { ADMIN_PAGE_SIZE, IDKAB_PADANG_PARIAMAN } from '../../constants';
import { useKecamatanGeoJSON, useNagariGeoJSON, useKorongGeoJSON } from '../../hooks/useWilayahGeoJSON';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Icon } from '../../components/ui/Icon';
import { cn } from '../../lib/cn';

/**
 * AdminStatistik — halaman CRUD data statistik.
 *
 * Fix: versi lama mengimport { BarChart } dan { DonutChart } sebagai named export
 * (tidak ada, sudah diubah ke default export) dan menggunakan statistikStore
 * yang tidak ada. Sekarang menggunakan CRUD pattern yang sama dengan Infrastruktur.tsx.
 */

const EMPTY_FORM: StatistikFormData = {
  idkab: IDKAB_PADANG_PARIAMAN, idkec: '', iddesa: '', idsls: '',
  indikator: '', nilai: '', satuan: '', tahun: new Date().getFullYear(),
};

const SARAN_JUDUL_STATISTIK = [
  'Jumlah Penduduk',
  'Jumlah Infrastruktur',
  'Nilai IPM',
  'Luas Lahan',
  'Luas Wilayah',
  'Jumlah KK',
  'Tingkat Kemiskinan',
];

export default function AdminStatistik() {
  React.useEffect(() => { document.title = 'Statistik — Admin Peta Tematik'; }, []);

  const [list, setList]           = useState<Statistik[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [filterTahun, setFilterTahun] = useState('');
  const [filterIdkec, setFilterIdkec] = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<number | null>(null);
  const [editId, setEditId]       = useState<number | null>(null);
  const [form, setForm]           = useState<StatistikFormData>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ berhasil: number; gagal: number; errors: { baris: number; pesan: string }[] } | null>(null);
  const [tahunList, setTahunList] = useState<number[]>([]);
  const [judulList, setJudulList] = useState<string[]>(SARAN_JUDUL_STATISTIK);
  const [filterIndikator, setFilterIndikator] = useState('');
  const { toast } = useToast();

  const kecamatanList = useKecamatanGeoJSON();
  const nagariList    = useNagariGeoJSON(form.idkec);
  const korongList    = useKorongGeoJSON(form.iddesa);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: ADMIN_PAGE_SIZE };
      if (filterTahun) params.tahun = filterTahun;
      if (filterIdkec) params.idkec = filterIdkec;
      if (filterIndikator) params.indikator = filterIndikator;
      const res = await api.get('/statistik', { params });
      setList(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      if (tahunList.length === 0) {
        const all = await api.get('/statistik', { params: { limit: 9999 } });
        const allData: Statistik[] = all.data.data ?? all.data;
        const tahuns = [...new Set(allData.map(s => s.tahun))] as number[];
        setTahunList(tahuns.sort((a, b) => b - a));
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, filterTahun, filterIdkec, filterIndikator]);

  useEffect(() => { fetchList(); }, [fetchList]);

  useEffect(() => {
    async function fetchJudul() {
      try {
        const res = await api.get('/statistik/indikator');
        const fromApi = (res.data.data ?? []).map((item: { value: string }) => item.value);
        setJudulList([...new Set([...SARAN_JUDUL_STATISTIK, ...fromApi])]);
      } catch {
        setJudulList(SARAN_JUDUL_STATISTIK);
      }
    }

    fetchJudul();
  }, []);

  const totalPages = Math.ceil(total / ADMIN_PAGE_SIZE);
  const openAdd    = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit   = (s: Statistik) => {
    setForm({ idkab: s.idkab, idkec: s.idkec ?? '', iddesa: s.iddesa ?? '', idsls: s.idsls ?? '', indikator: s.indikator, nilai: s.nilai, satuan: s.satuan ?? '', tahun: s.tahun });
    setEditId(s.id); setFormError(''); setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.indikator || form.nilai === '' || !form.tahun) {
      setFormError('Indikator, nilai, dan tahun wajib diisi'); return;
    }
    setSaving(true); setFormError('');
    try {
      const payload = { ...form, nilai: Number(form.nilai), tahun: Number(form.tahun) };
      if (editId) await api.put(`/statistik/${editId}`, payload);
      else        await api.post('/statistik', payload);
      toast.success(editId ? 'Data statistik diperbarui' : 'Data statistik ditambahkan');
      setShowForm(false); fetchList();
    } catch (err: unknown) {
      setFormError((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;
    try {
      await api.delete(`/statistik/${showDeleteId}`);
      toast.success('Data statistik dihapus');
      setShowDeleteId(null); fetchList();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus');
      setShowDeleteId(null);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/statistik/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportResult(res.data); fetchList();
      toast.success(`Import selesai: ${res.data.berhasil} berhasil`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal import');
    } finally { setImporting(false); e.target.value = ''; }
  };

  const handleExport = async () => {
    const res = await api.get('/statistik/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a'); a.href = url;
    a.download = `statistik_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await api.get('/template/statistik', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url;
      a.download = 'template_statistik.xlsx';
      a.click(); URL.revokeObjectURL(url);
      toast.success('Template berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh template');
    }
  };

  return (
    <AdminLayout title="Manajemen Statistik">
      <div className="admin-page">
        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="flex gap-2 flex-wrap">
            <label className={cn('cursor-pointer text-sm px-3 py-2 rounded-xl font-medium flex items-center gap-1.5', importing ? 'opacity-60 pointer-events-none bg-neutral-100 text-neutral-500' : 'bg-success-50 hover:bg-success-500/10 text-success-600 border border-success-500/20')}>
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
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={filterTahun} onChange={e => { setFilterTahun(e.target.value); setPage(1); }} containerClassName="w-32">
              <option value="">Semua Tahun</option>
              {tahunList.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select value={filterIdkec} onChange={e => { setFilterIdkec(e.target.value); setPage(1); }} containerClassName="w-40">
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
            </Select>
            <Button onClick={openAdd}>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="plus" className="h-4 w-4" />
                <span>Tambah</span>
              </span>
            </Button>
          </div>
        </div>

        {/* Import result */}
        {importResult && (
          <div className={cn('p-3 rounded-xl text-sm', importResult.gagal > 0 ? 'bg-warning-50 border border-warning-500/20' : 'bg-success-50 border border-success-500/20')}>
            ✅ Berhasil: <b>{importResult.berhasil}</b> | ❌ Gagal: <b>{importResult.gagal}</b>
            <button type="button" onClick={() => setImportResult(null)} className="ml-3 text-xs hover:underline">Tutup</button>
          </div>
        )}

        {/* Tabel */}
        <div className="admin-panel">
          <div className="px-4 py-2.5 border-b border-neutral-100 text-xs text-neutral-500 flex justify-between">
            <span>{total.toLocaleString('id-ID')} data</span>
            <span>Hal. {page}/{totalPages || 1}</span>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10" />)}</div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-neutral-600">Belum ada data statistik</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[580px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Judul</th>
                    <th>Wilayah</th>
                    <th className="text-right">Nilai</th>
                    <th>Satuan</th>
                    <th className="text-center">Tahun</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="text-neutral-400 text-xs">{(page - 1) * ADMIN_PAGE_SIZE + idx + 1}</td>
                      <td className="font-medium text-neutral-900 max-w-[220px]">
                        <span className="truncate block">{item.indikator}</span>
                      </td>
                      <td className="text-xs font-mono text-neutral-500">{item.iddesa ?? item.idkec ?? item.idkab}</td>
                      <td className="text-right font-mono font-semibold text-neutral-900">{item.nilai.toLocaleString('id-ID')}</td>
                      <td className="text-xs text-neutral-500">{item.satuan ?? '—'}</td>
                      <td className="text-center"><Badge variant="primary">{item.tahun}</Badge></td>
                      <td>
                        <div className="flex justify-center items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit">
                            <Icon name="pencil" className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowDeleteId(item.id)} aria-label="Hapus" className="text-danger-500 hover:bg-danger-50">
                            <Icon name="trash" className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-neutral-100 flex justify-center items-center gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              <span className="text-xs text-neutral-500 px-2">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          )}
        </div>

        {/* Modal Form */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Data Statistik' : 'Tambah Data Statistik'} size="md"
          footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button><Button type="submit" form="stat-form" isLoading={saving}>Simpan</Button></>}>
          <form id="stat-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <Input
                label="Judul Statistik"
                required
                value={form.indikator}
                onChange={e => setForm(f => ({ ...f, indikator: e.target.value }))}
                placeholder="Contoh: Jumlah Penduduk"
                list="judul-statistik-list"
              />
              <datalist id="judul-statistik-list">
                {judulList.map(judul => <option key={judul} value={judul} />)}
              </datalist>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SARAN_JUDUL_STATISTIK.slice(0, 5).map(judul => (
                  <button
                    key={judul}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, indikator: judul }))}
                    className="rounded-full border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
                  >
                    {judul}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nilai" required type="number" step="any" value={form.nilai} onChange={e => setForm(f => ({ ...f, nilai: parseFloat(e.target.value) || '' }))} placeholder="0" />
              <Input label="Satuan" value={form.satuan} onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))} placeholder="jiwa, km², dll" />
            </div>
            <Input label="Tahun" required type="number" value={form.tahun} onChange={e => setForm(f => ({ ...f, tahun: parseInt(e.target.value) || new Date().getFullYear() }))} />
            <div>
              <p className="text-xs font-medium text-neutral-600 mb-2">Wilayah <span className="text-neutral-400 font-normal">(korong disarankan untuk agregasi)</span></p>
              <div className="grid grid-cols-3 gap-2">
                <Select value={form.idkec} onChange={e => setForm(f => ({ ...f, idkec: e.target.value, iddesa: '', idsls: '' }))}>
                  <option value="">Kecamatan</option>
                  {kecamatanList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
                </Select>
                <Select value={form.iddesa} onChange={e => setForm(f => ({ ...f, iddesa: e.target.value, idsls: '' }))} disabled={!form.idkec}>
                  <option value="">Nagari</option>
                  {nagariList.map(n => <option key={n.kode} value={n.kode}>{n.nama}</option>)}
                </Select>
                <Select value={form.idsls} onChange={e => setForm(f => ({ ...f, idsls: e.target.value }))} disabled={!form.iddesa}>
                  <option value="">Korong</option>
                  {korongList.map(k => <option key={k.kode} value={k.kode}>{k.nama}</option>)}
                </Select>
              </div>
            </div>
            {formError && <div role="alert" className="text-xs text-danger-600 bg-danger-50 border border-danger-500/20 rounded-xl px-3 py-2">{formError}</div>}
          </form>
        </Modal>

        <Modal isOpen={showDeleteId !== null} onClose={() => setShowDeleteId(null)} title="Hapus Data" size="sm"
          footer={<><Button variant="secondary" onClick={() => setShowDeleteId(null)}>Batal</Button><Button variant="danger" onClick={confirmDelete}>Hapus</Button></>}>
          <p className="text-sm text-neutral-600">Apakah Anda yakin ingin menghapus data statistik ini?</p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
