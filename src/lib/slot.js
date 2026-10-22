import { JAM_BUKA, KAPSTER, kapsterById, layananById, JEDA_PESAN_MENIT } from './data';
import { hariPekan, hariKe, menitKe, pada } from './waktu';

export const LANGKAH = 15;

/** Jam kerja efektif kapster pada nomor hari h (WIB), atau null kalau tutup/libur. */
export function jadwalKapster(k, h) {
  const hp = hariPekan(h);
  const o = JAM_BUKA[hp];
  if (!o || k.libur.includes(hp)) return null;
  const buka = Math.max(o.buka, k.shift ? k.shift[0] : 0);
  const tutup = Math.min(o.tutup, k.shift ? k.shift[1] : 1440);
  if (tutup - buka < 30) return null;
  return { buka, tutup, istirahat: o.istirahat };
}

export const jamOutlet = (h) => JAM_BUKA[hariPekan(h)];

// PRNG kecil yang deterministik: slot terisi contoh selalu sama untuk hari & kapster yang sama.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tumpang = (a0, a1, b0, b1) => a0 < b1 && b0 < a1;

const cache = new Map();
/** Booking pelanggan lain (contoh) sebagai interval [mulai, selesai) dalam menit. */
export function sibukContoh(k, h) {
  const kunci = k.id + ':' + h;
  if (cache.has(kunci)) return cache.get(kunci);
  const j = jadwalKapster(k, h);
  const out = [];
  if (j) {
    const r = mulberry32(h * 1009 + k.no * 7919);
    const hp = hariPekan(h);
    const ramai = hp === 0 || hp === 6 ? 0.22 : hp === 5 ? 0.19 : 0.14;
    const durasiLayanan = k.layanan.map((id) => layananById[id].menit).filter((m) => m <= 120);
    let t = j.buka;
    while (t < j.tutup) {
      const sore = t >= 16 * 60 ? 0.08 : 0;
      const pagi = t < 11 * 60 ? -0.06 : 0;
      if (r() < ramai + sore + pagi) {
        const d = durasiLayanan[Math.floor(r() * durasiLayanan.length)];
        const [i0, i1] = j.istirahat;
        if (t + d <= j.tutup && !tumpang(t, t + d, i0, i1)) {
          out.push([t, t + d]);
          t += d;
          continue;
        }
      }
      t += LANGKAH;
    }
  }
  cache.set(kunci, out);
  return out;
}

/** Interval sibuk dari booking milik pengguna sendiri (status aktif). */
function sibukPengguna(bookings, kapsterId, h, kecuali) {
  const out = [];
  for (const b of bookings) {
    if (b.status !== 'aktif' || b.kapster !== kapsterId || b.kode === kecuali) continue;
    if (hariKe(b.mulai) !== h) continue;
    const m = menitKe(b.mulai);
    out.push([m, m + b.durasi]);
  }
  return out;
}

export function kapsterKosong(k, h, mulai, d, bookings, kecuali) {
  const j = jadwalKapster(k, h);
  if (!j) return false;
  if (mulai < j.buka || mulai + d > j.tutup) return false;
  if (tumpang(mulai, mulai + d, j.istirahat[0], j.istirahat[1])) return false;
  for (const [a, b] of sibukContoh(k, h)) if (tumpang(mulai, mulai + d, a, b)) return false;
  for (const [a, b] of sibukPengguna(bookings, k.id, h, kecuali)) if (tumpang(mulai, mulai + d, a, b)) return false;
  return true;
}

/**
 * Daftar slot untuk satu hari.
 * kapsterIds: kapster yang dipertimbangkan (satu orang, atau semua yang bisa menangani layanan).
 * Hasil: { slot: [{ menit, status: 'kosong'|'terisi', kapster: [id] }], istirahat, tutup, alasan }
 */
export function slotHari({ h, durasi, kapsterIds, bookings = [], kecuali, sekarang }) {
  const daftar = kapsterIds.map((id) => kapsterById[id]).filter(Boolean);
  const o = jamOutlet(h);
  if (!o) return { slot: [], alasan: 'tutup' };
  const kerja = daftar.map((k) => [k, jadwalKapster(k, h)]).filter(([, j]) => j);
  if (!kerja.length) return { slot: [], alasan: 'libur' };
  const awal = Math.min(...kerja.map(([, j]) => j.buka));
  const akhir = Math.max(...kerja.map(([, j]) => j.tutup));
  const hIni = hariKe(sekarang);
  const batasMenit = h === hIni ? menitKe(sekarang) + JEDA_PESAN_MENIT : -1;
  const slot = [];
  let lewat = 0;
  for (let t = awal; t + durasi <= akhir; t += LANGKAH) {
    // Layanan tidak boleh terpotong jam istirahat: jam mulai seperti itu tidak ditampilkan.
    if (tumpang(t, t + durasi, o.istirahat[0], o.istirahat[1])) continue;
    if (h < hIni || t < batasMenit) {
      lewat++;
      continue;
    }
    const bisa = kerja.filter(([k, j]) => t >= j.buka && t + durasi <= j.tutup);
    if (!bisa.length) continue;
    const bebas = bisa.filter(([k]) => kapsterKosong(k, h, t, durasi, bookings, kecuali)).map(([k]) => k.id);
    slot.push({ menit: t, status: bebas.length ? 'kosong' : 'terisi', kapster: bebas });
  }
  return { slot, istirahat: o.istirahat, lewat, alasan: slot.length ? null : lewat ? 'habis' : 'penuh' };
}

/** Jumlah slot kosong per hari (untuk strip tanggal). */
export function hitungKosong(args) {
  return slotHari(args).slot.filter((s) => s.status === 'kosong').length;
}

/** Beberapa slot kosong terdekat mulai sekarang. */
export function slotTerdekat({ durasi, kapsterIds, bookings, sekarang, jumlah = 4, hari = 7, jarak = 0 }) {
  const hasil = [];
  const h0 = hariKe(sekarang);
  for (let h = h0; h < h0 + hari && hasil.length < jumlah; h++) {
    let terakhir = -999;
    for (const s of slotHari({ h, durasi, kapsterIds, bookings, sekarang }).slot) {
      if (s.status !== 'kosong') continue;
      if (s.menit - terakhir < jarak) continue;
      hasil.push({ h, menit: s.menit, mulai: pada(h, s.menit), kapster: s.kapster });
      terakhir = s.menit;
      if (hasil.length >= jumlah) break;
    }
  }
  return hasil;
}

/** Pilih kapster untuk opsi "Siapa saja": yang paling sedikit jadwalnya hari itu. */
export function pilihOtomatis(ids, h) {
  return [...ids].sort((a, b) => {
    const sa = sibukContoh(kapsterById[a], h).length;
    const sb = sibukContoh(kapsterById[b], h).length;
    return sa - sb || kapsterById[a].no - kapsterById[b].no;
  })[0];
}

export const semuaKapster = KAPSTER.map((k) => k.id);
