# 🚀 Panduan Deployment Mandiri: Cloudflare Pages & Supabase

Aplikasi **Digital Guru** dirancang secara **Dual-Mode System**:
1. **Mode Mandiri / Standalone (Bawaan)**: Berjalan 100% tanpa perlu server backend eksternal.
2. **Mode Live Supabase Sync**: Otomatis terhubung dengan basis data cloud Supabase ketika Kunci API disetel.

---

## 📂 1. Menyiapkan Basis Data Supabase

1. Buka [Supabase Dashboard](https://database.new) dan buat proyek baru.
2. Buka menu **SQL Editor** pada panel kiri Supabase.
3. Buka berkas [`supabase_schema.sql`](file:///c:/Users/Monk/Downloads/vite-project/supabase_schema.sql) di proyek ini, salin seluruh kodenya, lalu **Run** pada Supabase SQL Editor.
4. Buka menu **Project Settings ➔ API** di Supabase, lalu salin:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **anon public Key** (`VITE_SUPABASE_ANON_KEY`)

---

## 🌐 2. Deployment ke Cloudflare Pages

### CARA A: Via Git Integration / GitHub (Paling Mudah & Otomatis)

1. Upload/Push proyek ini ke repositori **GitHub** Anda.
2. Masuk ke [Cloudflare Dashboard ➔ Workers & Pages](https://dash.cloudflare.com/).
3. Klik **Create application ➔ Pages ➔ Connect to Git**.
4. Pilih repositori GitHub proyek Anda, lalu atur konfigurasi berikut:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Pada bagian **Environment variables (advanced)**, tambahkan 2 variabel lingkungan (opsional untuk live Supabase):
   - `VITE_SUPABASE_URL` = *(Project URL Supabase Anda)*
   - `VITE_SUPABASE_ANON_KEY` = *(Anon Public Key Supabase Anda)*
6. Klik **Save and Deploy**. Cloudflare Pages akan memproses build secara otomatis dan memberikan URL live seperti `https://digital-guru.pages.dev`!

---

### CARA B: Via Terminal CLI (Wrangler Pages)

```bash
# 1. Jalankan build produksi
npm run build

# 2. Deploy folder dist langsung ke Cloudflare Pages
npx wrangler pages deploy dist --project-name=digital-guru
```

---

## 🛠️ Berkas Konfigurasi Utama dalam Proyek:

- [`public/_redirects`](file:///c:/Users/Monk/Downloads/vite-project/public/_redirects): Mencegah error 404 pada Cloudflare Pages saat refresh halaman (*SPA Client Routing*).
- [`public/_routes.json`](file:///c:/Users/Monk/Downloads/vite-project/public/_routes.json): Konfigurasi pemetaan rute statis Cloudflare Pages.
- [`src/lib/supabase.js`](file:///c:/Users/Monk/Downloads/vite-project/src/lib/supabase.js): Modul klien Supabase dengan *fallback* aman ke state lokal.
- [`supabase_schema.sql`](file:///c:/Users/Monk/Downloads/vite-project/supabase_schema.sql): Skema basis data SQL siap dieksekusi di Supabase.
