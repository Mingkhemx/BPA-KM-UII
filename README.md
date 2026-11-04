# Website FTI UII – Modern React & Tailwind CSS

Website resmi Fakultas Teknologi Industri Universitas Islam Indonesia (FTI UII) yang telah dikonversi dan diperbarui dari file HTML statis lama menjadi aplikasi web modern berbasis **React 18 + Vite + Tailwind CSS + Framer Motion**.

---

## 🌟 Apa yang Baru dan Telah Dirapikan?

1. **Struktur Folder Bersih & Rapi**:
   - Sebanyak **231 file HTML lama** yang sebelumnya berserakan di folder root kini telah dirapikan dan dipindahkan ke dalam folder **`legacy_html/`**.
   - Dilengkapi dengan **`legacy_html/index.html`** sebagai *Master Catalog* berkategori (Profil, Akademik, Karir, Riset, Berita) dengan fitur pencarian instan.
2. **Modern Web Tech Stack (Tidak Ketinggalan Zaman)**:
   - **React 18 + Vite**: Cepat, ringan, *hot-module replacement* (HMR) instan.
   - **Tailwind CSS**: Styling modern berbasis utility classes, warna resmi UII (Navy `#06337b` & Gold `#ffe600`), glassmorphism, responsive di HP/Tablet/Desktop.
   - **Framer Motion**: Animasi perpindahan slide hero, transisi tab, animasi kartu, hover elevation, dan efek modal yang mulus.
   - **Lucide Icons**: Ikon SVG modern, tajam, dan ringan menggantikan font icon lama (flaticon/entypo).
3. **Fitur-Fitur Interaktif**:
   - **Hero Banner Slider**: Slideshow interaktif dengan autoplay, pause, next/prev, dan tombol CTA.
   - **Live Search Modal**: Pencarian langsung prodi, berita, dan pengumuman (cukup tekan ikon search atau tombol ESC untuk menutup).
   - **Filter Program Studi**: Filter interaktif Sarjana (S1 Reguler & International), Pascasarjana (S2/S3), dan Profesi Insinyur (PSPPI).
   - **Detail Reader Modal**: Membaca artikel berita, pengumuman UTS, dan agenda akademik langsung tanpa reload halaman.
   - **Video Profil Kampus**: Pemutar video profil YouTube FTI UII langsung dalam pop-up modal.
   - **Download Center Sertifikat Akreditasi**: Unduh langsung sertifikat PDF LAM-Teknik, BAN-PT, dan IABEE.
   - **Testimoni Alumni**: Slider cerita sukses lulusan yang berkarier di perusahaan multinasional.

---

## 🚀 Cara Menjalankan Website

Pastikan Node.js sudah terpasang di komputer Anda.

### 1. Menjalankan Server Development (Live Edit)
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### 2. Membangun untuk Production (Build)
```bash
npm run build
```
File hasil build yang siap di-hosting akan berada di folder `dist/`.

### 3. Meninjau Hasil Production
```bash
npm run preview
```

---

## 📁 Struktur Direktori

```
WEBSITE BPA/
├── legacy_html/                  # Arsip 231 file HTML lama yang sudah dirapikan
│   ├── index.html                # Master Catalog & Dashboard Arsip
│   └── *.html                    # Seluruh halaman HTML lama (tersimpan aman)
├── public/                       # Aset publik statis
│   ├── images/                   # Folder gambar website
│   └── docs/                     # Sertifikat Akreditasi PDF
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Header & menu navigasi responsif
│   │   ├── HeroSlider.jsx        # Slider banner utama beranimasi
│   │   ├── QuickStats.jsx        # Statistik keunggulan & angka akreditasi
│   │   ├── DeanGreetingSection.jsx # Sambutan Dekan, Visi-Misi & Dekanat
│   │   ├── StudyProgramsSection.jsx # Kartu & filter Program Studi
│   │   ├── NewsAndAnnouncements.jsx # Tab Berita, Pengumuman & Agenda
│   │   ├── InteractiveServices.jsx # Layanan kampus & Download Akreditasi
│   │   ├── TestimonialSection.jsx # Slider testimoni alumni
│   │   ├── DetailModal.jsx       # Modal pembaca artikel & detail prodi
│   │   ├── SearchModal.jsx       # Pencarian live interaktif
│   │   └── Footer.jsx            # Footer komprehensif & kontak UII
│   ├── data/
│   │   └── siteData.js           # Database data konten (mudah diedit)
│   ├── App.jsx                   # Komponen utama aplikasi
│   ├── main.jsx                  # Entry point React
│   └── index.css                 # Konfigurasi Tailwind & utility styles
├── index.html                    # Entry point modern Vite
├── tailwind.config.js            # Konfigurasi warna & animasi Tailwind
├── vite.config.js                # Konfigurasi Vite
└── package.json                  # Dependencies proyek
```

---

## 🎨 Cara Menyesuaikan atau Menambah Animasi

Animasi diatur menggunakan **Framer Motion**. Anda dapat dengan mudah mengubah durasi, tipe transisi, atau efek:

1. **Mengubah Efek Masuk (Fade / Slide)**:
   Buka file komponen terkait (misalnya di `src/components/HeroSlider.jsx`), cari properti `initial`, `animate`, dan `transition`:
   ```jsx
   <motion.div
     initial={{ opacity: 0, y: 20 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.5, ease: "easeOut" }}
   >
   ```

2. **Mengubah Konten Berita / Prodi / Kontak**:
   Buka file **`src/data/siteData.js`**. Semua teks, foto, nama dosen, berita, dan tautan diatur secara terpusat di file ini tanpa perlu membongkar kode komponen!

