import { View, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { kulitSvg, belangSvg, BELANG } from './pola-data';

// Ubin dijadikan <pattern>; isi ubin diskalakan dari viewBox-nya ke ukuran tampil u.
function polaPenuh(tile, u) {
  const isi = tile.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const vb = Number(tile.match(/viewBox="0 0 ([\d.]+)/)[1]);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><pattern id="p" width="${u}" height="${u}" patternUnits="userSpaceOnUse"><g transform="scale(${u / vb})">${isi}</g></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`;
}

export default function Pola({ jenis = 'kulit', varian = 'marun', ukuran = 40, style, lebarBelang = 6 }) {
  const xml = jenis === 'kulit' ? polaPenuh(kulitSvg(varian, ukuran), ukuran) : polaPenuh(belangSvg(BELANG[varian] || BELANG.pangkas, lebarBelang), lebarBelang * 4);
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <SvgXml xml={xml} width="100%" height="100%" />
    </View>
  );
}
