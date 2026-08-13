# Product Brief — Content Idea & Status Hub

## Ringkasan
Sistem personal untuk menangkap ide konten secepat memikirkannya, dan melihat status semua konten di semua akun sosial media dalam satu tempat — menggantikan kebiasaan lama yang mengandalkan beberapa spreadsheet terpisah per akun.

> **Perluasan (Agustus 2026):** aplikasi ini berkembang menjadi dashboard produktivitas harian. Ide konten kini menjadi salah satu panel, di samping keuangan, sosial media, berita, dan briefing harian. Lihat bagian [Perluasan menjadi dashboard harian](#perluasan-menjadi-dashboard-harian) di bawah.

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
- **Database:** **Neon Postgres**, dibuat lewat tab Storage di dashboard Vercel — connection string otomatis ke-inject ke project, tidak perlu copy-paste kredensial manual.
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

---

## Perluasan menjadi dashboard harian

Aplikasi berkembang dari tracker konten menjadi penunjang produktivitas harian, dengan satu target yang mengikat semuanya: **pemasukan 10 juta rupiah per bulan**.

### Panel

| Panel | Isi | Sumber data |
|---|---|---|
| **Dashboard** | Briefing harian, progress target, ringkasan tiap panel | Gabungan |
| **Keuangan** | Pemasukan & pengeluaran, tren bulanan, pemasukan per venture | Input manual |
| **Konten** | Ide per tema dan status per platform (fitur awal) | Input + AI |
| **Sosmed** | Follower, views, engagement per akun beserta arah pergerakannya | Manual sekarang, API nanti |
| **Berita & pasar** | Berita ekonomi, kurs USD/IDR, harga crypto | RSS + API publik gratis |

### Briefing harian
Gemini membaca data keuangan, sosial media, dan konten, lalu menulis satu penilaian kondisi dan tiga langkah konkret menuju target. Disimpan per tanggal supaya membuka dashboard berulang kali tidak menghabiskan kuota AI.

### Sosial media: kenapa masih manual
- **Instagram** bisa otomatis tanpa menunggu persetujuan, selama akunnya Business/Creator dan terhubung ke Facebook Page. Token berlaku 60 hari sehingga perlu diperbarui berkala.
- **TikTok** memerlukan persetujuan aplikasi dari pihak TikTok, dan lama prosesnya di luar kendali.

Karena itu data manual dan data dari API disimpan dalam tabel yang sama (`social_snapshots`, dibedakan kolom `source`). Panelnya tidak berubah saat penyambungan otomatis nanti aktif.

### Catatan ketahanan
Berita dan data pasar diambil dari internet terbuka. Setiap pengambilan dibatasi waktu dan ditangani sendiri-sendiri: satu sumber yang mati hanya membuat bagiannya kosong, tidak menjatuhkan seluruh halaman.
