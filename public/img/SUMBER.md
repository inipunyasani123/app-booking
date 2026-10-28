# Sumber gambar — Kursi Putar (demo app-booking)

Semua usaha, orang, dan alamat di demo ini rekaan.

## Ilustrasi buatan sendiri (tanpa wajah orang sungguhan)
Dibuat dari SVG di `scripts/gambar.mjs` (salinan SVG di `design/`), dirender dengan sharp.
- `kapster-raka.webp`, `kapster-bayu.webp`, `kapster-wiryo.webp`, `kapster-laras.webp`, `kapster-sekar.webp` — ilustrasi tokoh kapster/penata rekaan, tanpa fitur wajah.
- `peta.webp`, `peta-480.webp` — peta ilustrasi jalan rekaan (Jl. Tegel Kuno, Jl. Kenari, Jl. Kemuning); bukan peta sungguhan.
- Ikon aplikasi & PWA (`assets/icon.png`, `public/icon-*.png`, `public/icon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`) dan motif jok kulit berkancing & belang tiang pangkas (`src/components/pola-data.js`).
- `public/og.jpg` — komposisi tangkapan layar aplikasi ini sendiri.
- QR di karcis & panel samping dibuat dari teks kode karcis/alamat situs (paket `qrcode`, MIT).

## Foto (CC0 / domain publik)
Diolah oleh `scripts/gambar.mjs` (dipotong, dikecilkan; outlet diberi duotone marun-krem).
- `outlet.webp`, `outlet-480.webp` — "Barber shop, Quebec city, Canada" oleh Wilfredor, CC0 1.0. Bagian papan nama di cermin dipotong.
  https://commons.wikimedia.org/wiki/File:Barber_shop,_Quebec_city,_Canada.jpg
- `salon.webp`, `salon-480.webp` — "Hair salon - Arlington, MA" oleh Daderot, CC0 1.0.
  https://commons.wikimedia.org/wiki/File:Hair_salon_-_Arlington,_MA.jpg
- `alat.webp`, `alat-480.webp` — meja kayu dengan gunting, sisir, dan perlengkapan pangkas, oleh Nilo Velez, CC0 (WordPress Photo Directory). Bagian botol berlabel dipotong.
  https://wordpress.org/photos/photo/27966437d7/

### Katalog gaya dan keadaan kosong (diganti foto 29 Okt 2026)
Semua dipotong persegi oleh `scripts/gambar.mjs` (entri `FOTO.push`). Foto gaya hanya memperlihatkan rambut, telinga, dan tengkuk; wajah dipotong. Foto "pendekatan" = gaya yang tepat tidak ada di Commons, dipakai gaya terdekat.
- `gaya-fade-rendah.webp` — "Mid-fade 03.jpg", Classic Barbers, CC0. Pendekatan (fade di belakang telinga).
  https://commons.wikimedia.org/wiki/File:Mid-fade_03.jpg
- `gaya-mid-fade.webp` — "Mid-fade 04.jpg", Classic Barbers, CC0.
  https://commons.wikimedia.org/wiki/File:Mid-fade_04.jpg
- `gaya-taper.webp` — "Mid-fade 07.jpg", Classic Barbers, CC0. Pendekatan (taper di tengkuk).
  https://commons.wikimedia.org/wiki/File:Mid-fade_07.jpg
- `gaya-crop.webp` — "Mid-fade 02.jpg", Classic Barbers, CC0. Pendekatan (atas pendek bertekstur).
  https://commons.wikimedia.org/wiki/File:Mid-fade_02.jpg
- `gaya-belah-pinggir.webp` — "Crew Cut, Semi Short Taper.jpg", domain publik (foto USMC, diunggah ke Commons). Pendekatan (rambut atas tersisir ke samping).
  https://commons.wikimedia.org/wiki/File:Crew_Cut,_Semi_Short_Taper.jpg
- `gaya-undercut.webp` — "Young man skin fade mohawk.jpg", Wikisteveb4, CC0. Pendekatan (samping habis, atas panjang).
  https://commons.wikimedia.org/wiki/File:Young_man_skin_fade_mohawk.jpg
- `gaya-cepak.webp` — "Photo of buzz cut.jpg", Absock, CC0.
  https://commons.wikimedia.org/wiki/File:Photo_of_buzz_cut.jpg
- `gaya-pangkas-anak.webp` — "Hairdresser cutting hair.jpg", Wilfredor, CC0. Pendekatan (pangkas dengan gunting dan sisir, tampak belakang).
  https://commons.wikimedia.org/wiki/File:Hairdresser_cutting_hair.jpg
- `kursi-kosong.webp` — "Valhalla Cave Davie Barbershop Classic Barber Chairs.jpg", Leverageroi, CC0.
  https://commons.wikimedia.org/wiki/File:Valhalla_Cave_Davie_Barbershop_Classic_Barber_Chairs.jpg
- `tambahan.webp` — "Silvertip shaving brush.jpg", CC0 (Commons, pengunggah "Me"). Banner kategori Tambahan.
  https://commons.wikimedia.org/wiki/File:Silvertip_shaving_brush.jpg

## Font
- Gloock (The Gloock Project Authors) dan Plus Jakarta Sans (Tokotype), SIL Open Font License 1.1 — lisensi di `public/fonts/`.
