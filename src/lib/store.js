import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { layananById, kapsterById, pengingatById, CAP_PENUH, NILAI_HADIAH, BATAS_UBAH_MENIT, kapsterUntuk } from './data';
import { hariKe, pada, menitKe, MENIT_MS, jamDari, tanggal, hariPekan } from './waktu';
import { kapsterKosong, jadwalKapster } from './slot';

const KUNCI = 'kursi-putar:v1';

const AWAL = {
  siap: false,
  sekarang: 0,
  profil: { nama: 'Ardi', pengingat: ['1d', '2h'] },
  bookings: [],
  favorit: [],
  notif: [],
  hadiahDipakai: 0,
  banner: null,
};

let state = AWAL;
const pendengar = new Set();

function ubah(next, simpan = true) {
  state = { ...state, ...next };
  pendengar.forEach((f) => f());
  if (simpan && state.siap) tulis();
}

function tulis() {
  const { profil, bookings, favorit, notif, hadiahDipakai } = state;
  AsyncStorage.setItem(KUNCI, JSON.stringify({ v: 1, profil, bookings, favorit, notif, hadiahDipakai })).catch(() => {});
}

function langganan(f) {
  pendengar.add(f);
  return () => pendengar.delete(f);
}

/** Selector harus mengembalikan nilai stabil (potongan state), bukan objek baru. */
export function useToko(pilih) {
  return useSyncExternalStore(
    langganan,
    () => pilih(state),
    () => pilih(AWAL),
  );
}
export const ambil = () => state;

// ---------- kode & hitungan ----------
const HURUF = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function kodeBaru(ada) {
  for (;;) {
    let k = 'KP';
    for (let i = 0; i < 4; i++) k += HURUF[Math.floor(Math.random() * HURUF.length)];
    if (!ada.some((b) => b.kode === k)) return k;
  }
}
export const tampilKode = (k) => (k ? `${k.slice(0, 2)}-${k.slice(2)}` : '');

export function hitungPesanan(layananId, tambahan = []) {
  const u = layananById[layananId];
  if (!u) return { durasi: 0, total: 0, item: [] };
  const item = [u, ...tambahan.map((id) => layananById[id]).filter(Boolean)];
  return {
    item,
    durasi: item.reduce((s, l) => s + l.menit, 0),
    total: item.reduce((s, l) => s + l.harga, 0),
    mulai: !!u.mulai,
  };
}

export const capTerkumpul = (s) => s.bookings.filter((b) => b.status === 'selesai').length - s.hadiahDipakai * CAP_PENUH;
export const bisaUbah = (b, sekarang) => b.status === 'aktif' && b.mulai - sekarang > BATAS_UBAH_MENIT * MENIT_MS;

// ---------- data contoh (relatif terhadap hari ini) ----------
function cariSlot(kapsterId, h, mulaiDari, durasi, bookings) {
  const k = kapsterById[kapsterId];
  for (let m = mulaiDari; m < 21 * 60; m += 15) if (kapsterKosong(k, h, m, durasi, bookings)) return m;
  return null;
}

function buatContoh(now) {
  const hIni = hariKe(now);
  const lalu = (hariLalu, menit, layanan, kapster, tambahan = [], status = 'selesai') => {
    const p = hitungPesanan(layanan, tambahan);
    // Geser mundur ke hari ketika outlet buka dan kapster bertugas pada jam itu.
    let h = hIni - hariLalu;
    for (let i = 0; i < 7; i++, h--) {
      const j = jadwalKapster(kapsterById[kapster], h);
      if (j && menit >= j.buka && menit + p.durasi <= j.tutup) break;
    }
    const mulai = pada(h, menit);
    return {
      layanan, tambahan, kapster, mulai, durasi: p.durasi, total: p.total, status,
      dibuat: mulai - 2 * 86400e3, nama: 'Ardi', catatan: '', pengingat: ['1d'], terkirim: ['1d'],
      ...(status === 'batal' ? { alasan: 'Ada acara keluarga', dibatalkan: mulai - 86400e3 } : {}),
    };
  };
  const riwayat = [
    lalu(12, 16 * 60, 'fade-taper', 'raka'),
    lalu(30, 19 * 60 + 30, 'pangkas-reguler', 'bayu', [], 'batal'),
    lalu(41, 19 * 60 + 15, 'paket-lengkap', 'bayu'),
    lalu(68, 10 * 60 + 30, 'fade-taper', 'raka', ['pijat']),
    lalu(97, 15 * 60, 'pangkas-reguler', 'wiryo'),
  ].map((b, i) => ({ ...b, kode: 'KP' + ['R7QD', 'B4MX', 'B6CN', 'R9ZK', 'W2HT'][i] }));

  // Satu jadwal mendatang: 2–6 hari lagi, sore hari, dengan Raka.
  const bookings = [...riwayat];
  for (let d = 2; d < 9; d++) {
    const h = hIni + d;
    const m = cariSlot('raka', h, 16 * 60, 45, bookings);
    if (m == null) continue;
    const p = hitungPesanan('fade-taper');
    bookings.unshift({
      kode: 'KP7K2Q', layanan: 'fade-taper', tambahan: [], kapster: 'raka', mulai: pada(h, m), durasi: p.durasi, total: p.total,
      status: 'aktif', dibuat: now - 26 * 3600e3, nama: 'Ardi', catatan: 'Samping tipis, atas tetap agak panjang.',
      pengingat: ['1d', '2h'], terkirim: [],
    });
    break;
  }
  const akanDatang = bookings.find((b) => b.status === 'aktif');
  const notif = [
    akanDatang && {
      id: 'n-contoh-1', waktu: now - 26 * 3600e3, kode: akanDatang.kode, dibaca: false, jenis: 'tersimpan',
      judul: 'Booking tersimpan', isi: `Fade & Taper dengan Raka, ${tanggal(akanDatang.mulai, { pendek: true })} pukul ${jamDari(akanDatang.mulai)} WIB.`,
    },
    {
      id: 'n-contoh-2', waktu: riwayat[0].mulai + 50 * MENIT_MS, kode: riwayat[0].kode, dibaca: true, jenis: 'cap',
      judul: 'Kunjungan tercatat', isi: 'Terima kasih sudah datang. Satu cap masuk ke kartumu.',
    },
  ].filter(Boolean);
  return { profil: { nama: 'Ardi', pengingat: ['1d', '2h'] }, bookings, favorit: ['fade-taper', 'jenggot'], notif, hadiahDipakai: 0 };
}

