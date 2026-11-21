/**
 * DataExcel Pro - Sample Datasets
 * Digunakan untuk demo instan tanpa perlu upload file terlebih dahulu.
 */

const SAMPLE_DATASETS = {
  penjualan: {
    name: "Penjualan Retail Multi-Region (Superstore)",
    description: "Data transaksi penjualan produk, kategori, wilayah, omset, dan profit.",
    sheetName: "Transaksi_2024",
    data: [
      { "ID_Transaksi": "TRX-001", "Tanggal": "2024-01-05", "Wilayah": "Jakarta", "Kategori": "Elektronik", "Subkategori": "Laptop", "Sales": 15000000, "Profit": 2500000, "Kuantitas": 1, "Diskon": 0.05, "Pelanggan": "PT Maju Terus", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-002", "Tanggal": "2024-01-07", "Wilayah": "Surabaya", "Kategori": "Furniture", "Subkategori": "Kursi Kerja", "Sales": 2400000, "Profit": 600000, "Kuantitas": 2, "Diskon": 0.10, "Pelanggan": "CV Bintang Sejahtera", "Metode_Bayar": "Kartu Kredit" },
      { "ID_Transaksi": "TRX-003", "Tanggal": "2024-01-12", "Wilayah": "Bandung", "Kategori": "ATK", "Subkategori": "Kertas & Tinta", "Sales": 850000, "Profit": 220000, "Kuantitas": 5, "Diskon": 0.00, "Pelanggan": "Budi Santoso", "Metode_Bayar": "E-Wallet" },
      { "ID_Transaksi": "TRX-004", "Tanggal": "2024-01-15", "Wilayah": "Medan", "Kategori": "Elektronik", "Subkategori": "Monitor 4K", "Sales": 4800000, "Profit": 950000, "Kuantitas": 1, "Diskon": 0.05, "Pelanggan": "Siti Rahma", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-005", "Tanggal": "2024-01-20", "Wilayah": "Jakarta", "Kategori": "Furniture", "Subkategori": "Meja Rapat", "Sales": 8900000, "Profit": 1800000, "Kuantitas": 1, "Diskon": 0.15, "Pelanggan": "PT Sinar Global", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-006", "Tanggal": "2024-01-22", "Wilayah": "Semarang", "Kategori": "ATK", "Subkategori": "Binder & Ordner", "Sales": 450000, "Profit": 120000, "Kuantitas": 10, "Diskon": 0.00, "Pelanggan": "Toko Buku Berkah", "Metode_Bayar": "Tunai" },
      { "ID_Transaksi": "TRX-007", "Tanggal": "2024-01-25", "Wilayah": "Surabaya", "Kategori": "Elektronik", "Subkategori": "Smartphone", "Sales": 9200000, "Profit": 1400000, "Kuantitas": 2, "Diskon": 0.05, "Pelanggan": "Agus Pratama", "Metode_Bayar": "Kartu Kredit" },
      { "ID_Transaksi": "TRX-008", "Tanggal": "2024-01-28", "Wilayah": "Bali", "Kategori": "Furniture", "Subkategori": "Sofa Tamu", "Sales": 6500000, "Profit": 1100000, "Kuantitas": 1, "Diskon": 0.10, "Pelanggan": "Villa Tirta Indah", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-009", "Tanggal": "2024-02-02", "Wilayah": "Jakarta", "Kategori": "Elektronik", "Subkategori": "Laptop Pro", "Sales": 22000000, "Profit": 3800000, "Kuantitas": 1, "Diskon": 0.00, "Pelanggan": "PT Solusi Digital", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-010", "Tanggal": "2024-02-05", "Wilayah": "Makassar", "Kategori": "ATK", "Subkategori": "Kertas & Tinta", "Sales": 1200000, "Profit": 310000, "Kuantitas": 8, "Diskon": 0.05, "Pelanggan": "Kantor Notaris Irawan", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-011", "Tanggal": "2024-02-10", "Wilayah": "Bandung", "Kategori": "Elektronik", "Subkategori": "Aksesoris", "Sales": 650000, "Profit": 180000, "Kuantitas": 3, "Diskon": 0.00, "Pelanggan": "Dewi Sartika", "Metode_Bayar": "E-Wallet" },
      { "ID_Transaksi": "TRX-012", "Tanggal": "2024-02-14", "Wilayah": "Surabaya", "Kategori": "Furniture", "Subkategori": "Lemari Arsip", "Sales": 3800000, "Profit": 750000, "Kuantitas": 2, "Diskon": 0.10, "Pelanggan": "Klinik Harapan Sehat", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-013", "Tanggal": "2024-02-18", "Wilayah": "Medan", "Kategori": "Elektronik", "Subkategori": "Smartphone", "Sales": 4600000, "Profit": 700000, "Kuantitas": 1, "Diskon": 0.00, "Pelanggan": "Ferry Salim", "Metode_Bayar": "E-Wallet" },
      { "ID_Transaksi": "TRX-014", "Tanggal": "2024-02-22", "Wilayah": "Jakarta", "Kategori": "ATK", "Subkategori": "Stationery Set", "Sales": 540000, "Profit": 150000, "Kuantitas": 6, "Diskon": 0.00, "Pelanggan": "Yayasan Pendidikan Bina", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-015", "Tanggal": "2024-02-26", "Wilayah": "Bali", "Kategori": "Elektronik", "Subkategori": "Sound System", "Sales": 11500000, "Profit": 2100000, "Kuantitas": 1, "Diskon": 0.05, "Pelanggan": "Cafe Sunset Point", "Metode_Bayar": "Kartu Kredit" },
      { "ID_Transaksi": "TRX-016", "Tanggal": "2024-03-01", "Wilayah": "Semarang", "Kategori": "Furniture", "Subkategori": "Kursi Kerja", "Sales": 1200000, "Profit": 300000, "Kuantitas": 1, "Diskon": 0.00, "Pelanggan": "Rizal Fauzi", "Metode_Bayar": "E-Wallet" },
      { "ID_Transaksi": "TRX-017", "Tanggal": "2024-03-05", "Wilayah": "Jakarta", "Kategori": "Elektronik", "Subkategori": "Monitor 4K", "Sales": 9600000, "Profit": 1900000, "Kuantitas": 2, "Diskon": 0.10, "Pelanggan": "PT Media Kreasi", "Metode_Bayar": "Transfer Bank" },
      { "ID_Transaksi": "TRX-018", "Tanggal": "2024-03-10", "Wilayah": "Surabaya", "Kategori": "ATK", "Subkategori": "Kertas & Tinta", "Sales": 720000, "Profit": 190000, "Kuantitas": 4, "Diskon": 0.00, "Pelanggan": "Biro Jasa Akur", "Metode_Bayar": "Tunai" },
      { "ID_Transaksi": "TRX-019", "Tanggal": "2024-03-15", "Wilayah": "Bandung", "Kategori": "Furniture", "Subkategori": "Meja Belajar", "Sales": 1850000, "Profit": 420000, "Kuantitas": 1, "Diskon": 0.00, "Pelanggan": "Ratna Komala", "Metode_Bayar": "E-Wallet" },
      { "ID_Transaksi": "TRX-020", "Tanggal": "2024-03-20", "Wilayah": "Makassar", "Kategori": "Elektronik", "Subkategori": "Laptop", "Sales": 14500000, "Profit": 2300000, "Kuantitas": 1, "Diskon": 0.05, "Pelanggan": "Universitas Timur Raya", "Metode_Bayar": "Transfer Bank" }
    ]
  },
  hr: {
    name: "Data Karyawan & Kinerja (HR Analytics)",
    description: "Data profil staf, divisi, gaji pokok, bonus, rating kinerja, dan masa kerja.",
    sheetName: "Karyawan_2024",
    data: [
      { "NIK": "EMP-101", "Nama": "Andi Wijaya", "Departemen": "Teknologi Informasi", "Jabatan": "Senior Developer", "Pendidikan": "S1", "Usia": 31, "Masa_Kerja_Tahun": 4.5, "Gaji_Pokok": 18500000, "Bonus_Tahunan": 25000000, "Rating_Kinerja": 4.8, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 2 },
      { "NIK": "EMP-102", "Nama": "Siti Nurhaliza", "Departemen": "Pemasaran", "Jabatan": "Marketing Specialist", "Pendidikan": "S1", "Usia": 27, "Masa_Kerja_Tahun": 2.1, "Gaji_Pokok": 9500000, "Bonus_Tahunan": 12000000, "Rating_Kinerja": 4.2, "Status_Pernikahan": "Lajang", "Sakit_Izin_Hari": 4 },
      { "NIK": "EMP-103", "Nama": "Rian Kusuma", "Departemen": "Keuangan", "Jabatan": "Finance Analyst", "Pendidikan": "S1", "Usia": 29, "Masa_Kerja_Tahun": 3.0, "Gaji_Pokok": 11000000, "Bonus_Tahunan": 15000000, "Rating_Kinerja": 4.5, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 1 },
      { "NIK": "EMP-104", "Nama": "Mega Pratiwi", "Departemen": "Sumber Daya Manusia", "Jabatan": "HR Generalist", "Pendidikan": "S1", "Usia": 26, "Masa_Kerja_Tahun": 1.5, "Gaji_Pokok": 8500000, "Bonus_Tahunan": 8000000, "Rating_Kinerja": 3.9, "Status_Pernikahan": "Lajang", "Sakit_Izin_Hari": 5 },
      { "NIK": "EMP-105", "Nama": "Dedi Firmansyah", "Departemen": "Operasional", "Jabatan": "Operations Lead", "Pendidikan": "S2", "Usia": 38, "Masa_Kerja_Tahun": 7.2, "Gaji_Pokok": 22000000, "Bonus_Tahunan": 35000000, "Rating_Kinerja": 4.9, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 0 },
      { "NIK": "EMP-106", "Nama": "Lestari Anggraini", "Departemen": "Teknologi Informasi", "Jabatan": "UI/UX Designer", "Pendidikan": "S1", "Usia": 25, "Masa_Kerja_Tahun": 1.2, "Gaji_Pokok": 10500000, "Bonus_Tahunan": 10000000, "Rating_Kinerja": 4.6, "Status_Pernikahan": "Lajang", "Sakit_Izin_Hari": 3 },
      { "NIK": "EMP-107", "Nama": "Bambang Sudiro", "Departemen": "Keuangan", "Jabatan": "Accounting Officer", "Pendidikan": "D3", "Usia": 33, "Masa_Kerja_Tahun": 5.0, "Gaji_Pokok": 9000000, "Bonus_Tahunan": 11000000, "Rating_Kinerja": 4.0, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 2 },
      { "NIK": "EMP-108", "Nama": "Nadia Fitria", "Departemen": "Pemasaran", "Jabatan": "Content Strategist", "Pendidikan": "S1", "Usia": 24, "Masa_Kerja_Tahun": 0.8, "Gaji_Pokok": 7500000, "Bonus_Tahunan": 6000000, "Rating_Kinerja": 3.7, "Status_Pernikahan": "Lajang", "Sakit_Izin_Hari": 6 },
      { "NIK": "EMP-109", "Nama": "Hendra Gunawan", "Departemen": "Operasional", "Jabatan": "Logistics Supervisor", "Pendidikan": "S1", "Usia": 35, "Masa_Kerja_Tahun": 6.0, "Gaji_Pokok": 13500000, "Bonus_Tahunan": 18000000, "Rating_Kinerja": 4.3, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 1 },
      { "NIK": "EMP-110", "Nama": "Ayu Lestari", "Departemen": "Teknologi Informasi", "Jabatan": "QA Engineer", "Pendidikan": "S1", "Usia": 28, "Masa_Kerja_Tahun": 2.8, "Gaji_Pokok": 12000000, "Bonus_Tahunan": 14000000, "Rating_Kinerja": 4.4, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 2 },
      { "NIK": "EMP-111", "Nama": "Fajar Pratama", "Departemen": "Sumber Daya Manusia", "Jabatan": "Recruitment Specialist", "Pendidikan": "S1", "Usia": 30, "Masa_Kerja_Tahun": 3.5, "Gaji_Pokok": 10000000, "Bonus_Tahunan": 13000000, "Rating_Kinerja": 4.1, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 3 },
      { "NIK": "EMP-112", "Nama": "Indah Permata", "Departemen": "Keuangan", "Jabatan": "Tax Consultant", "Pendidikan": "S1", "Usia": 32, "Masa_Kerja_Tahun": 4.2, "Gaji_Pokok": 14000000, "Bonus_Tahunan": 20000000, "Rating_Kinerja": 4.7, "Status_Pernikahan": "Menikah", "Sakit_Izin_Hari": 1 }
    ]
  },
  keuangan: {
    name: "Laporan Anggaran & Realisasi Keuangan",
    description: "Evaluasi anggaran vs realisasi belanja departemen per kuartal.",
    sheetName: "Budget_Realisasi",
    data: [
      { "Kuartal": "Q1-2024", "Departemen": "Teknologi Informasi", "Kategori_Biaya": "Infrastruktur Cloud", "Anggaran": 45000000, "Realisasi": 43200000, "Selisih": 1800000, "Persentase_Pakai": 96.0, "Status": "Tepat Sasaran" },
      { "Kuartal": "Q1-2024", "Departemen": "Pemasaran", "Kategori_Biaya": "Iklan Digital", "Anggaran": 60000000, "Realisasi": 64500000, "Selisih": -4500000, "Persentase_Pakai": 107.5, "Status": "Over Budget" },
      { "Kuartal": "Q1-2024", "Departemen": "Operasional", "Kategori_Biaya": "Logistik & Distribusi", "Anggaran": 80000000, "Realisasi": 76000000, "Selisih": 4000000, "Persentase_Pakai": 95.0, "Status": "Tepat Sasaran" },
      { "Kuartal": "Q1-2024", "Departemen": "SDM", "Kategori_Biaya": "Pelatihan Karyawan", "Anggaran": 25000000, "Realisasi": 18000000, "Selisih": 7000000, "Persentase_Pakai": 72.0, "Status": "Hemat" },
      { "Kuartal": "Q2-2024", "Departemen": "Teknologi Informasi", "Kategori_Biaya": "Lisensi Software", "Anggaran": 35000000, "Realisasi": 34800000, "Selisih": 200000, "Persentase_Pakai": 99.4, "Status": "Tepat Sasaran" },
      { "Kuartal": "Q2-2024", "Departemen": "Pemasaran", "Kategori_Biaya": "Event & Sponsorship", "Anggaran": 50000000, "Realisasi": 51200000, "Selisih": -1200000, "Persentase_Pakai": 102.4, "Status": "Over Budget" },
      { "Kuartal": "Q2-2024", "Departemen": "Operasional", "Kategori_Biaya": "Perawatan Aset", "Anggaran": 40000000, "Realisasi": 36500000, "Selisih": 3500000, "Persentase_Pakai": 91.3, "Status": "Hemat" },
      { "Kuartal": "Q2-2024", "Departemen": "SDM", "Kategori_Biaya": "Recruitment & Onboarding", "Anggaran": 20000000, "Realisasi": 19500000, "Selisih": 500000, "Persentase_Pakai": 97.5, "Status": "Tepat Sasaran" },
      { "Kuartal": "Q3-2024", "Departemen": "Teknologi Informasi", "Kategori_Biaya": "Pengadaan Hardware", "Anggaran": 55000000, "Realisasi": 52000000, "Selisih": 3000000, "Persentase_Pakai": 94.5, "Status": "Tepat Sasaran" },
      { "Kuartal": "Q3-2024", "Departemen": "Pemasaran", "Kategori_Biaya": "Branding & Media", "Anggaran": 45000000, "Realisasi": 42000000, "Selisih": 3000000, "Persentase_Pakai": 93.3, "Status": "Tepat Sasaran" }
    ]
  }
};
