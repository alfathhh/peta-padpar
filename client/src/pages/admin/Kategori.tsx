import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { KategoriInfra, KategoriFormData } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Icon } from '../../components/ui/Icon';
import { KATEGORI_ICON_OPTIONS, resolveKategoriIcon } from '../../lib/categoryIcons';

const WARNA_PRESETS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
];

const EMPTY_FORM: KategoriFormData = {
  value: '',
  label: '',
  icon: 'layers',
  color: WARNA_PRESETS[0],
  urutan: '',
};

export default function AdminKategori() {
  useEffect(() => {
    document.title = 'Kategori - Admin Peta Tematik';
  }, []);

  const [list, setList] = useState<KategoriInfra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<KategoriFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const { toast } = useToast();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/kategori');
      setList(response.data);
    } catch {
      toast.error('Daftar kategori belum bisa dimuat');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (kategori: KategoriInfra) => {
    setForm({
      value: kategori.value,
      label: kategori.label,
      icon: resolveKategoriIcon(kategori.icon, kategori.value, kategori.label),
      color: kategori.color,
      urutan: kategori.urutan,
    });
    setEditId(kategori.id);
    setFormError('');
    setShowForm(true);
  };

  const handleLabelChange = (label: string) => {
    setForm((current) => {
      const slugOtomatis = label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const shouldSyncValue = current.value === '' || current.value === current.label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      return {
        ...current,
        label,
        value: shouldSyncValue ? slugOtomatis : current.value,
      };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.label || !form.value) {
      setFormError('Label dan value wajib diisi');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const payload = {
        ...form,
        urutan: Number(form.urutan) || 0,
      };

      if (editId) {
        await api.put(`/kategori/${editId}`, payload);
      } else {
        await api.post('/kategori', payload);
      }

      toast.success(editId ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
      setShowForm(false);
      fetchList();
    } catch (error: unknown) {
      setFormError(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan kategori',
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;

    try {
      await api.delete(`/kategori/${showDeleteId}`);
      toast.success('Kategori berhasil dihapus');
      setShowDeleteId(null);
      fetchList();
    } catch (error: unknown) {
      toast.error(
        (error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus kategori',
      );
      setShowDeleteId(null);
    }
  };

  return (
    <AdminLayout title="Manajemen Kategori">
      <div className="max-w-4xl space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={openAdd}>
            <span className="inline-flex items-center gap-2">
              <Icon name="plus" className="h-4 w-4" />
              <span>Tambah Kategori</span>
            </span>
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-soft">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Daftar kategori</p>
              <p className="text-xs text-neutral-500">Ikon, warna, dan urutan akan dipakai seragam di client dan admin.</p>
            </div>
            <Badge variant="neutral">{list.length} kategori</Badge>
          </div>

          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-14 w-full" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-neutral-600">Belum ada kategori</p>
              <p className="mt-1 text-xs text-neutral-400">Klik tombol tambah untuk mulai mengatur kategori infrastruktur.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[620px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Kategori</th>
                    <th>Value</th>
                    <th className="text-center">Urutan</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((kategori, index) => (
                    <tr key={kategori.id}>
                      <td className="text-xs text-neutral-400">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200/70"
                            style={{ backgroundColor: `${kategori.color}14`, color: kategori.color }}
                          >
                            <Icon name={resolveKategoriIcon(kategori.icon, kategori.value, kategori.label)} className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium text-neutral-900">{kategori.label}</div>
                            <div className="text-xs text-neutral-500">Dipakai di marker, filter, popup, dan admin.</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">{kategori.value}</Badge>
                      </td>
                      <td className="text-center text-xs text-neutral-500">{kategori.urutan}</td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(kategori)} aria-label="Edit kategori">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="pencil" className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteId(kategori.id)}
                            aria-label="Hapus kategori"
                            className="text-danger-500 hover:bg-danger-50"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="trash" className="h-3.5 w-3.5" />
                              <span>Hapus</span>
                            </span>
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
        </div>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editId ? 'Edit Kategori' : 'Tambah Kategori'}
          description="Atur nama, ikon, warna, dan urutan kategori agar tampilan peta publik dan admin selalu sinkron."
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
              <Button type="submit" form="kat-form" isLoading={saving}>Simpan</Button>
            </>
          }
        >
          <form id="kat-form" onSubmit={handleSave} className="space-y-4">
            <Input
              label="Label"
              required
              value={form.label}
              onChange={(event) => handleLabelChange(event.target.value)}
              placeholder="Contoh: Jalan Raya"
            />

            <Input
              label="Value (slug)"
              required
              value={form.value}
              onChange={(event) => setForm((current) => ({
                ...current,
                value: event.target.value.toLowerCase().replace(/\s+/g, '-'),
              }))}
              placeholder="contoh: jalan-raya"
            />

            <div className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3">
              <div className="min-w-0">
                <label className="block text-xs font-medium text-neutral-700">Ikon kategori</label>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Pilihan ini langsung dipakai di filter, marker peta, popup, dan tabel admin.
                </p>
              </div>
              <div
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm"
                style={{ color: form.color, backgroundColor: `${form.color}16` }}
              >
                <Icon name={resolveKategoriIcon(form.icon, form.value, form.label)} className="h-5 w-5" />
              </div>
              <div className="col-span-2 grid grid-cols-4 gap-2">
                {KATEGORI_ICON_OPTIONS.map((opsi) => {
                  const aktif = form.icon === opsi.value;

                  return (
                    <button
                      key={opsi.value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, icon: opsi.value }))}
                      className={aktif
                        ? 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-primary-300 bg-primary-50 px-2 py-2 text-center text-primary-700 shadow-sm transition-all'
                        : 'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-200 bg-white px-2 py-2 text-center text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-50'}
                      aria-pressed={aktif}
                    >
                      <Icon name={opsi.value} className="h-4 w-4" />
                      <span className="text-[11px] font-medium leading-none">{opsi.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-700">
                <Icon name="palette" className="h-4 w-4 text-neutral-500" />
                <label>Warna</label>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="flex flex-wrap gap-2">
                  {WARNA_PRESETS.map((warna) => (
                    <button
                      key={warna}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, color: warna }))}
                      className="h-7 w-7 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: warna,
                        borderColor: form.color === warna ? '#1e293b' : 'transparent',
                        outline: form.color === warna ? `2px solid ${warna}` : 'none',
                        outlineOffset: '2px',
                      }}
                      aria-label={warna}
                    />
                  ))}
                </div>

                <div
                  className="inline-flex h-10 min-w-20 items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700"
                  style={{ color: form.color }}
                >
                  {form.color.toUpperCase()}
                </div>
              </div>

              <Input
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                placeholder="#3B82F6"
              />
            </div>

            <Input
              label="Urutan"
              type="number"
              value={form.urutan}
              onChange={(event) => setForm((current) => ({ ...current, urutan: parseInt(event.target.value, 10) || '' }))}
              placeholder="0"
            />

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
          title="Hapus Kategori"
          description="Aksi ini hanya tersedia jika kategori belum dipakai oleh data infrastruktur."
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteId(null)}>Batal</Button>
              <Button variant="danger" onClick={confirmDelete}>
                <span className="inline-flex items-center gap-2">
                  <Icon name="trash" className="h-4 w-4" />
                  <span>Hapus</span>
                </span>
              </Button>
            </>
          }
        >
          <p className="text-sm text-neutral-600">
            Apakah Anda yakin ingin menghapus kategori ini? Kategori yang masih dipakai oleh data infrastruktur tidak dapat dihapus.
          </p>
        </Modal>
      </div>
    </AdminLayout>
  );
}