// ---------- siklus: muat, detak waktu, pengingat ----------
let sudahMuat = false;
export async function muat() {
  if (sudahMuat) return;
  sudahMuat = true;
  const now = Date.now();
  let data = null;
  try {
    const s = await AsyncStorage.getItem(KUNCI);
    if (s) data = JSON.parse(s);
  } catch {}
  if (!data || data.v !== 1) data = buatContoh(now);
  state = { ...state, ...data, siap: true, sekarang: now };
  periksa(now, { diam: true });
  pendengar.forEach((f) => f());
  tulis();
}

/** Dipanggil tiap detak: tandai kunjungan selesai dan kirim pengingat yang jatuh tempo. */
export function periksa(now = Date.now(), { diam = false } = {}) {
  let berubah = false;
  const notifBaru = [];
  const bookings = state.bookings.map((b) => {
    if (b.status !== 'aktif') return b;
    const selesai = b.mulai + b.durasi * MENIT_MS;
    if (now >= selesai) {
      berubah = true;
      notifBaru.push({
        id: 'n-' + b.kode + '-cap', waktu: selesai, kode: b.kode, dibaca: false, jenis: 'cap',
        judul: 'Kunjungan tercatat', isi: 'Simulasi: jadwalmu sudah lewat dan dihitung selesai. Satu cap masuk ke kartumu.',
      });
      return { ...b, status: 'selesai' };
    }
    const jatuh = b.pengingat.filter((id) => !b.terkirim.includes(id) && now >= b.mulai - pengingatById[id].menit * MENIT_MS);
    if (!jatuh.length) return b;
    berubah = true;
    const terdekat = jatuh.sort((a, c) => pengingatById[a].menit - pengingatById[c].menit)[0];
    notifBaru.push(notifPengingat(b, now, terdekat));
    return { ...b, terkirim: [...b.terkirim, ...jatuh] };
  });
  if (!berubah) {
    if (now - state.sekarang >= 15e3) ubah({ sekarang: now }, false);
    return;
  }
  const banner = !diam && notifBaru.length ? notifBaru[notifBaru.length - 1] : state.banner;
  ubah({ sekarang: now, bookings, notif: [...notifBaru, ...state.notif].slice(0, 40), banner });
}

function notifPengingat(b, now, id, contoh = false) {
  const l = layananById[b.layanan];
  const k = kapsterById[b.kapster];
  return {
    id: 'n-' + b.kode + '-' + id + (contoh ? '-' + now : ''), waktu: now, kode: b.kode, dibaca: false, jenis: 'pengingat',
    judul: contoh ? 'Contoh pengingat' : `Pengingat: ${pengingatById[id].label.replace('sebelumnya', 'lagi')}`,
    isi: `${l.nama} dengan ${k.nama}, ${tanggal(b.mulai, { pendek: true })} pukul ${jamDari(b.mulai)} WIB. Datang 10 menit lebih awal, ya.`,
  };
}

