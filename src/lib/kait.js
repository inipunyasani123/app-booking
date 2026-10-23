import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { layananById } from './data';
import { useToko, hitungPesanan } from './store';

// Parameter yang dibawa dari langkah ke langkah booking.
const BAWA = ['untuk', 'nama', 'privat', 'gaya', 'setelah', 'tambah'];

/** Ambil parameter alur dari URL lalu tambahkan/ganti dengan `ekstra` (nilai kosong dibuang). */
export function teruskan(q, ekstra = {}) {
  const o = {};
  for (const k of BAWA) if (q[k] != null && q[k] !== '') o[k] = String(q[k]);
  for (const [k, v] of Object.entries(ekstra)) {
    if (v == null || v === '') delete o[k];
    else o[k] = String(v);
  }
  return o;
}

/**
 * Parameter alur booking dari URL (?layanan=&tambah=&kapster=&mulai=&ubah=&untuk=&nama=&privat=&gaya=&setelah=).
 * Saat HTML statis dibuat parameter URL belum ada, jadi isi yang bergantung padanya
 * hanya dirender setelah `siap` (data perangkat termuat, sesudah hidrasi).
 */
export function usePesanan() {
  const q = useLocalSearchParams();
  const siap = useToko((s) => s.siap);
  const id = q.layanan ? String(q.layanan) : '';
  const layanan = layananById[id] && layananById[id].kat !== 'tambahan' ? id : null;
  const tambahStr = q.tambah ? String(q.tambah) : '';
  const tambah = useMemo(() => tambahStr.split(',').filter((x) => layananById[x] && layananById[x].kat === 'tambahan'), [tambahStr]);
  const p = useMemo(() => hitungPesanan(layanan, tambah), [layanan, tambah]);
  const untuk = q.untuk === 'anak' || q.untuk === 'lain' ? String(q.untuk) : 'saya';
  const privat = q.privat === '1';
  return { siap, layanan, tambah, p, q, untuk, privat, namaUntuk: q.nama ? String(q.nama) : '' };
}
