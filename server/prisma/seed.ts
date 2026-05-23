import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai seed data...');

  // Seed admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { passwordHash },
    create: { username: 'admin', passwordHash },
  });
  console.log('✓ Admin user selesai');

  // Seed kategori infrastruktur awal
  const kategoriAwal = [
    { value: 'restoran',     label: 'Restoran',     icon: 'utensils',        color: '#FF5733', urutan: 1 },
    { value: 'rumah_ibadah', label: 'Rumah Ibadah', icon: 'mosque',          color: '#3D9970', urutan: 2 },
    { value: 'pasar',        label: 'Pasar',        icon: 'shopping_basket', color: '#FF851B', urutan: 3 },
    { value: 'toko',         label: 'Toko',         icon: 'store',           color: '#0074D9', urutan: 4 },
    { value: 'kesehatan',    label: 'Kesehatan',    icon: 'heart_pulse',     color: '#E74C3C', urutan: 5 },
    { value: 'lainnya',      label: 'Lainnya',      icon: 'map_pin',         color: '#7F8C8D', urutan: 6 },
  ];

  for (const kat of kategoriAwal) {
    await prisma.kategoriInfra.upsert({
      where: { value: kat.value },
      update: kat,
      create: kat,
    });
  }
  console.log('✓ Kategori infrastruktur selesai');

  // Seed data statistik contoh
  // Kode wilayah BPS: kdkab=1306, kdkec=6 digit (130601...), kddesa=10 digit
  const statistikContoh = [
    { kdkab: '1306', kdkec: '130601', kddesa: null, kdsls: null, indikator: 'Jumlah Penduduk', nilai: 45230, satuan: 'jiwa', tahun: 2024 },
    { kdkab: '1306', kdkec: '130602', kddesa: null, kdsls: null, indikator: 'Jumlah Penduduk', nilai: 38120, satuan: 'jiwa', tahun: 2024 },
    { kdkab: '1306', kdkec: '130603', kddesa: null, kdsls: null, indikator: 'Jumlah Penduduk', nilai: 29870, satuan: 'jiwa', tahun: 2024 },
    { kdkab: '1306', kdkec: '130601', kddesa: null, kdsls: null, indikator: 'Luas Wilayah',    nilai: 42.5,  satuan: 'km²', tahun: 2024 },
    { kdkab: '1306', kdkec: '130602', kddesa: null, kdsls: null, indikator: 'Luas Wilayah',    nilai: 55.3,  satuan: 'km²', tahun: 2024 },
    { kdkab: '1306', kdkec: '130603', kddesa: null, kdsls: null, indikator: 'Luas Wilayah',    nilai: 38.8,  satuan: 'km²', tahun: 2024 },
  ];

  for (const stat of statistikContoh) {
    await prisma.statistik.create({ data: stat });
  }
  console.log('✓ Data statistik contoh selesai');

  // Seed data infrastruktur contoh
  // Kode wilayah BPS: kdkab=1306, kdkec=6 digit, kddesa=10 digit
  const infraContoh = [
    { nama: 'Rumah Makan Sari Raso',   kategori: 'restoran',     alamat: 'Jl. Raya Batang Anai No. 5',    lat: -0.5320, lng: 100.1050, kdkab: '1306', kdkec: '130601', kddesa: '1306010001' },
    { nama: 'Masjid Raya Batang Anai', kategori: 'rumah_ibadah', alamat: 'Jl. Masjid No. 1, Batang Anai', lat: -0.5350, lng: 100.1100, kdkab: '1306', kdkec: '130601', kddesa: '1306010001' },
    { nama: 'Pasar Batang Anai',       kategori: 'pasar',        alamat: 'Jl. Pasar Raya, Batang Anai',   lat: -0.5380, lng: 100.1120, kdkab: '1306', kdkec: '130601', kddesa: '1306010002' },
    { nama: 'Puskesmas Batang Anai',   kategori: 'kesehatan',    alamat: 'Jl. Kesehatan No. 3',           lat: -0.5400, lng: 100.1150, kdkab: '1306', kdkec: '130601', kddesa: '1306010002' },
    { nama: 'Toko Bangunan Maju Jaya', kategori: 'toko',         alamat: 'Jl. Industri No. 7',            lat: -0.5600, lng: 100.1300, kdkab: '1306', kdkec: '130602', kddesa: '1306020001' },
    { nama: 'Masjid Al-Ikhlas',        kategori: 'rumah_ibadah', alamat: 'Jl. Masjid Al-Ikhlas',          lat: -0.5620, lng: 100.1320, kdkab: '1306', kdkec: '130602', kddesa: '1306020001' },
    { nama: 'Warung Makan Padang',     kategori: 'restoran',     alamat: 'Jl. Raya No. 12',               lat: -0.5590, lng: 100.1280, kdkab: '1306', kdkec: '130602', kddesa: '1306020002' },
    { nama: 'Klinik Sehat Bersama',    kategori: 'kesehatan',    alamat: 'Jl. Klinik No. 2',              lat: -0.5610, lng: 100.1310, kdkab: '1306', kdkec: '130602', kddesa: '1306020002' },
  ];

  for (const infra of infraContoh) {
    await prisma.infrastruktur.create({ data: infra });
  }
  console.log('✓ Data infrastruktur contoh selesai');

  console.log('\n✅ Seed selesai!');
  console.log('   Admin login: username=admin, password=admin123');
}

main()
  .catch((e) => { console.error('❌ Seed gagal:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
