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
import { cn } from '../../lib/cn';

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
  useEffect(() => { document.title = 'Kategori - Admin Peta Tematik'; }, []);

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

  useEffect(() => { fetchList(); }, [fetchList]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setFormError(''); setShowForm(true); };
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
      const slug = label.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const shouldSync = current.value === '' || current.value === current.label.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return { ...current, label, value: shouldSync ? slug : current.value };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.label || !form.value) { setFormError('Label dan value wajib diisi'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = { ...form, urutan: Number(form.urutan) || 0 };
      if (editId) await api.put(`/kategori/${editId}`, payload);
      else await api.post('/kategori', payload);
      toast.success(editId ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
      setShowForm(false); fetchList();
    } catch (error: unknown) {
      setFormError((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!showDeleteId) return;
    try {
      await api.delete(`/kategori/${showDeleteId}`);
      toast.success('Kategori berhasil dihapus');
      setShowDeleteId(null); fetchList();
    } catch (error: unknown) {
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Gagal menghapus');
      setShowDeleteId(null);
    }
  };

  return (
    <AdminLayout title="Kategori">
      <div className="max-w-4xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-500">{list.length} kategori terdaftar</p>
          </div>
          <Button onClick={openAdd} size="sm">
            <Icon name="plus" className="h-3.5 w-3.5" />
            <span>Tambah</span>
          </Button>
        </div>

        {/* Table */}
        <div className="admin-panel">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-12 w-full" />)}
            </div>
          ) : list.length === 0 ? (
            <div className="py-16 text-center">
              <Icon name="tag" className="h-8 w-8 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-600">Belum ada kategori</p>
              <p className="text-xs text-neutral-400 mt-1">Tambahkan kategori infrastruktur pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[580px]">
                <thead>
                  <tr>
                    <th className="w-8">#</th>
                    <th>Kategori</th>
                    <th>Slug</th>
                    <th className="text-center">Urutan</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((kategori, index) => (
                    <tr key={kategori.id}>
                      <td className="text-xs text-neutral-400">{index + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
                            style={{ backgroundColor: `${kategori.color}12`, color: kategori.color }}
                          >
                            <Icon name={resolveKategoriIcon(kategori.icon, kategori.value, kategori.label)} className="h-4 w-4" />
                          </span>
                          <span className="font-medium text-neutral-900">{kategori.label}</span>
                        </div>
                      </td>
                      <td>
                        <code className="text-xs text-neutral-500 bg-neutral-50 px-1.5 py-0.5 rounded">{kategori.value}</code>
                      </td>
                      <td className="text-center text-xs text-neutral-500">{kategori.urutan}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(kategori)} aria-label="Edit">
                            <Icon name="pencil" className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowDeleteId(kategori.id)} aria-label="Hapus" className="text-danger-500 hover:bg-danger-50">
                            <Icon name="trash" className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title={editId ? 'Edit Kategori' : 'Tambah Kategori'}
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
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Contoh: Jalan Raya"
            />
            <Input
              label="Slug (value)"
              required
              value={form.value}
              onChange={(e) => setForm(f => ({ ...f, value: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              placeholder="contoh: jalan-raya"
              className="font-mono"
            />

            {/* Icon picker */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Ikon</label>
              <div className="grid grid-cols-5 gap-1.5">
                {KATEGORI_ICON_OPTIONS.map((opsi) => {
                  const aktif = form.icon === opsi.value;
                  return (
                    <button
                      key={opsi.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon: opsi.value }))}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all',
                        aktif
                          ? 'border-primary-300 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50',
                      )}
                    >
                      <Icon name={opsi.value} className="h-4 w-4" />
                      <span className="text-[10px] font-medium leading-tight">{opsi.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Warna</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {WARNA_PRESETS.map((warna) => (
                  <button
                    key={warna}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: warna }))}
                    className={cn(
                      'h-7 w-7 rounded-md border-2 transition-all',
                      form.color === warna ? 'border-neutral-900 scale-110' : 'border-transparent hover:scale-105',
                    )}
                    style={{ backgroundColor: warna }}
                    aria-label={warna}
                  />
                ))}
              </div>
              <Input
                value={form.color}
                onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                placeholder="#3B82F6"
                className="font-mono"
              />
            </div>

            <Input
              label="Urutan"
              type="number"
              value={form.urutan}
              onChange={(e) => setForm(f => ({ ...f, urutan: parseInt(e.target.value, 10) || '' }))}
              placeholder="0"
            />

            {formError && (
              <div className="rounded-lg bg-danger-50 border border-danger-100 px-3 py-2 text-xs text-danger-700">
                {formError}
              </div>
            )}
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteId !== null}
          onClose={() => setShowDeleteId(null)}
          title="Hapus Kategori"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteId(null)}>Batal</Button>
              <Button variant="danger" onClick={confirmDelete}>Hapus</Button>
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
