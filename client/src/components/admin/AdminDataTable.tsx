import React, { useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Pencil, Trash2, MapPin } from 'lucide-react';
import { Infrastruktur, KategoriInfra } from '../../types';
import { ADMIN_PAGE_SIZE } from '../../constants';
import { CategoryBadge } from './CategoryBadge';

/**
 * AdminDataTable — tabel data infrastruktur berbasis TanStack Table v8.
 *
 * Fitur:
 * - Kolom: nomor, nama, kategori (badge), kecamatan, koordinat, aksi
 * - Aksi (Edit/Hapus) tersembunyi secara default, muncul saat hover baris (group-hover)
 * - Badge kategori dengan ikon Lucide 14px dan warna semantik dari KATEGORI_BADGE_CLASS
 * - Pagination server-side (20 baris per halaman)
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 9.6
 */

export interface AdminDataTableProps {
  data: Infrastruktur[];
  kategoriList: KategoriInfra[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onEdit: (item: Infrastruktur) => void;
  onDelete: (id: number) => void;
  onPageChange: (page: number) => void;
}

const columnHelper = createColumnHelper<Infrastruktur>();

export function AdminDataTable({
  data,
  kategoriList,
  loading,
  total,
  page,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
}: AdminDataTableProps) {
  // Build kategori lookup map for O(1) access
  const kategoriMap = useMemo(
    () => new Map(kategoriList.map(k => [k.value, k])),
    [kategoriList]
  );

  const columns = useMemo(
    () => [
      // Kolom nomor urut (server-side offset)
      columnHelper.display({
        id: 'nomor',
        header: '#',
        cell: ({ row }) => (
          <span className="text-slate-400 text-xs tabular-nums">
            {(page - 1) * ADMIN_PAGE_SIZE + row.index + 1}
          </span>
        ),
      }),

      // Kolom nama
      columnHelper.accessor('nama', {
        header: 'Nama',
        cell: info => (
          <span className="font-medium text-slate-900 truncate block max-w-[200px]">
            {info.getValue()}
          </span>
        ),
      }),

      // Kolom kategori — badge dengan ikon Lucide 14px dan warna semantik
      columnHelper.accessor('kategori', {
        header: 'Kategori',
        cell: info => {
          const value = info.getValue();
          const kat = kategoriMap.get(value);
          if (!kat) {
            return (
              <span className="text-slate-400 text-xs">{value}</span>
            );
          }
          return <CategoryBadge categoryValue={value} kategori={kat} />;
        },
      }),

      // Kolom kecamatan
      columnHelper.accessor('idkec', {
        header: 'Kecamatan',
        cell: info => (
          <span className="text-slate-500 text-xs font-mono">{info.getValue()}</span>
        ),
      }),

      // Kolom koordinat
      columnHelper.display({
        id: 'koordinat',
        header: 'Koordinat',
        cell: ({ row }) => (
          <span className="text-slate-400 text-xs font-mono">
            {row.original.lat.toFixed(4)}, {row.original.lng.toFixed(4)}
          </span>
        ),
      }),

      // Kolom aksi — tersembunyi default, muncul saat hover (group-hover)
      columnHelper.display({
        id: 'aksi',
        header: '',
        cell: ({ row }) => (
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          >
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              aria-label={`Edit ${row.original.nama}`}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Pencil size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(row.original.id)}
              aria-label={`Hapus ${row.original.nama}`}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, kategoriMap, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Pagination dikelola server-side; TanStack Table hanya merender data yang diterima
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/60 overflow-hidden">
      {/* Info baris */}
      <div className="px-4 py-2.5 border-b border-neutral-100 text-xs text-slate-500 flex justify-between">
        <span>{total.toLocaleString('id-ID')} data</span>
        <span>Hal. {page}/{totalPages || 1}</span>
      </div>

      {/* Konten tabel */}
      {loading ? (
        /* Skeleton loading */
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        /* Empty state */
        <div className="py-16 text-center">
          <MapPin size={40} className="mx-auto mb-3 text-slate-200" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">Belum ada data infrastruktur</p>
          <p className="text-xs text-slate-400 mt-1">Klik "Tambah" untuk menambahkan data pertama</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full border-collapse">
            {/* Header */}
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="bg-slate-50/80 backdrop-blur border-y border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4 text-left"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Body */}
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="group border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="py-4 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-100 flex justify-center items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-xs text-slate-500 px-2 tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminDataTable;
