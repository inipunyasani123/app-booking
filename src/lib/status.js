import { JAM_BUKA } from './data';
import { hariKe, hariPekan, menitKe, jam, HARI } from './waktu';

/** Status outlet saat ini (WIB): buka, istirahat, atau tutup + kapan buka lagi. */
export function statusOutlet(sekarang) {
  const h = hariKe(sekarang);
  const m = menitKe(sekarang);
  const o = JAM_BUKA[hariPekan(h)];
  if (o && m >= o.buka && m < o.tutup) {
    if (m >= o.istirahat[0] && m < o.istirahat[1]) {
      return { kode: 'istirahat', judul: 'Istirahat', ket: `Buka lagi ${jam(o.istirahat[1])}` };
    }
    const sisa = o.tutup - m;
    return { kode: 'buka', judul: 'Buka', ket: sisa <= 60 ? `Tutup ${jam(o.tutup)}, sebentar lagi` : `Sampai ${jam(o.tutup)}` };
  }
  // Cari pembukaan berikutnya.
  for (let d = 0; d < 8; d++) {
    const hh = h + d;
    const oo = JAM_BUKA[hariPekan(hh)];
    if (!oo) continue;
    if (d === 0 && m >= oo.buka) continue;
    const kapan = d === 0 ? 'hari ini' : d === 1 ? 'besok' : HARI[hariPekan(hh)];
    return { kode: 'tutup', judul: 'Tutup', ket: `Buka ${kapan} ${jam(oo.buka)}` };
  }
  return { kode: 'tutup', judul: 'Tutup', ket: '' };
}
