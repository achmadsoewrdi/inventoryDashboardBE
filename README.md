# Fastify Products API - Project Documentation

Proyek ini adalah backend API untuk sistem manajemen inventaris produk yang dibangun dengan **Fastify**, **TypeScript**, dan **Prisma ORM**.

## 📂 Struktur Folder

Berikut adalah gambaran struktur folder proyek beserta kegunaannya:

```text
fastify-products-api/
├── prisma/                 # Konfigurasi Database (Prisma)
│   ├── migrations/         # Riwayat perubahan skema database (SQL)
│   └── schema.prisma       # Definisi model database, relasi, dan konfigurasi datasource
├── public/                 # File Statis & Aset
│   └── uploads/            # Direktori penyimpanan gambar produk yang diunggah
├── src/                    # Source Code Utama
│   ├── middleware/         # Custom hooks/middleware (e.g., Autentikasi JWT)
│   ├── plugin/             # Registrasi plugin Fastify (Prisma client, Sensible, dll)
│   ├── routes/             # Definisi endpoint API (dikelompokkan per modul)
│   │   ├── auth/           # Endpoint login, register, dan logout
│   │   ├── categories/     # CRUD untuk kategori produk
│   │   └── products/       # CRUD dan fitur utama produk
│   ├── services/           # Layer Logika Bisnis (Interaksi langsung ke Database)
│   ├── types/              # Definisi tipe data kustom/Interfaces (saat ini kosong)
│   ├── app.ts              # Konfigurasi instance Fastify & registrasi global
│   └── server.ts           # Entry point untuk menjalankan server
├── .env                    # Variabel lingkungan (Database URL, Secret Key, dll)
├── package.json            # Daftar dependensi dan script npm
├── tsconfig.json           # Konfigurasi compiler TypeScript
└── ts_error_utf8.txt       # Log error (jika ada)
```

---

## 🛠️ Penjelasan Detail Folder

### 🛡️ `src/middleware/`
Berisi fungsi-fungsi yang dijalankan dalam siklus request Fastify. Contoh utamanya adalah `authenticate.ts` yang memproteksi route dengan memvalidasi token akses user.

### 🔌 `src/plugin/`
Tempat untuk mengintegrasikan library pihak ketiga ke dalam ekosistem Fastify.
- **Prisma**: Menghubungkan database agar bisa dipanggil via `fastify.prisma`.
- **Sensible**: Memberikan utilitas standar untuk penanganan error HTTP.

### 🛣️ `src/routes/`
Tempat deklarasi endpoint. Mengikuti pola modular di mana setiap fitur memiliki folder sendiri yang berisi file `index.ts` (definisi route) dan `schema.ts` (validasi input request menggunakan JSON Schema).

### 🏛️ `src/services/`
Layer ini berfungsi sebagai jembatan antara Route dan Database. Semua operasi CRUD dan logika perhitungan stok dilakukan di sini. Hal ini bertujuan agar kode route tetap bersih dan fokus pada handling request/response.

### 📦 `prisma/`
Berisi jantung dari data aplikasi.
- **`schema.prisma`**: Di sini kita mendefinisikan tabel-tabel seperti `Product`, `User`, `Warehouse`, dll. Jika ingin menambah kolom baru di database, Anda cukup mengubah file ini dan menjalankan perintah migrasi.

---

## 📊 Skema Database (E-R Diagram Overview)

Sistem ini dirancang untuk manajemen gudang yang kompleks:

1.  **Akses Kontrol**: Tabel `User` dengan role `ADMIN` atau `STAFF`.
2.  **Katalog Produk**: Tabel `Product` yang terhubung ke `Category` dan `Supplier`.
3.  **Manajemen Stok**: Track status stok (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`).
4.  **Lokasi Fisik**: Tabel `Warehouse` dan `WarehouseZone` untuk manajemen gudang, serta `ProductLocation` untuk menentukan posisi barang di rak/lorong tertentu.
5.  **Media**: Tabel `ProductImage` untuk menangani banyak gambar per produk.
6.  **Audit Trail**: Tabel `ActivityLog` mencatat setiap perubahan penting (seperti penyesuaian stok) untuk transparansi data.

---

## 🚀 Cara Menjalankan Project

1.  Instal dependensi: `npm install`
2.  Sesuaikan file `.env` dengan kredensial database Anda.
3.  Jalankan migrasi database: `npx prisma migrate dev`
4.  Jalankan server: `npm run dev`
