import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { IKON } from './ikon-data';

export default function Ikon({ nama, ukuran = 22, warna = '#241A1B', tebal = 2, isi = false }) {
  const bentuk = IKON[nama] || [];
  const f = isi ? warna : 'none';
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 24 24" fill="none" stroke={warna} strokeWidth={tebal} strokeLinecap="round" strokeLinejoin="round" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bentuk.map((b, i) => {
        if (typeof b === 'string') return <Path key={i} d={b} fill={f} />;
        if (b.c) return <Circle key={i} cx={b.c[0]} cy={b.c[1]} r={b.c[2]} fill={f} />;
        return <Rect key={i} x={b.r[0]} y={b.r[1]} width={b.r[2]} height={b.r[3]} rx={b.r[4]} fill={f} />;
      })}
    </Svg>
  );
}
