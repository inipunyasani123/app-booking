import { create } from 'qrcode/lib/core/qrcode';

/** Path SVG untuk kode QR (modul 1×1, tepi 2 modul). Dipakai karcis & antre (QR simulasi). */
export function qrPath(teks) {
  const { modules } = create(teks, { errorCorrectionLevel: 'M' });
  const n = modules.size;
  let d = '';
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (modules.get(x, y)) {
        const a = x;
        while (x < n && modules.get(x, y)) x++;
        d += `M${a + 2} ${y + 2}h${x - a}v1h-${x - a}z`;
      } else x++;
    }
  }
  return { d, ukuran: n + 4 };
}
