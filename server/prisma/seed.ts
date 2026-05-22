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
  // idkab=1306, idkec=7 digit (1306xxx), iddesa=10 digit
  const statistikContoh = [
    { idkab: '1306', idkec: '1306010', iddesa: null, idsls: null, indikator: 'Jumlah Penduduk', nilai: 45230, satuan: 'jiwa', tahun: 2024 },
    { idkab: '1306', idkec: '1306020', iddesa: null, idsls: null, indikator: 'Jumlah Penduduk', nilai: 38120, satuan: 'jiwa', tahun: 2024 },
    { idkab: '1306', idkec: '1306030', iddesa: null, idsls: null, indikator: 'Jumlah Penduduk', nilai: 29870, satuan: 'jiwa', tahun: 2024 },
    { idkab: '1306', idkec: '1306010', iddesa: null, idsls: null, indikator: 'Luas Wilayah', nilai: 42.5, satuan: 'km²', tahun: 2024 },
    { idkab: '1306', idkec: '1306020', iddesa: null, idsls: null, indikator: 'Luas Wilayah', nilai: 55.3, satuan: 'km²', tahun: 2024 },
    { idkab: '1306', idkec: '1306030', iddesa: null, idsls: null, indikator: 'Luas Wilayah', nilai: 38.8, satuan: 'km²', tahun: 2024 },
  ];

  for (const stat of statistikContoh) {
    await prisma.statistik.create({ data: stat });
  }
  console.log('✓ Data statistik contoh selesai');

  // Seed data infrastruktur contoh
  // Menggunakan idkec 7 digit dan iddesa 10 digit sesuai format GeoJSON BPS
  const infraContoh = [
    { nama: 'Rumah Makan Sari Raso',    kategori: 'restoran',     alamat: 'Jl. Raya Batang Anai No. 5',  lat: -0.5320, lng: 100.1050, idkab: '1306', idkec: '1306010', iddesa: '1306010001' },
    { nama: 'Masjid Raya Batang Anai',  kategori: 'rumah_ibadah', alamat: 'Jl. Masjid No. 1, Batang Anai', lat: -0.5350, lng: 100.1100, idkab: '1306', idkec: '1306010', iddesa: '1306010001' },
    { nama: 'Pasar Batang Anai',        kategori: 'pasar',        alamat: 'Jl. Pasar Raya, Batang Anai',  lat: -0.5380, lng: 100.1120, idkab: '1306', idkec: '1306010', iddesa: '1306010002' },
    { nama: 'Puskesmas Batang Anai',    kategori: 'kesehatan',    alamat: 'Jl. Kesehatan No. 3',          lat: -0.5400, lng: 100.1150, idkab: '1306', idkec: '1306010', iddesa: '1306010002' },
    { nama: 'Toko Bangunan Maju Jaya',  kategori: 'toko',         alamat: 'Jl. Industri No. 7',           lat: -0.5600, lng: 100.1300, idkab: '1306', idkec: '1306020', iddesa: '1306020001' },
    { nama: 'Masjid Al-Ikhlas',         kategori: 'rumah_ibadah', alamat: 'Jl. Masjid Al-Ikhlas',         lat: -0.5620, lng: 100.1320, idkab: '1306', idkec: '1306020', iddesa: '1306020001' },
    { nama: 'Warung Makan Padang',      kategori: 'restoran',     alamat: 'Jl. Raya No. 12',              lat: -0.5590, lng: 100.1280, idkab: '1306', idkec: '1306020', iddesa: '1306020002' },
    { nama: 'Klinik Sehat Bersama',     kategori: 'kesehatan',    alamat: 'Jl. Klinik No. 2',             lat: -0.5610, lng: 100.1310, idkab: '1306', idkec: '1306020', iddesa: '1306020002' },
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
