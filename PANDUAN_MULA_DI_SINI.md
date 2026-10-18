# CIKGU AR: Kata Kerja Aktif Transitif

Projek WebAR menggunakan MindAR + A-Frame + JavaScript (tanpa perisian berbayar).

## Kandungan folder
- `index.html` — halaman utama.
- `demo.html` — AR DEMO terus menggunakan target rasmi MindAR (tiada compilation manual).
- `kad-demo.html` — paparan/print target rasmi untuk mod demo.
- `kelas.html` — AR bagi kad Bahasa Melayu anda; **memerlukan fail `targets.mind` yang anda jana**.
- `assets/kad-kata-kerja.png` — kad Bahasa Melayu yang boleh dicetak atau dipaparkan pada skrin lain.
- `interaksi.js` — 3 contoh kata kerja dan fungsi suara.
- `style.css` — gaya aplikasi.

**PENTING:** `targets.mind` untuk kad Bahasa Melayu BELUM disertakan kerana ia perlu diproses daripada PNG melalui MindAR Compiler. Mod demo boleh berfungsi terus setelah aplikasi diterbitkan dalam talian.

## Langkah 1 — Terbitkan untuk mencuba demo
1. Buka https://github.com/new dan cipta repositori PUBLIC baharu (cth. `cikgu-ar-bm`).
2. Tekan **Add file → Upload files**. Muat naik isi folder projek ini, termasuk subfolder `assets`, **bukan fail ZIP**. Jika GitHub sukar memuat naik subfolder, seret semua fail dan folder daripada File Explorer.
3. Commit changes.
4. Pergi ke **Settings → Pages**.
5. Pada Build and deployment, pilih **Deploy from a branch**; branch `main` dan folder `/(root)`; tekan Save.
6. Selepas laman diterbitkan, buka `https://NAMA-PENGGUNA.github.io/cikgu-ar-bm/` (tukar nama sebenar).
7. Untuk kad demo, pada KOMPUTER buka `.../kad-demo.html` (boleh cetak). Pada TELEFON buka `.../demo.html`, beri kebenaran kamera, dan imbas gambar pada komputer.

## Langkah 2 — Aktifkan kad Bahasa Melayu sendiri
1. Simpan `assets/kad-kata-kerja.png` pada komputer.
2. Buka **Image Targets Compiler rasmi**: https://hiukim.github.io/mind-ar-js-doc/tools/compile/
3. Muat naik **kad-kata-kerja.png**, tekan **Start**. Tunggu hingga selesai, semak sebaran feature points.
4. Tekan **Download** dan simpan dengan nama tepat `targets.mind` (jangan jadi `targets.mind.mind`).
5. Muat naik `targets.mind` ke **root folder repositori**, SEPARAS dengan `kelas.html` — bukan dalam folder assets.
6. Buka `https://NAMA-PENGGUNA.github.io/cikgu-ar-bm/kelas.html` pada telefon. Imbas cetakan kad, atau kad yang dipaparkan pada komputer.
7. Jika AR gagal mengesan gambar, pastikan fail `.mind` terhasil daripada gambar yang SAMA, pencahayaan baik, kad jelas dan tidak reflektif.

## Langkah 3 — Ubah kandungan PdP
Buka `interaksi.js` dan tukar senarai `pelajaran` untuk mengubah ayat, kata kerja serta huraian. Anda juga boleh ubah rupa cikgu 3D dan papan putih pada bahagian `<a-entity id="kadAR">` dalam `kelas.html`.

## Nota teknikal
- Internet diperlukan untuk mengakses perpustakaan A-Frame/MindAR melalui CDN.
- Kamera memerlukan HTTPS pada telefon. GitHub Pages menggunakan HTTPS; jangan hanya dwi-klik HTML fail dari `file://` untuk ujian kamera.
- Jangkaan persekitaran: pelayar moden Android/Chrome atau iPhone/Safari yang menyokong kamera dan WebGL.
- Audio menggunakan `speechSynthesis` pelayar; suara Melayu mungkin tiada pada sesetengah peranti, dan suara gantian mungkin berbeza.
- Watak 3D ialah model ringkas yang dibina daripada A-Frame primitives, bukan model GLB profesional.
- Ini prototaip latihan. Kesesuaian perlu diuji pada telefon sebenar.

Sumber rujukan:
- https://hiukim.github.io/mind-ar-js-doc/quick-start/overview/
- https://hiukim.github.io/mind-ar-js-doc/quick-start/compile/
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
