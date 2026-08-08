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
- Menampilkan **status semua konten, dikelompokkan per akun sosial media**.
- Fokus pada ringkasan yang cepat dipahami sekali lihat, bukan tabel padat berisi semua kolom sekaligus.

## Di Luar Scope (Fase 2+)
- Generate video AI dari ide konten (fase 2, setelah loop capture + dashboard terbukti terpakai konsisten).
- Ide lain dari sesi brainstorming (aplikasi serba-bisa untuk UMKM) — jalur terpisah, tidak digabung ke produk ini.

## Pertanyaan Terbuka (untuk sesi berikutnya)
- Data model: field apa saja yang perlu tersimpan per ide/konten (platform, format, status, tanggal, catatan, dll).
- Daftar status yang dipakai di dashboard (mis. ide baru → draft → terjadwal → tayang).
- Bentuk teknis: web app, atau bentuk lain.
