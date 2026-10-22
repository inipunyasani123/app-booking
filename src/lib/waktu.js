// Semua logika waktu memakai WIB (UTC+7, tanpa musim panas), apa pun zona waktu perangkat.
export const WIB_MS = 7 * 3600e3;
export const HARI_MS = 86400e3;
export const MENIT_MS = 60e3;

export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const HARI_PENDEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

/** Nomor hari (WIB) sejak epoch. */
export const hariKe = (ms) => Math.floor((ms + WIB_MS) / HARI_MS);
/** Epoch ms untuk pukul 00.00 WIB pada nomor hari h. */
export const awalHari = (h) => h * HARI_MS - WIB_MS;
/** Epoch ms untuk menit ke-m (sejak 00.00 WIB) pada hari h. */
export const pada = (h, menit) => awalHari(h) + menit * MENIT_MS;
/** Menit sejak 00.00 WIB. */
export const menitKe = (ms) => Math.floor((((ms + WIB_MS) % HARI_MS) + HARI_MS) % HARI_MS / MENIT_MS);

export function bagian(ms) {
  const d = new Date(ms + WIB_MS);
  return { th: d.getUTCFullYear(), bl: d.getUTCMonth(), tg: d.getUTCDate(), hr: d.getUTCDay(), j: d.getUTCHours(), m: d.getUTCMinutes() };
}
/** Hari dalam pekan (0 = Minggu) untuk nomor hari h. */
export const hariPekan = (h) => ((h + 4) % 7 + 7) % 7; // 1 Jan 1970 = Kamis

const dua = (n) => (n < 10 ? '0' : '') + n;
/** 990 -> "16.30" */
export const jam = (menit) => `${dua(Math.floor(menit / 60))}.${dua(menit % 60)}`;
export const jamDari = (ms) => jam(menitKe(ms));

export function tanggal(ms, { pendek = false, tahun = false, hari = true } = {}) {
  const b = bagian(ms);
  const bln = pendek ? BULAN_PENDEK[b.bl] : BULAN[b.bl];
  const nh = pendek ? HARI_PENDEK[b.hr] : HARI[b.hr];
  return `${hari ? nh + ', ' : ''}${b.tg} ${bln}${tahun ? ' ' + b.th : ''}`;
}

/** "Hari ini" / "Besok" / "Lusa" atau null. */
export function sebutanHari(h, hIni) {
  if (h === hIni) return 'Hari ini';
  if (h === hIni + 1) return 'Besok';
  if (h === hIni + 2) return 'Lusa';
  if (h === hIni - 1) return 'Kemarin';
  return null;
}

export function tanggalRamah(ms, sekarang) {
  const s = sebutanHari(hariKe(ms), hariKe(sekarang));
  return s ? `${s}, ${tanggal(ms, { hari: false, pendek: true })}` : tanggal(ms, { pendek: true });
}

export function sapaan(ms) {
  const m = menitKe(ms);
  if (m < 4 * 60) return 'Selamat malam';
  if (m < 11 * 60) return 'Selamat pagi';
  if (m < 15 * 60) return 'Selamat siang';
  if (m < 18 * 60) return 'Selamat sore';
  return 'Selamat malam';
}

/** Durasi menit -> "45 mnt" / "1 jam 15 mnt". */
export function durasi(menit) {
  if (menit < 60) return `${menit} mnt`;
  const j = Math.floor(menit / 60);
  const s = menit % 60;
  return s ? `${j} jam ${s} mnt` : `${j} jam`;
}

/** Selisih ke depan yang ramah: "dalam 25 menit", "dalam 3 jam", "2 hari lagi". */
export function hitungMundur(ms, sekarang) {
  const sel = ms - sekarang;
  if (sel <= 0) return 'sedang berlangsung';
  const mnt = Math.round(sel / MENIT_MS);
  if (mnt < 60) return `dalam ${mnt} menit`;
  const hH = hariKe(ms) - hariKe(sekarang);
  if (hH === 0) return `dalam ${Math.round(mnt / 60)} jam`;
  if (hH === 1) return 'besok';
  if (hH === 2) return 'lusa';
  return `${hH} hari lagi`;
}

export function rupiah(n) {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp${s}`;
}
