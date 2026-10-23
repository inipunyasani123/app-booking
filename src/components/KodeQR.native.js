import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { qrPath } from '../lib/qr';

export default function KodeQR({ teks, ukuran = 104, label }) {
  const q = useMemo(() => qrPath(teks), [teks]);
  return (
    <Svg width={ukuran} height={ukuran} viewBox={`0 0 ${q.ukuran} ${q.ukuran}`} accessibilityLabel={label} accessible>
      <Rect width={q.ukuran} height={q.ukuran} fill="#FFFFFF" />
      <Path d={q.d} fill="#241A1B" />
    </Svg>
  );
}
