import { SITUS, kapsterById } from './data';

const OG = `${SITUS.url}/og.jpg`;
const OG_ALT = 'Kursi Putar, demo aplikasi booking pangkas & salon buatan PintuWeb, tampil di layar ponsel';

// Satu sumber judul (≤60) & deskripsi (≤155) per rute: dipakai generateMetadata (HTML statis)
// dan Akar (document.title saat navigasi di sisi klien).
export const HALAMAN = {
  '/profil': { judul: 'Profil, Kartu Cap & Layanan Favorit · Kursi Putar', deskripsi: 'Kartu cap kunjungan, layanan favorit, dan pengaturan pengingat jadwal. Semua data demo tersimpan di perangkat ini saja.', noindex: true },
  '/notifikasi': { judul: 'Notifikasi · Kursi Putar', deskripsi: 'Riwayat notifikasi aplikasi: booking tersimpan, jadwal diubah atau dibatalkan, pengingat, dan cap kunjungan.', noindex: true },
  '/outlet': { judul: 'Info Outlet: Jam Buka, Peta & Kontak · Kursi Putar', deskripsi: 'Jam buka tiap hari termasuk istirahat, peta lokasi, fasilitas ruang privat, dan kontak WhatsApp outlet Kursi Putar (usaha rekaan).' },
  '/karcis': { judul: 'Karcis Booking · Kursi Putar', deskripsi: 'Karcis booking berkode: jadwal, kapster, total bayar di kasir, pengingat, serta tombol ubah atau batalkan jadwal.', noindex: true },
  '/': { judul: 'Kursi Putar: Demo Aplikasi Booking Barbershop & Salon', deskripsi: 'Demo aplikasi booking pangkas & salon: pilih layanan dan kapster, lihat jam yang benar-benar kosong, lalu ubah jadwal sendiri. Buatan PintuWeb.' },
  '/layanan': { judul: 'Layanan & Harga Pangkas dan Salon · Kursi Putar', deskripsi: 'Daftar layanan pangkas, jenggot, dan salon lengkap dengan harga dan durasi. Pilih satu, lalu lihat kapster dan jam yang masih kosong.' },
  '/jadwal': { judul: 'Jadwalku: Booking Aktif & Riwayat · Kursi Putar', deskripsi: 'Semua booking yang akan datang beserta riwayat kunjungan, lengkap dengan tombol pesan lagi untuk layanan yang sama.', noindex: true },
  '/booking/kapster': { judul: 'Pilih Kapster atau Penata · Kursi Putar', deskripsi: 'Langkah kedua booking: pilih kapster langgananmu atau biarkan aplikasi memilihkan yang jamnya paling longgar.', noindex: true },
  '/booking': { judul: 'Booking Pangkas & Salon: Pilih Layanan · Kursi Putar', deskripsi: 'Langkah pertama booking: pilih layanan pangkas atau salon, tambahkan pijat atau masker, dan lihat total durasi serta harganya.' },
  '/booking/konfirmasi': { judul: 'Konfirmasi Booking · Kursi Putar', deskripsi: 'Langkah terakhir booking: cek layanan, kapster, dan jam, isi nama di karcis, lalu atur pengingat sebelum jadwal.', noindex: true },
  '/booking/waktu': { judul: 'Pilih Tanggal & Jam Kosong · Kursi Putar', deskripsi: 'Langkah ketiga booking: jam kosong dihitung dari jam buka, istirahat, durasi layanan, dan kursi yang sudah terisi. Semua dalam WIB.', noindex: true },
  '/kapster': { judul: 'Kapster & Penata Rambut · Kursi Putar', deskripsi: 'Kenali lima kapster dan penata rambut Kursi Putar: keahlian, hari libur, jam tugas, serta layanan yang mereka tangani.' },
  '/404': { judul: 'Halaman Tidak Ditemukan · Kursi Putar', deskripsi: 'Halaman ini tidak ada di aplikasi demo Kursi Putar. Kembali ke beranda untuk booking pangkas atau salon.', noindex: true },
};

export function halamanKapster(id) {
  const k = kapsterById[id];
  if (!k) return null;
  return {
    judul: [`${k.nama}: ${k.peran} Spesialis ${k.keahlian[0]} · Kursi Putar`, `${k.nama}: ${k.peran} · Kursi Putar`].find((t) => t.length <= 60),
    deskripsi: `${k.nama} (${k.peran.toLowerCase()}): ${k.keahlian.join(', ').toLowerCase()}. ${k.bio} Lihat jadwal tugas dan jam kosongnya.`.slice(0, 155),
  };
}

export function halamanUntuk(jalur) {
  if (HALAMAN[jalur]) return HALAMAN[jalur];
  const m = /^\/kapster\/([^/]+)$/.exec(jalur);
  return (m && halamanKapster(m[1])) || HALAMAN['/404'];
}

/** Metadata per rute untuk generateMetadata (dirender ke HTML statis saat build). */
export function meta(jalur) {
  const { judul, deskripsi, noindex = false } = halamanUntuk(jalur);
  const url = SITUS.url + jalur;
  return {
    title: judul,
    description: deskripsi,
    applicationName: 'Kursi Putar',
    authors: [{ name: 'PintuWeb', url: 'https://www.pintuweb.id' }],
    creator: 'PintuWeb',
    publisher: 'PintuWeb',
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url,
      siteName: 'Kursi Putar · Demo PintuWeb',
      title: judul,
      description: deskripsi,
      images: [{ url: OG, width: 1200, height: 630, alt: OG_ALT }],
    },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi, images: [{ url: OG, alt: OG_ALT }] },
    formatDetection: { telephone: false },
  };
}
