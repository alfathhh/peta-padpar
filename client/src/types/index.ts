// Tipe data utama aplikasi Peta Tematik Padang Pariaman

export interface KategoriInfra {
  id: number;
  value: string;   // slug: "restoran", "rumah_ibadah", dll
  label: string;   // label tampil: "Restoran", "Rumah Ibadah", dll
  icon: string;    // field legacy API; tidak ditampilkan di UI
  color: string;   // hex color: "#FF5733"
  urutan: number;
}

export interface Infrastruktur {
  id: number;
  nama: string;
  kategori: string;
  alamat?: string;
  fotoUrl?: string;
  fotoCropX?: number;
  fotoCropY?: number;
  fotoCropZoom?: number;
  lat: number;
  lng: number;
  idkab: string;
  idkec: string;
  iddesa: string;
  idsls?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistik {
  id: number;
  idkab: string;
  idkec?: string;
  iddesa?: string;
  idsls?: string;
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun: number;
  createdAt: string;
  agregat?: boolean;
  metodeAgregasi?: 'sum' | 'avg';
  jumlahSumber?: number;
  levelSumber?: 'kabupaten' | 'kecamatan' | 'nagari' | 'korong';
}

export interface WilayahOption {
  idkec?: string;
  iddesa?: string;
  idsls?: string;
  nama: string;
}

export interface FilterWilayahState {
  idkab: string;
  idkec?: string;
  iddesa?: string;
  idsls?: string;
}

export interface ImportResult {
  berhasil: number;
  gagal: number;
  errors: Array<{
    baris: number;
    pesan: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}

export interface AdminUser {
  id: number;
  username: string;
}

// Form types
export interface InfrastrukturFormData {
  nama: string;
  kategori: string;
  alamat: string;
  fotoUrl: string;
  fotoCropX: number;
  fotoCropY: number;
  fotoCropZoom: number;
  lat: number | '';
  lng: number | '';
  idkab: string;
  idkec: string;
  iddesa: string;
  idsls: string;
}

export interface StatistikFormData {
  idkab: string;
  idkec: string;
  iddesa: string;
  idsls: string;
  indikator: string;
  nilai: number | '';
  satuan: string;
  tahun: number | '';
}

export interface KategoriFormData {
  value: string;
  label: string;
  icon: string;
  color: string;
  urutan: number | '';
}
