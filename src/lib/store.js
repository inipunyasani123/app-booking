import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { layananById, kapsterById, pengingatById, CAP_PENUH, NILAI_HADIAH, BATAS_UBAH_MENIT, CHECKIN_SEBELUM, CHECKIN_SESUDAH, ANTRE_DETIK_PER_ORANG, KAPSTER, kapsterUntuk } from './data';
import { hariKe, pada, menitKe, MENIT_MS, jamDari, jam, tanggal, hariPekan } from './waktu';
import { kapsterKosong, jadwalKapster, kondisiAntre, pilihOtomatis } from './slot';

// v2 (23 Okt): untuk siapa, check-in, antre datang langsung, panduan, notifikasi contoh lebih lengkap.
const KUNCI = 'kursi-putar:v2';

const AWAL = {
  siap: false,
  sekarang: 0,
  profil: { nama: 'Ardi', pengingat: ['1d', '2h'] },
  bookings: [],
  favorit: [],
  notif: [],
  hadiahDipakai: 0,
  antre: null,
  panduanTutup: false,
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
  const { profil, bookings, favorit, notif, hadiahDipakai, antre, panduanTutup } = state;
  AsyncStorage.setItem(KUNCI, JSON.stringify({ v: 2, profil, bookings, favorit, notif, hadiahDipakai, antre, panduanTutup })).catch(() => {});
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
export const bisaUbah = (b, sekarang) => b.status === 'aktif' && !b.hadir && b.mulai - sekarang > BATAS_UBAH_MENIT * MENIT_MS;
/** Jendela "Saya sudah sampai": 30 menit sebelum sampai 15 menit sesudah jam mulai. */
export const jendelaCheckin = (b) => [b.mulai - CHECKIN_SEBELUM * MENIT_MS, b.mulai + CHECKIN_SESUDAH * MENIT_MS];
export const bisaCheckin = (b, sekarang) => {
  const [a, z] = jendelaCheckin(b);
  return b.status === 'aktif' && !b.hadir && sekarang >= a && sekarang <= z;
};
export const atasNama = (b) => (b.untuk && b.untuk.jenis === 'anak' ? `${b.nama} (anak)` : b.nama);

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
      dibuat: mulai - 2 * 86400e3, nama: 'Ardi', untuk: { jenis: 'saya' }, catatan: '', pengingat: ['1d'], terkirim: ['1d'],
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
      status: 'aktif', dibuat: pada(hIni - 1, 19 * 60 + 20), nama: 'Ardi', untuk: { jenis: 'saya' }, catatan: 'Mid fade · atas 4 cm',
      pengingat: ['1d', '2h'], terkirim: [],
    });
    break;
  }
  const akanDatang = bookings.find((b) => b.status === 'aktif');
  // Notifikasi contoh: semua di jam wajar (08–20) dan tidak ada yang "dari masa depan".
  const hariTerakhir = (hp, menit) => {
    for (let h = hIni; h > hIni - 8; h--) if (hariPekan(h) === hp && pada(h, menit) < now) return pada(h, menit);
    return null;
  };
  const mIni = menitKe(now);
  const hKosong = mIni >= 9 * 60 + 5 ? hIni : hIni - 1;
  let kosong = null;
  for (const id of ['raka', 'bayu', 'wiryo']) {
    const m = cariSlot(id, hKosong, 17 * 60, 30, bookings);
    if (m != null && m <= 20 * 60) {
      kosong = { id, m };
      break;
    }
  }
  const capTerakhir = riwayat[0];
  const digeser = riwayat[2];
  const notif = [
    akanDatang && {
      id: 'n-contoh-1', waktu: akanDatang.dibuat, kode: akanDatang.kode, dibaca: false, jenis: 'tersimpan',
      judul: 'Booking tersimpan', isi: `Fade & Taper dengan Raka, ${tanggal(akanDatang.mulai, { pendek: true })} pukul ${jamDari(akanDatang.mulai)} WIB.`,
    },
    kosong && {
      id: 'n-contoh-kosong', waktu: pada(hKosong, 9 * 60 + 5), dibaca: false, jenis: 'info',
      judul: `Kursi ${kapsterById[kosong.id].nama} kosong ${jam(kosong.m)}`,
      isi: `${hKosong === hIni ? 'Hari ini' : 'Kemarin'} masih ada jam kosong ${jam(kosong.m)} untuk pangkas 30 menit. Booking dari aplikasi supaya tidak antre.`,
    },
    hariTerakhir(1, 19 * 60) && {
      id: 'n-contoh-selasa', waktu: hariTerakhir(1, 19 * 60), dibaca: true, jenis: 'info',
      judul: 'Besok Selasa outlet tutup', isi: 'Kursi istirahat sehari. Booking untuk Rabu sudah bisa dari sekarang.',
    },
    hariTerakhir(4, 19 * 60) && {
      id: 'n-contoh-jumat', waktu: hariTerakhir(4, 19 * 60), dibaca: true, jenis: 'info',
      judul: 'Jumat buka 13.00', isi: 'Kami buka setelah salat Jumat dan istirahat sebentar saat magrib (18.00–18.30).',
    },
    {
      id: 'n-contoh-cap', waktu: capTerakhir.mulai + capTerakhir.durasi * MENIT_MS + 5 * MENIT_MS, kode: capTerakhir.kode, dibaca: true, jenis: 'cap',
      judul: 'Cap ke-4 masuk', isi: 'Terima kasih sudah datang. Dua kunjungan lagi untuk potongan Rp45.000.',
    },
    {
      id: 'n-contoh-h1', waktu: capTerakhir.mulai - 86400e3, kode: capTerakhir.kode, dibaca: true, jenis: 'pengingat',
      judul: 'Pengingat: 1 hari lagi', isi: `Fade & Taper dengan Raka besok pukul ${jamDari(capTerakhir.mulai)} WIB. Datang 10 menit lebih awal, ya.`,
    },
    {
      id: 'n-contoh-geser', waktu: digeser.mulai - 3 * 3600e3, kode: digeser.kode, dibaca: true, jenis: 'ubah',
      judul: 'Jadwal digeser outlet', isi: `Bayu minta jadwalmu mundur 15 menit karena pelanggan sebelumnya molor. Kini pukul ${jamDari(digeser.mulai)} WIB.`,
    },
    {
      id: 'n-contoh-batal', waktu: riwayat[1].dibatalkan, kode: riwayat[1].kode, dibaca: true, jenis: 'batal',
      judul: 'Booking dibatalkan', isi: `Jadwal ${tanggal(riwayat[1].mulai, { pendek: true })} pukul ${jamDari(riwayat[1].mulai)} WIB sudah dilepas untuk pelanggan lain.`,
    },
  ].filter((n) => n && n.waktu < now);
  return { profil: { nama: 'Ardi', pengingat: ['1d', '2h'] }, bookings, favorit: ['fade-taper', 'jenggot'], notif, hadiahDipakai: 0, antre: null, panduanTutup: false };
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
  if (!data || data.v !== 2) data = buatContoh(now);
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
  let antre = state.antre;
  if (antre && antre.status === 'menunggu') {
    const jalan = Math.max(0, now - antre.palingCepat);
    if (jalan >= (antre.depanAwal * ANTRE_DETIK_PER_ORANG + 12) * 1000) {
      berubah = true;
      antre = { ...antre, status: 'dipanggil', dipanggil: now };
      notifBaru.push({
        id: 'n-antre-' + antre.nomor + '-' + now, waktu: now, dibaca: false, jenis: 'antre', tautan: '/antre',
        judul: `Giliranmu! Nomor ${antre.nomor}`, isi: `Silakan ke kursi ${kapsterById[antre.kapster].nama}. ${layananById[antre.layanan].nama} atas nama ${antre.nama}.`,
      });
    }
  }
  if (!berubah) {
    if (now - state.sekarang >= 15e3) ubah({ sekarang: now }, false);
    return;
  }
  const banner = !diam && notifBaru.length ? notifBaru[notifBaru.length - 1] : state.banner;
  ubah({ sekarang: now, bookings, antre, notif: [...notifBaru, ...state.notif].slice(0, 40), banner });
}

