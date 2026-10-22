import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { layananById } from './data';
import { useToko, hitungPesanan } from './store';

/**
 * Parameter alur booking dari URL (?layanan=&tambah=&kapster=&mulai=&ubah=).
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
  return { siap, layanan, tambah, p, q };
}
