import { tegelSvg, dataUri, BELANG } from './pola-data';

const tegelCache = {};

/** Latar berpola dekoratif. Di web cukup <div> dengan background-image CSS. */
export default function Pola({ jenis = 'tegel', varian = 'mint', ukuran = 64, style, lebarBelang = 6 }) {
  let bg;
  if (jenis === 'tegel') {
    const k = varian + ukuran;
    bg = tegelCache[k] || (tegelCache[k] = { backgroundImage: dataUri(tegelSvg(varian, ukuran)), backgroundSize: `${ukuran}px ${ukuran}px` });
  } else {
    const w = BELANG[varian] || BELANG.pangkas;
    const l = lebarBelang;
    bg = {
      backgroundImage: `repeating-linear-gradient(135deg, ${w[0]} 0 ${l}px, ${w[1]} ${l}px ${l * 2}px, ${w[2]} ${l * 2}px ${l * 3}px, ${w[3]} ${l * 3}px ${l * 4}px)`,
    };
  }
  return <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...bg, ...flat(style) }} />;
}

function flat(s) {
  if (!s) return null;
  return Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s;
}