/** Detak manual (layar antre memperbarui tiap beberapa detik). */
export const detak = () => periksa(Date.now());

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
export function buatBooking({ layanan, tambahan = [], kapster, mulai, nama, catatan, pengingat, otomatis, pakaiHadiah, untuk = { jenis: 'saya' } }) {
  const p = hitungPesanan(layanan, tambahan);
  const kode = kodeBaru(state.bookings);
  const now = Date.now();
  const potongan = pakaiHadiah ? Math.min(NILAI_HADIAH, p.total) : 0;
  const b = {
    kode, layanan, tambahan, kapster, mulai, durasi: p.durasi, total: p.total - potongan, potongan,
    status: 'aktif', dibuat: now, nama: nama.trim(), untuk, catatan: catatan.trim(), pengingat, terkirim: [], otomatis: !!otomatis,
  };
  // Pengingat yang waktunya sudah lewat saat booking dibuat tidak dikirim.
  b.terkirim = pengingat.filter((id) => now >= mulai - pengingatById[id].menit * MENIT_MS);
  const n = {
    id: 'n-' + kode + '-baru', waktu: now, kode, dibaca: false, jenis: 'tersimpan', judul: 'Booking tersimpan',
    isi: `${layananById[layanan].nama} dengan ${kapsterById[kapster].nama}, ${tanggal(mulai, { pendek: true })} pukul ${jamDari(mulai)} WIB, atas nama ${atasNama(b)}.`,
  };
  ubah({
    bookings: [b, ...state.bookings],
    notif: [n, ...state.notif],
    hadiahDipakai: state.hadiahDipakai + (pakaiHadiah ? 1 : 0),
    profil: untuk.jenis === 'saya' ? { ...state.profil, nama: nama.trim() || state.profil.nama } : state.profil,
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

export function checkIn(kode) {
  const now = Date.now();
  const b = state.bookings.find((x) => x.kode === kode);
  if (!b) return;
  const n = {
    id: 'n-' + kode + '-hadir', waktu: now, kode, dibaca: false, jenis: 'hadir', judul: 'Kedatanganmu tercatat',
    isi: `Silakan duduk di ruang tunggu. ${kapsterById[b.kapster].nama} memanggil sesuai jadwal pukul ${jamDari(b.mulai)} WIB.`,
  };
  ubah({ bookings: state.bookings.map((x) => (x.kode === kode ? { ...x, hadir: now } : x)), notif: [n, ...state.notif], banner: n });
}

// ---------- antre datang langsung ----------
export function ambilAntre({ layanan, nama, untuk = { jenis: 'saya' } }) {
  const now = Date.now();
  const k = kondisiAntre(now, state.bookings);
  if (!k.terima) return null;
  const h = hariKe(now);
  const bisa = kapsterUntuk(layanan).filter((x) => jadwalKapster(x, h));
  const kosongIds = k.kursi.filter((x) => x.status === 'kosong' && bisa.some((b) => b.id === x.kapster)).map((x) => x.kapster);
  const kapster = kosongIds[0] || pilihOtomatis((bisa.length ? bisa : KAPSTER).map((x) => x.id), h);
  const nomorDasar = 3 + Math.floor(Math.max(0, menitKe(now) - 540) / 14);
  const palingCepat = k.awal && k.berikut ? pada(k.berikut.h, k.berikut.menit) : now;
  const antre = {
    nomor: 'A' + String(nomorDasar + k.menunggu + 1).padStart(2, '0'), layanan, nama: nama.trim() || state.profil.nama, untuk, kapster,
    diambil: now, palingCepat, depanAwal: k.menunggu, perkiraan: k.perkiraan, status: 'menunggu',
  };
  const n = {
    id: 'n-antre-ambil-' + now, waktu: now, dibaca: true, jenis: 'antre', tautan: '/antre', judul: `Nomor antre ${antre.nomor}`,
    isi: `${k.menunggu ? `${k.menunggu} orang sebelum kamu` : 'Kamu yang berikutnya'} · perkiraan ±${k.perkiraan} menit.`,
  };
  ubah({ antre, notif: [n, ...state.notif].slice(0, 40) });
  return antre;
}

export function batalAntre() {
  if (!state.antre) return;
  const now = Date.now();
  const n = { id: 'n-antre-batal-' + now, waktu: now, dibaca: true, jenis: 'batal', tautan: '/antre', judul: `Antre ${state.antre.nomor} dibatalkan`, isi: 'Nomormu dilepas. Kamu bisa ambil nomor lagi kapan saja selama outlet buka.' };
  ubah({ antre: null, notif: [n, ...state.notif].slice(0, 40) });
}

/** Simulasi selesai dilayani: dicatat sebagai kunjungan (masuk riwayat & kartu cap). */
export function selesaiAntre() {
  const a = state.antre;
  if (!a) return;
  const now = Date.now();
  const p = hitungPesanan(a.layanan);
  const b = {
    kode: kodeBaru(state.bookings), layanan: a.layanan, tambahan: [], kapster: a.kapster, mulai: a.dipanggil || now, durasi: p.durasi, total: p.total,
    status: 'selesai', dibuat: a.diambil, nama: a.nama, untuk: a.untuk, catatan: '', pengingat: [], terkirim: [], antre: a.nomor,
  };
  const n = { id: 'n-' + b.kode + '-cap', waktu: now, kode: b.kode, dibaca: false, jenis: 'cap', judul: 'Kunjungan tercatat', isi: `Antre ${a.nomor} selesai. Satu cap masuk ke kartumu.` };
  ubah({ antre: null, bookings: [b, ...state.bookings], notif: [n, ...state.notif].slice(0, 40) });
}

export const tutupPanduan = (tutup = true) => ubah({ panduanTutup: tutup });

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
