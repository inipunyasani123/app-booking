import { useMemo } from 'react';
import { qrPath } from '../lib/qr';

export default function KodeQR({ teks, ukuran = 104, label }) {
  const q = useMemo(() => qrPath(teks), [teks]);
  return (
    <svg width={ukuran} height={ukuran} viewBox={`0 0 ${q.ukuran} ${q.ukuran}`} role="img" aria-label={label} shapeRendering="crispEdges" style={{ display: 'block', flexShrink: 0 }}>
      <rect width={q.ukuran} height={q.ukuran} fill="#FFFFFF" />
      <path d={q.d} fill="#241A1B" />
    </svg>
  );
}
