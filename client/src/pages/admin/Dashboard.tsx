import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, FolderKanban, MapPin, Tags } from 'lucide-react';
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
      bg: 'bg-primary-50',
      color: 'text-primary-700',
      icon: 'database' as const,
    },
    {
      label: 'Kategori Aktif',
      value: stats.totalKategori,
      href: '/admin/kategori',
      bg: 'bg-success-50',
      color: 'text-success-600',
      icon: 'tag' as const,
    },
    {
      label: 'Data Statistik',
      value: stats.totalStatistik,
      href: '/admin/statistik',
      bg: 'bg-accent-50',
      color: 'text-accent-700',
      icon: 'chart' as const,
    },
  ] : [];

  const quickActions = [
    {
      href: '/admin/infrastruktur',
      label: 'Kelola Infrastruktur',
      icon: MapPin,
      className: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
    },
    {
      href: '/admin/statistik',
      label: 'Kelola Statistik',
      icon: BarChart3,
      className: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
    {
      href: '/admin/kategori',
      label: 'Kelola Kategori',
      icon: FolderKanban,
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-5xl space-y-6">
        {loading ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => <Skeleton.Card key={item} />)}
            </div>
            <Skeleton.Card className="h-48" />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {summaryCards.map((card) => (
                <Link key={card.label} to={card.href}>
                  <Card hoverable className="h-full cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-2xl font-bold text-neutral-900">
                          {card.value.toLocaleString('id-ID')}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-neutral-500">{card.label}</p>
                      </div>
                      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${card.bg}`}>
                        <Icon name={card.icon} className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {stats && stats.perKategori.length > 0 && (
              <Card className="rounded-xl">
                <Card.Header>
                  <Card.Title>Distribusi Infrastruktur per Kategori</Card.Title>
                  <Link to="/admin/infrastruktur" className="text-xs font-medium text-primary-600 hover:underline">
                    Lihat semua
                  </Link>
                </Card.Header>
                <div className="space-y-3">
                  {[...stats.perKategori].sort((a, b) => b.count - a.count).map((kategori) => {
                    const persentase = stats.totalInfrastruktur > 0
                      ? Math.round((kategori.count / stats.totalInfrastruktur) * 100)
                      : 0;

                    return (
                      <div key={kategori.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="inline-flex min-w-0 items-center gap-2 font-medium text-neutral-700">
                            <span
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
                              style={{ backgroundColor: `${kategori.color}18`, color: kategori.color }}
                            >
                              <Icon name={kategori.icon} className="h-4 w-4" />
                            </span>
                            <span className="truncate">{kategori.label}</span>
                          </span>
                          <span className="shrink-0 text-xs font-mono text-neutral-500">
                            {kategori.count} <span className="text-neutral-400">({persentase}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${persentase}%`, backgroundColor: kategori.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card>
              <Card.Header>
                <Card.Title>Aksi Cepat</Card.Title>
              </Card.Header>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    href: '/admin/infrastruktur',
                    label: 'Kelola Infrastruktur',
                    bg: 'bg-primary-50 hover:bg-primary-100',
                    text: 'text-primary-700',
                    icon: 'database' as const,
                  },
                  {
                    href: '/admin/statistik',
                    label: 'Kelola Statistik',
                    bg: 'bg-accent-50 hover:bg-accent-100',
                    text: 'text-accent-700',
                    icon: 'chart' as const,
                  },
                  {
                    href: '/admin/kategori',
                    label: 'Kelola Kategori',
                    bg: 'bg-success-50 hover:bg-success-100',
                    text: 'text-success-600',
                    icon: 'tag' as const,
                  },
                ].map((aksi) => (
                  <Link
                    key={aksi.href}
                    to={aksi.href}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-colors ${aksi.bg}`}
                  >
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80 ${aksi.text}`}>
                      <Icon name={aksi.icon} className="h-5 w-5" />
                    </span>
                    <span className={`text-xs font-medium ${aksi.text}`}>{aksi.label}</span>
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
