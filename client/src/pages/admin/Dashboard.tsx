import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Icon } from '../../components/ui/Icon';
import { KategoriInfra } from '../../types';
import { resolveKategoriIcon } from '../../lib/categoryIcons';

interface DashboardStats {
  totalInfrastruktur: number;
  totalKategori: number;
  totalStatistik: number;
  perKategori: Array<{
    label: string;
    color: string;
    icon: React.ComponentProps<typeof Icon>['name'];
    count: number;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard - Admin Peta Tematik';

    async function fetchDashboard() {
      try {
        const [infraRes, katRes, statRes] = await Promise.all([
          api.get('/infrastruktur'),
          api.get('/kategori'),
          api.get('/statistik'),
        ]);

        const infraData: { kategori: string }[] = infraRes.data.data ?? infraRes.data;
        const daftarKategori: KategoriInfra[] = katRes.data;
        const dataStatistik: unknown[] = statRes.data.data ?? statRes.data;

        const perKategori = daftarKategori.map((kategori) => ({
          label: kategori.label,
          color: kategori.color,
          icon: resolveKategoriIcon(kategori.icon, kategori.value, kategori.label),
          count: infraData.filter((item) => item.kategori === kategori.value).length,
        }));

        setStats({
          totalInfrastruktur: infraRes.data.total ?? infraData.length,
          totalKategori: daftarKategori.length,
          totalStatistik: statRes.data.total ?? dataStatistik.length,
          perKategori,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const summaryCards = stats ? [
    {
      label: 'Total Infrastruktur',
      value: stats.totalInfrastruktur,
      href: '/admin/infrastruktur',
      icon: 'database' as const,
      color: '#0c84f3',
    },
    {
      label: 'Kategori Aktif',
      value: stats.totalKategori,
      href: '/admin/kategori',
      icon: 'tag' as const,
      color: '#22c55e',
    },
    {
      label: 'Data Statistik',
      value: stats.totalStatistik,
      href: '/admin/statistik',
      icon: 'chart' as const,
      color: '#a855f7',
    },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-5xl space-y-6">
        {loading ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((item) => <Skeleton.Card key={item} />)}
            </div>
            <Skeleton.Card className="h-48" />
          </>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {summaryCards.map((card) => (
                <Link key={card.label} to={card.href}>
                  <Card hoverable className="h-full">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl font-bold text-neutral-900">
                          {card.value.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">{card.label}</p>
                      </div>
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${card.color}12`, color: card.color }}
                      >
                        <Icon name={card.icon} className="h-4 w-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Category Distribution */}
            {stats && stats.perKategori.length > 0 && (
              <Card>
                <Card.Header>
                  <Card.Title>Distribusi per Kategori</Card.Title>
                  <Link to="/admin/infrastruktur" className="text-xs font-medium text-primary-600 hover:text-primary-700">
                    Lihat semua &rarr;
                  </Link>
                </Card.Header>
                <div className="space-y-3">
                  {[...stats.perKategori].sort((a, b) => b.count - a.count).map((kategori) => {
                    const pct = stats.totalInfrastruktur > 0
                      ? Math.round((kategori.count / stats.totalInfrastruktur) * 100)
                      : 0;

                    return (
                      <div key={kategori.label}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-neutral-700 font-medium">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-md"
                              style={{ backgroundColor: `${kategori.color}12`, color: kategori.color }}
                            >
                              <Icon name={kategori.icon} className="h-3.5 w-3.5" />
                            </span>
                            <span className="truncate">{kategori.label}</span>
                          </span>
                          <span className="text-xs text-neutral-500 font-mono tabular-nums">
                            {kategori.count} <span className="text-neutral-400">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: kategori.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <Card.Header>
                <Card.Title>Aksi Cepat</Card.Title>
              </Card.Header>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  { href: '/admin/infrastruktur', label: 'Kelola Infrastruktur', icon: 'database' as const, color: '#0c84f3' },
                  { href: '/admin/statistik', label: 'Kelola Statistik', icon: 'chart' as const, color: '#a855f7' },
                  { href: '/admin/kategori', label: 'Kelola Kategori', icon: 'tag' as const, color: '#22c55e' },
                ].map((aksi) => (
                  <Link
                    key={aksi.href}
                    to={aksi.href}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                      style={{ backgroundColor: `${aksi.color}10`, color: aksi.color }}
                    >
                      <Icon name={aksi.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-neutral-700">{aksi.label}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
