# Product Brief — Content Idea & Status Hub

## Ringkasan
Sistem personal untuk menangkap ide konten secepat memikirkannya, dan melihat status semua konten di semua akun sosial media dalam satu tempat — menggantikan kebiasaan lama yang mengandalkan beberapa spreadsheet terpisah per akun.

## Masalah
Ide konten sering hilang karena tidak ada tempat capture yang cepat — kadang lupa begitu saja, kadang harus ditanyakan ulang. Tracker konten yang ada saat ini (spreadsheet) memuat terlalu banyak informasi sekaligus, dan setiap akun sosial media punya file terpisah. Akibatnya, membuka tracker terasa berat, dan akhirnya malah dihindari — padahal fungsinya harusnya membantu.

## Target Pengguna
- **Fase 1 (sekarang):** dipakai sendiri (dogfooding).
- **Fase 2 (kondisional):** dibuka untuk content creator lain dengan masalah serupa — *hanya jika* terbukti lebih membantu dibanding tools/app yang sudah ada.

## Tujuan / Definisi Sukses
- Ide konten tidak pernah hilang lagi, apapun kondisinya saat ide itu muncul.
- Tidak ada lagi kebiasaan menghindari membuka tracker konten.
- Status semua akun sosial media bisa dilihat dalam satu tampilan, tanpa buka banyak file.

## Ruang Lingkup MVP

### Loop 1 — Capture
- Input bebas, gaya "curhat" (natural language) — mirip cara ngobrol biasa, bukan isi form terstruktur.
- Sistem yang mem-parse dan mengorganisir otomatis di belakang layar (platform, format, isi ide) — bukan user yang harus mengkategorikan manual di awal.

### Loop 2 — Dashboard
- Menampilkan **status semua konten, dikelompokkan per tema/persona**.
- Fokus pada ringkasan yang cepat dipahami sekali lihat, bukan tabel padat berisi semua kolom sekaligus.

## Tema & Akun

Satu ide selalu terikat ke satu tema. Tema yang sama bisa dieksekusi ke IG dan/atau TikTok (masing-masing dengan progress sendiri).

| Tema | IG | TikTok |
|---|---|---|
| Belajar AI bareng Beny | @belajaraibarengbeny | @belajaraibarengbeny |
| Cerita Kirana Larasati | @ceritakirana.larasati | — |
| Daily Life Nara(a) | @dailylifenaraa | @dailylifenara |
| Liburan Seru bareng Bem | @liburanserubarengbem | @liburanserubarengbem |
| Cerita Kopi Beny | @ceritakopibeny | @ceritakopibeny |

## Data Model

### Ide (level atas, 1 per ide)
- Ide mentah — teks asli hasil capture ("curhat")
- Judul/hook — ringkasan otomatis, untuk gampang di-scan di dashboard
- Tema — salah satu dari 5 tema di atas
- Catatan — opsional
- Tanggal dibuat

### Eksekusi per platform (nempel ke 1 ide, bisa 1 atau 2 baris: IG dan/atau TikTok)
- Platform — IG / TikTok
- Status — `Ide baru` → `Draft` → `Terjadwal` → `Tayang` (+ `Skip` untuk ide yang tidak jadi dipakai)
- Format — video, carousel, reels, story, dll
- Tanggal rencana tayang

Status dan format disimpan **per platform**, bukan per ide — karena progress IG dan TikTok untuk ide yang sama bisa berbeda (mis. IG sudah Tayang, TikTok masih Draft).

### Tampilan dashboard
Grouping utama per Tema (5 grup). Tiap ide jadi satu kartu ringkas menampilkan judul/hook + chip status kecil per platform (mis. `IG: Tayang` `TikTok: Draft`), tanpa membuka detail satu per satu.

## Di Luar Scope (Fase 2+)
- Generate video AI dari ide konten (fase 2, setelah loop capture + dashboard terbukti terpakai konsisten).
- Ide lain dari sesi brainstorming (aplikasi serba-bisa untuk UMKM) — jalur terpisah, tidak digabung ke produk ini.

## Bentuk Teknis

- **Web app** — satu tempat untuk capture (input "curhat") dan dashboard, dibangun dengan **Next.js**.
- **Database:** SQLite — cukup untuk 1 pengguna, tidak butuh server database terpisah.
- **AI parsing:** modul terpisah (mudah diganti provider) —
  - Fase 1 (dogfooding): **Gemini API** (tier gratis).
  - Fase 2 (kalau dijual): pindah ke **Claude API**.
- **Hosting:** deploy online (mis. Vercel, tier gratis) — supaya bisa diakses dari HP kapan saja, bukan cuma dari laptop.
- **Proteksi akses:** satu password/PIN untuk seluruh app (bukan sistem akun/login penuh, karena hanya 1 pengguna).

## Halaman v1

1. **Login** — masukin password, sekali per sesi.
2. **Capture** — input teks bebas ("curhat"), AI parse otomatis jadi tema/hook/platform/format, ada preview hasil parse yang bisa dikoreksi sebelum disimpan.
3. **Dashboard** — daftar ide dikelompokkan per tema, tiap kartu menampilkan hook + chip status per platform.
4. **Detail Ide** — buka satu ide untuk edit status, format, tanggal rencana tayang, atau catatan.

## Pertanyaan Terbuka (untuk sesi berikutnya)
- (belum ada — siap lanjut ke scaffolding kode)
