# 📊 DataExcel Pro - Web Analisa Data Excel & CSV Interaktif

Aplikasi web modern, cepat, dan interaktif untuk menganalisis, memvisualisasikan, dan membersihkan data spreadsheet Excel (`.xlsx`, `.xls`) serta CSV langsung di browser tanpa perlu instalasi server atau dependensi tambahan.

---

## ✨ Fitur Utama

1. **📁 Multi-Format & Multi-Sheet Support**
   - Mendukung format file `.xlsx`, `.xls`, dan `.csv`.
   - Pemilihan sheet dinamis jika buku kerja Excel memiliki banyak lembar kerja (multi-sheet).
   - Terdapat **3 Dataset Contoh Bawaan** (Penjualan Retail, Data Karyawan HR, dan Laporan Anggaran Keuangan) yang dapat langsung dicoba dengan 1 klik.

2. **📊 Ringkasan & Metrik Eksekutif (Dashboard Overview)**
   - Kartu KPI: Total Baris, Total Kolom, Sel Kosong (Missing Cells) dengan persentase, dan Baris Duplikat.
   - Deteksi Otomatis (Auto-Insights): Anomali data, deteksi pencilan (outliers), rasio missing value, dan korelasi kuat.
   - Tabel Karakteristik Kolom: Tipe data otomatis (Angka, Tanggal, Kategori, Teks), jumlah unik, dan sampel nilai.

3. **🔍 Eksplorasi Tabel Interaktif (Data Explorer)**
   - Pencarian global di seluruh kolom.
   - Pembuat Filter Bertingkat (`=`, `!=`, `>`, `<`, `>=`, `<=`, mengandung teks, bernilai kosong/tidak).
   - Pengurutan data (Sort Ascending / Descending) dengan sekali klik pada judul kolom.
   - Paginasi data (10, 15, 25, 50, 100 baris per halaman).

4. **📈 Statistik Deskriptif & Matriks Korelasi (EDA)**
   - Perhitungan lengkap kolom numerik: Mean (Rata-rata), Median, Modus, Standar Deviasi, Nilai Minimum, Kuartil 1 (Q25), Kuartil 3 (Q75), Nilai Maksimum, Rentang Antarkuartil (IQR), dan Deteksi Outlier Tukey.
   - Analisis Distribusi Frekuensi Kategori dengan visualisasi bar proporsional.
   - Matriks Korelasi Pearson ($r$) antar kolom numerik dengan kode warna heatmap interaktif.

5. **🎨 Studio Grafik & Visualisasi (Chart Studio)**
   - Beragam jenis grafik: Batang Tegak (Bar), Batang Mendatar (Horizontal Bar), Garis Tren (Line), Area Terisi (Area), Diagram Lingkaran (Pie), Donat (Doughnut), Polar Area, dan Scatter Plot.
   - Kustomisasi lengkap: Sumbu X, Sumbu Y, Fungsi Agregasi (SUM, AVG, COUNT, MIN, MAX), Group By, dan 6 Pilihan Palet Warna Profesional.
   - Unduh grafik beresolusi tinggi langsung dalam format **PNG**.
   - Tabel data hasil agregasi otomatis di bawah grafik.

6. **🔲 Generator Tabel Pivot (Cross-Tabulation)**
   - Persilangan dua dimensi kategori (Baris & Kolom).
   - Agregasi dinamis (Jumlah, Rata-rata, Frekuensi, Min, Max).
   - Subtotal Baris, Subtotal Kolom, dan Total Keseluruhan.
   - Heatmap intensitas warna otomatis pada setiap sel pivot.

7. **🧹 Alat Pembersihan & Transformasi Data (Data Cleaning Tools)**
   - Hapus baris duplikat.
   - Hapus baris yang memiliki nilai kosong.
   - Isi nilai kosong (imputasi dengan Rata-rata, Median, atau Nilai Nol).
   - Pangkas spasi berlebih (Trim Whitespace).
   - Format kapitalisasi huruf (HURUF BESAR, huruf kecil, Huruf Judul).
   - Hapus kolom yang tidak relevan.
   - Fitur "Kembalikan ke Bentuk Asli" (Undo).

8. **📄 Ekspor & Cetak Laporan**
   - Ekspor kembali data bersih ke format **Excel (.xlsx)** atau **CSV**.
   - Cetak Laporan Eksekutif rapi atau simpan sebagai **PDF**.

9. **🔒 Privasi & Keamanan 100% Sisi Klien**
   - Seluruh pemrosesan data dilakukan secara lokal di memori peramban (browser) pengguna. Data rahasia/perusahaan Anda tidak pernah dikirim ke internet atau server pihak ketiga.

---

## 🚀 Cara Menjalankan Aplikasi

Ada beberapa cara mudah untuk membuka aplikasi ini:

### Cara 1: Menggunakan File Batch (Paling Praktis)
1. Buka folder `C:\Users\nix\.gemini\antigravity\scratch\excel-analyzer-web` di File Explorer Windows.
2. Klik ganda (double-click) pada file **`buka_aplikasi.bat`**.
3. Aplikasi akan langsung terbuka di peramban web utama Anda (Google Chrome, Microsoft Edge, dll).

### Cara 2: Langsung Membuka `index.html`
- Klik kanan file **`index.html`** &rarr; pilih **Open with** &rarr; pilih **Google Chrome** atau **Microsoft Edge**.

---

## 📂 Struktur File Proyek

```text
excel-analyzer-web/
├── index.html           # Halaman web utama dan antarmuka pengguna (UI)
├── buka_aplikasi.bat    # Shortcut peluncur instan untuk Windows
├── README.md            # Dokumentasi panduan lengkap
├── css/
│   └── styles.css       # Kustomisasi tata letak, scrollbar, kartu, dan gaya cetak
└── js/
    ├── sample-data.js   # Dataset contoh (Penjualan, HR, Keuangan)
    ├── data-engine.js   # Mesin kalkulasi statistik, filter, pivot, dan pembersihan
    ├── charts.js        # Konfigurasi rendering grafik Chart.js & ekspor gambar
    └── app.js           # Pengendali utama (event listener, state management, render)
```