// ---------- aksi ----------
export function buatBooking({ layanan, tambahan = [], kapster, mulai, nama, catatan, pengingat, otomatis, pakaiHadiah }) {
  const p = hitungPesanan(layanan, tambahan);
  const kode = kodeBaru(state.bookings);
  const now = Date.now();
  const potongan = pakaiHadiah ? Math.min(NILAI_HADIAH, p.total) : 0;
  const b = {
    kode, layanan, tambahan, kapster, mulai, durasi: p.durasi, total: p.total - potongan, potongan,
    status: 'aktif', dibuat: now, nama: nama.trim(), catatan: catatan.trim(), pengingat, terkirim: [], otomatis: !!otomatis,
  };
  // Pengingat yang waktunya sudah lewat saat booking dibuat tidak dikirim.
  b.terkirim = pengingat.filter((id) => now >= mulai - pengingatById[id].menit * MENIT_MS);
  const n = {
    id: 'n-' + kode + '-baru', waktu: now, kode, dibaca: false, jenis: 'tersimpan', judul: 'Booking tersimpan',
    isi: `${layananById[layanan].nama} dengan ${kapsterById[kapster].nama}, ${tanggal(mulai, { pendek: true })} pukul ${jamDari(mulai)} WIB.`,
  };
  ubah({
    bookings: [b, ...state.bookings],
    notif: [n, ...state.notif],
    hadiahDipakai: state.hadiahDipakai + (pakaiHadiah ? 1 : 0),
    profil: { ...state.profil, nama: nama.trim() || state.profil.nama },
  });
  return kode;
}

export function ubahJadwal(kode, { kapster, mulai }) {
  const now = Date.now();
  const bookings = state.bookings.map((b) => {
    if (b.kode !== kode) return b;
    const terkirim = b.pengingat.filter((id) => now >= mulai - pengingatById[id].menit * MENIT_MS);
    return { ...b, kapster, mulai, terkirim, diubah: now, riwayatUbah: [...(b.riwayatUbah || []), { dari: b.mulai, kapster: b.kapster, pada: now }] };
  });
  const b = bookings.find((x) => x.kode === kode);
  const n = {
    id: 'n-' + kode + '-ubah-' + now, waktu: now, kode, dibaca: false, jenis: 'ubah', judul: 'Jadwal diubah',
    isi: `Kini ${tanggal(b.mulai, { pendek: true })} pukul ${jamDari(b.mulai)} WIB dengan ${kapsterById[b.kapster].nama}.`,
  };
  ubah({ bookings, notif: [n, ...state.notif] });
}

export function batalkan(kode, alasan) {
  const now = Date.now();
  const bookings = state.bookings.map((b) => (b.kode === kode ? { ...b, status: 'batal', alasan, dibatalkan: now } : b));
  const b = bookings.find((x) => x.kode === kode);
  const n = {
    id: 'n-' + kode + '-batal', waktu: now, kode, dibaca: false, jenis: 'batal', judul: 'Booking dibatalkan',
    isi: `Jadwal ${tanggal(b.mulai, { pendek: true })} pukul ${jamDari(b.mulai)} WIB sudah dilepas untuk pelanggan lain.`,
  };
  const hadiahDipakai = b.potongan ? Math.max(0, state.hadiahDipakai - 1) : state.hadiahDipakai;
  ubah({ bookings, notif: [n, ...state.notif], hadiahDipakai });
}

export function aturPengingat(kode, id, nyala) {
  const now = Date.now();
  ubah({
    bookings: state.bookings.map((b) => {
      if (b.kode !== kode) return b;
      const pengingat = nyala ? [...new Set([...b.pengingat, id])] : b.pengingat.filter((x) => x !== id);
      const lewat = now >= b.mulai - pengingatById[id].menit * MENIT_MS;
      const terkirim = nyala && lewat ? [...new Set([...b.terkirim, id])] : b.terkirim;
      return { ...b, pengingat, terkirim };
    }),
  });
}

export function aturPengingatBawaan(id, nyala) {
  const p = state.profil.pengingat;
  ubah({ profil: { ...state.profil, pengingat: nyala ? [...new Set([...p, id])] : p.filter((x) => x !== id) } });
}

export function kirimContoh(kode) {
  const b = state.bookings.find((x) => x.kode === kode);
  if (!b) return;
  const n = notifPengingat(b, Date.now(), 'contoh', true);
  ubah({ notif: [n, ...state.notif].slice(0, 40), banner: n });
}

export const tutupBanner = () => ubah({ banner: null }, false);
export const bacaSemua = () => ubah({ notif: state.notif.map((n) => (n.dibaca ? n : { ...n, dibaca: true })) });
export const bacaNotif = (id) => ubah({ notif: state.notif.map((n) => (n.id === id ? { ...n, dibaca: true } : n)) });

export function alihFavorit(id) {
  const f = state.favorit;
  ubah({ favorit: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] });
}

export const simpanNama = (nama) => ubah({ profil: { ...state.profil, nama: nama.trim() || state.profil.nama } });

export function aturUlang() {
  const now = Date.now();
  state = { ...state, ...buatContoh(now), banner: null, sekarang: now };
  pendengar.forEach((f) => f());
  tulis();
}

/** Layanan yang paling sering dipesan dari riwayat selesai. */
export function palingSering(bookings) {
  const n = {};
  for (const b of bookings) if (b.status === 'selesai') n[b.layanan] = (n[b.layanan] || 0) + 1;
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([id, jumlah]) => ({ id, jumlah }));
}

export function kapsterLangganan(bookings) {
  const n = {};
  for (const b of bookings) if (b.status === 'selesai') n[b.kapster] = (n[b.kapster] || 0) + 1;
  const [id] = Object.entries(n).sort((a, b) => b[1] - a[1])[0] || [];
  return id || null;
}

export { kapsterUntuk, hariPekan, menitKe };
