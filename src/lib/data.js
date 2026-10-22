// Semua usaha, orang, dan alamat di sini rekaan untuk demo PintuWeb.
export const SITUS = {
  url: 'https://app-booking.pintuweb.id',
  slug: 'booking',
  kontak: 'https://www.pintuweb.id/kontak?demo=booking',
};

export const OUTLET = {
  nama: 'Kursi Putar',
  jenis: 'Pangkas & Salon',
  kota: 'Blitar, Jawa Timur',
  alamat: 'Jl. Tegel Kuno No. 9, Kota Blitar',
  patokan: 'Seberang taman kota, sebelah toko bangunan',
  kursi: 5,
  fasilitas: [
    { ikon: 'pintu', judul: 'Ruang salon privat', isi: 'Bilik bertirai untuk pelanggan berhijab, ditangani penata perempuan.' },
    { ikon: 'kartu', judul: 'Tunai atau QRIS', isi: 'Bayar di kasir setelah selesai. Tidak ada pembayaran di aplikasi.' },
    { ikon: 'parkir', judul: 'Parkir motor', isi: 'Muat sekitar 10 motor di halaman depan.' },
    { ikon: 'wifi', judul: 'Wi-Fi & ruang tunggu', isi: 'Kalau datang lebih awal, ada kursi tunggu dan teh hangat.' },
  ],
  aturan: [
    'Datang 10 menit sebelum jadwal.',
    'Ubah atau batalkan paling lambat 1 jam sebelum jadwal, langsung dari aplikasi.',
    'Terlambat lebih dari 15 menit, kursimu bisa dialihkan ke pelanggan berikutnya.',
  ],
};

// Jam buka per hari pekan (0 = Minggu). Menit sejak 00.00 WIB.
export const JAM_BUKA = {
  0: { buka: 540, tutup: 1260, istirahat: [720, 780] },
  1: { buka: 600, tutup: 1260, istirahat: [720, 780] },
  2: null,
  3: { buka: 600, tutup: 1260, istirahat: [720, 780] },
  4: { buka: 600, tutup: 1260, istirahat: [720, 780] },
  5: { buka: 780, tutup: 1260, istirahat: [1080, 1110], catatan: 'Buka setelah salat Jumat' },
  6: { buka: 540, tutup: 1260, istirahat: [720, 780] },
};

export const KATEGORI = [
  { id: 'pangkas', nama: 'Pangkas', ket: 'Potong rambut, jenggot, dan cukur klasik.' },
  { id: 'salon', nama: 'Salon', ket: 'Perawatan dan penataan, termasuk ruang privat.' },
  { id: 'tambahan', nama: 'Tambahan', ket: 'Bisa ditambahkan ke layanan mana pun.' },
];

export const LAYANAN = [
  { id: 'pangkas-reguler', kat: 'pangkas', nama: 'Pangkas Reguler', menit: 30, harga: 45000, ket: 'Potong, keramas, lalu ditata dengan pomade pilihanmu.' },
  { id: 'fade-taper', kat: 'pangkas', nama: 'Fade & Taper', menit: 45, harga: 60000, ket: 'Gradasi rapi dari tipis sampai atas, garis dirapikan pisau cukur.' },
  { id: 'pangkas-klasik', kat: 'pangkas', nama: 'Pangkas Klasik + Handuk Hangat', menit: 45, harga: 70000, ket: 'Potongan rapi gaya lama, ditutup handuk hangat dan tonik.' },
  { id: 'jenggot', kat: 'pangkas', nama: 'Rapikan Jenggot & Kumis', menit: 30, harga: 35000, ket: 'Garis dibentuk ulang, handuk hangat, minyak jenggot.' },
  { id: 'paket-lengkap', kat: 'pangkas', nama: 'Paket Pangkas + Jenggot', menit: 60, harga: 90000, ket: 'Pangkas pilihanmu sekaligus jenggot, hemat Rp15.000.' },
  { id: 'pangkas-anak', kat: 'pangkas', nama: 'Pangkas Anak', menit: 30, harga: 35000, ket: 'Untuk usia 12 tahun ke bawah, ada dudukan khusus anak.' },
  { id: 'potong-blow', kat: 'salon', nama: 'Potong & Blow', menit: 60, harga: 85000, ket: 'Konsultasi bentuk, potong, keramas, lalu blow sesuai gaya.' },
  { id: 'creambath', kat: 'salon', nama: 'Creambath', menit: 60, harga: 75000, ket: 'Krim perawatan, pijat kepala dan bahu, uap hangat.' },
  { id: 'hair-spa', kat: 'salon', nama: 'Hair Spa', menit: 75, harga: 110000, ket: 'Masker rambut, uap, dan pijat untuk rambut kering atau rusak.' },
  { id: 'pewarnaan', kat: 'salon', nama: 'Pewarnaan Rambut', menit: 120, harga: 250000, mulai: true, ket: 'Harga untuk rambut sebahu; panjang lain dihitung saat konsultasi.' },
  { id: 'smoothing', kat: 'salon', nama: 'Smoothing', menit: 180, harga: 350000, mulai: true, ket: 'Meluruskan dan melembutkan; harga akhir mengikuti panjang rambut.' },
  { id: 'pijat', kat: 'tambahan', nama: 'Pijat Kepala & Bahu', menit: 15, harga: 20000, ket: 'Lima belas menit pijat sebelum atau sesudah layanan.' },
  { id: 'masker', kat: 'tambahan', nama: 'Masker Wajah', menit: 15, harga: 25000, ket: 'Masker arang untuk wajah, dibilas dengan handuk hangat.' },
  { id: 'keramas', kat: 'tambahan', nama: 'Keramas Ekstra', menit: 15, harga: 10000, ket: 'Keramas kedua dengan sampo pilihan dari rak kami.' },
];

