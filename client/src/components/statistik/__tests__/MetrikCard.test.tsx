import { render, screen } from '@testing-library/react';
import MetrikCard from '../MetrikCard';

/**
 * Unit tests untuk MetrikCard
 * Validates: Requirements 5.2, 5.3, 5.4, 5.6
 */
describe('MetrikCard', () => {
  // Requirement 5.6: Angka nilai statistik harus diformat menggunakan toLocaleString('id-ID')
  describe('format angka Indonesia', () => {
    it('memformat nilai besar dengan pemisah ribuan titik (id-ID)', () => {
      render(<MetrikCard indikator="Jumlah Penduduk" nilai={1234567} tahun={2023} />);

      // Format id-ID menggunakan titik sebagai pemisah ribuan
      // 1.234.567
      const nilaiEl = screen.getByText(/1\.234\.567/);
      expect(nilaiEl).toBeInTheDocument();
    });

    it('memformat nilai ribuan dengan satu titik pemisah', () => {
      render(<MetrikCard indikator="Jumlah Sekolah" nilai={1500} tahun={2023} />);

      const nilaiEl = screen.getByText(/1\.500/);
      expect(nilaiEl).toBeInTheDocument();
    });

    it('menampilkan nilai di bawah 1000 tanpa pemisah', () => {
      render(<MetrikCard indikator="Jumlah Puskesmas" nilai={42} tahun={2023} />);

      const nilaiEl = screen.getByText(/42/);
      expect(nilaiEl).toBeInTheDocument();
    });
  });

  // Requirement 5.3: Label indikator di MetrikCard harus menggunakan style yang benar
  // Requirement 5.4: MetrikCard harus menggunakan container yang benar
  describe('satuan opsional', () => {
    it('menampilkan satuan jika prop satuan diberikan', () => {
      render(<MetrikCard indikator="Luas Wilayah" nilai={1347} satuan="km²" tahun={2023} />);

      const satuanEl = screen.getByText('km²');
      expect(satuanEl).toBeInTheDocument();
    });

    it('tidak menampilkan satuan jika prop satuan tidak diberikan', () => {
      render(<MetrikCard indikator="Jumlah Penduduk" nilai={500000} tahun={2023} />);

      // Tidak ada elemen dengan teks satuan apapun selain angka dan tahun
      // Pastikan tidak ada span satuan yang muncul
      const container = screen.getByText(/500\.000/).closest('p');
      expect(container).toBeInTheDocument();
      // Span satuan tidak boleh ada
      const spans = container?.querySelectorAll('span');
      expect(spans?.length).toBe(0);
    });

    it('tidak menampilkan satuan jika prop satuan adalah string kosong', () => {
      render(<MetrikCard indikator="Jumlah Penduduk" nilai={500000} satuan="" tahun={2023} />);

      const container = screen.getByText(/500\.000/).closest('p');
      const spans = container?.querySelectorAll('span');
      expect(spans?.length).toBe(0);
    });
  });

  // Requirement 5.2: Setiap indikator statistik ditampilkan dalam MetrikCard
  describe('tampilan tahun', () => {
    it('menampilkan tahun dengan prefix "Tahun"', () => {
      render(<MetrikCard indikator="Jumlah Penduduk" nilai={100000} tahun={2023} />);

      const tahunEl = screen.getByText('Tahun 2023');
      expect(tahunEl).toBeInTheDocument();
    });

    it('menampilkan tahun yang berbeda dengan prefix "Tahun"', () => {
      render(<MetrikCard indikator="Jumlah Penduduk" nilai={100000} tahun={2020} />);

      const tahunEl = screen.getByText('Tahun 2020');
      expect(tahunEl).toBeInTheDocument();
    });
  });

  describe('tampilan indikator', () => {
    it('menampilkan label indikator', () => {
      render(<MetrikCard indikator="Jumlah Kecamatan" nilai={17} tahun={2023} />);

      const indikatorEl = screen.getByText('Jumlah Kecamatan');
      expect(indikatorEl).toBeInTheDocument();
    });
  });
});
