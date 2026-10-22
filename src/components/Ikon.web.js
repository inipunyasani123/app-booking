import { IKON } from './ikon-data';

// Di web ikon digambar sebagai <svg> DOM biasa: tanpa pustaka tambahan di bundel.
export default function Ikon({ nama, ukuran = 22, warna = 'currentColor', tebal = 2, isi = false }) {
  const bentuk = IKON[nama] || [];
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="none"
      stroke={warna}
      strokeWidth={tebal}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {bentuk.map((b, i) => {
        const f = isi ? warna : 'none';
        if (typeof b === 'string') return <path key={i} d={b} fill={f} />;
        if (b.c) return <circle key={i} cx={b.c[0]} cy={b.c[1]} r={b.c[2]} fill={f} />;
        return <rect key={i} x={b.r[0]} y={b.r[1]} width={b.r[2]} height={b.r[3]} rx={b.r[4]} fill={f} />;
      })}
    </svg>
  );
}