export const layananById = Object.fromEntries(LAYANAN.map((l) => [l.id, l]));
export const LAYANAN_UTAMA = LAYANAN.filter((l) => l.kat !== 'tambahan');
export const TAMBAHAN = LAYANAN.filter((l) => l.kat === 'tambahan');

// Kapster & penata rambut. Avatar = ilustrasi buatan sendiri (public/img/kapster-<id>.webp).
export const KAPSTER = [
  {
    id: 'raka',
    no: 1,
    nama: 'Raka',
    peran: 'Kapster',
    keahlian: ['Fade', 'Taper', 'Crop pendek'],
    bio: 'Paling sering dicari untuk fade yang rapi. Suka menjelaskan cara menata sendiri di rumah.',
    libur: [3],
    layanan: ['pangkas-reguler', 'fade-taper', 'pangkas-klasik', 'jenggot', 'paket-lengkap'],
    warna: '#D3E8DC',
  },
  {
    id: 'bayu',
    no: 2,
    nama: 'Bayu',
    peran: 'Kapster',
    keahlian: ['Jenggot', 'Handuk hangat', 'Pangkas klasik'],
    bio: 'Telaten dengan jenggot dan cukur handuk hangat. Cocok untuk yang ingin tampilan rapi gaya lama.',
    libur: [4],
    layanan: ['pangkas-reguler', 'fade-taper', 'pangkas-klasik', 'jenggot', 'paket-lengkap'],
    warna: '#F1E0BC',
  },
  {
    id: 'wiryo',
    no: 3,
    nama: 'Pak Wiryo',
    peran: 'Kapster senior',
    keahlian: ['Pangkas klasik', 'Rambut anak', 'Belah pinggir'],
    bio: 'Sabar menghadapi anak yang takut gunting. Bertugas pagi sampai sore.',
    libur: [0],
    shift: [540, 1020],
    layanan: ['pangkas-reguler', 'pangkas-klasik', 'jenggot', 'pangkas-anak'],
    warna: '#EAE0CF',
  },
  {
    id: 'laras',
    no: 4,
    nama: 'Laras',
    peran: 'Penata rambut',
    keahlian: ['Potong & blow', 'Creambath', 'Ruang privat'],
    bio: 'Menangani pelanggan perempuan di ruang privat. Teliti menyesuaikan potongan dengan bentuk wajah.',
    libur: [1],
    layanan: ['potong-blow', 'creambath', 'hair-spa', 'pangkas-anak'],
    warna: '#F2DEDB',
  },
  {
    id: 'sekar',
    no: 5,
    nama: 'Sekar',
    peran: 'Penata rambut',
    keahlian: ['Pewarnaan', 'Smoothing', 'Hair spa'],
    bio: 'Pegang layanan kimia yang butuh waktu lama. Bertugas siang sampai tutup.',
    libur: [5],
    shift: [720, 1260],
    layanan: ['potong-blow', 'creambath', 'hair-spa', 'pewarnaan', 'smoothing'],
    warna: '#D3E8DC',
  },
];

export const kapsterById = Object.fromEntries(KAPSTER.map((k) => [k.id, k]));

export const kapsterUntuk = (layananId) => KAPSTER.filter((k) => k.layanan.includes(layananId));

export const PENGINGAT = [
  { id: '1d', menit: 1440, label: '1 hari sebelumnya' },
  { id: '2h', menit: 120, label: '2 jam sebelumnya' },
  { id: '30m', menit: 30, label: '30 menit sebelumnya' },
];
export const pengingatById = Object.fromEntries(PENGINGAT.map((p) => [p.id, p]));

// Kartu cap: tiap kunjungan selesai = 1 cap. 6 cap = potongan senilai Pangkas Reguler.
export const CAP_PENUH = 6;
export const NILAI_HADIAH = 45000;

export const BATAS_UBAH_MENIT = 60;
export const JEDA_PESAN_MENIT = 30;
export const RENTANG_HARI = 14;
