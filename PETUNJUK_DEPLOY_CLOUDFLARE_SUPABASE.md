# 🚀 Panduan Lengkap Deployment: Cloudflare Pages & Supabase

Aplikasi **Digital Guru** menggunakan sistem **Dual-Mode**:
- **Mode Standalone**: Tetap berjalan tanpa server backend.
- **Mode Live Cloud Sync**: Otomatis tersinkronisasi dua arah dengan Supabase saat Kunci API diisi.

---

## 🗄️ Langkah 1: Pengaturan Basis Data Supabase

1. Buka [Supabase Dashboard](https://database.new) dan buat proyek baru (contoh nama: `digital-guru-db`).
2. Buka menu **SQL Editor** pada sidebar kiri Supabase.
3. Buka berkas [`supabase_schema.sql`](file:///c:/Users/Monk/Downloads/vite-project/supabase_schema.sql) pada proyek ini, salin seluruh kodenya, lalu klik tombol **Run** pada Supabase SQL Editor.
4. Buka menu **Project Settings ➔ API** (atau **API Keys**), lalu salin dua nilai ini:
   - **Project URL** ➔ Simpan untuk `VITE_SUPABASE_URL`
   - **anon public key** ➔ Simpan untuk `VITE_SUPABASE_ANON_KEY`

---

## 💻 Langkah 2: Konfigurasi Lokal (`.env`)

Buka berkas [`.env`](file:///c:/Users/Monk/Downloads/vite-project/.env) di komputer Anda dan isi kredensial yang diambil dari Supabase:

```env
VITE_SUPABASE_URL=https://<id-proyek-anda>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📤 Langkah 3: Push Perubahan Kode ke GitHub

Jalankan perintah berikut di Terminal komputer Anda:

```bash
git add .
git commit -m "fix: update wrangler.json and supabase cloud sync"
git push origin main
```

---

## 🌐 Langkah 4: Pengaturan di Cloudflare Pages Dashboard

1. Masuk ke [Cloudflare Dashboard ➔ Workers & Pages](https://dash.cloudflare.com/).
2. Klik **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Pilih repositori GitHub proyek Anda, lalu atur konfigurasi berikut:

   | Pengaturan | Nilai |
   |---|---|
   | **Framework preset** | `Vite` |
   | **Build command** | `npm run build` |
   | **Build output directory** | `dist` |
   | **Deploy command** | *(Wajib KOSONG / Hapus jika ada)* |

> [!IMPORTANT]
> Jangan mengisi **Deploy command** dengan `npx wrangler deploy` karena itu digunakan untuk Cloudflare Workers, bukan Pages. Cloudflare Pages akan otomatis mempublikasikan folder `dist`.

4. Buka bagian **Environment variables (advanced)** dan tambahkan 2 variabel berikut:
   - `VITE_SUPABASE_URL` = *(Project URL Supabase Anda)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon Public Key Supabase Anda)*

5. Klik **Save and Deploy**. Cloudflare Pages akan memproses build secara otomatis dan aplikasi Anda langsung live!

---

## 🛠️ Berkas Konfigurasi Utama Proyek:

- [`wrangler.json`](file:///c:/Users/Monk/Downloads/vite-project/wrangler.json): Konfigurasi `pages_build_output_dir` dan `not_found_handling: "single-page-application"`.
- [`public/_redirects`](file:///c:/Users/Monk/Downloads/vite-project/public/_redirects): Mencegah 404 pada SPA Client Routing saat *refresh* halaman.
- [`public/_routes.json`](file:///c:/Users/Monk/Downloads/vite-project/public/_routes.json): Pemetaan rute statis Cloudflare Pages.
- [`src/lib/supabase.js`](file:///c:/Users/Monk/Downloads/vite-project/src/lib/supabase.js): Modul utama sinkronisasi Supabase.
- [`supabase_schema.sql`](file:///c:/Users/Monk/Downloads/vite-project/supabase_schema.sql): Skema SQL lengkap dengan tabel `profiles`, `students`, `daily_attendances`, `attendance_recap`, `grades` & RLS policies.
