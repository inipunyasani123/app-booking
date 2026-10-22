// Motif khas: ubin tegel kunci (lantai pangkas rambut lama) dan belang tiang pangkas.
export const VARIAN_TEGEL = {
  mint: { bg: '#D3E8DC', c1: '#1E5442', c2: '#7A1F2B', c3: '#B8853A' },
  krem: { bg: '#EFE6D7', c1: '#E2D5C1', c2: '#DDCDB6', c3: '#E7DAC6' },
  marun: { bg: '#7A1F2B', c1: '#5A1520', c2: '#93404A', c3: '#B8853A' },
  hijau: { bg: '#1E5442', c1: '#143A2E', c2: '#2E6A56', c3: '#B8853A' },
};

export function tegelSvg(varian = 'mint', ukuran = 64) {
  const { bg, c1, c2, c3 } = VARIAN_TEGEL[varian] || VARIAN_TEGEL.mint;
  const sudut = [[0, 0], [64, 0], [0, 64], [64, 64]];
  const tepi = [[32, 0], [64, 32], [32, 64], [0, 32]];
  const kelopak = 'M32 12c5.5 6 5.5 12 0 20c-5.5-8-5.5-14 0-20z';
  const daun = 'M32 32c6-1 9.5-4.5 10.5-10.5C36.5 22.5 33 26 32 32z';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ukuran}" height="${ukuran}" viewBox="0 0 64 64">` +
    `<rect width="64" height="64" fill="${bg}"/>` +
    sudut.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c1}"/><circle cx="${x}" cy="${y}" r="8.5" fill="${bg}"/><circle cx="${x}" cy="${y}" r="3.6" fill="${c3}"/>`).join('') +
    tepi.map(([x, y]) => `<path d="M${x} ${y - 4.5}l4.5 4.5-4.5 4.5-4.5-4.5z" fill="${c2}"/>`).join('') +
    [0, 90, 180, 270].map((r) => `<path d="${kelopak}" fill="${c2}" transform="rotate(${r} 32 32)"/>`).join('') +
    [0, 90, 180, 270].map((r) => `<path d="${daun}" fill="${c3}" transform="rotate(${r} 32 32)"/>`).join('') +
    `<circle cx="32" cy="32" r="3.4" fill="${bg}"/>` +
    `</svg>`
  );
}

export const BELANG = {
  pangkas: ['#7A1F2B', '#FFF6E6', '#1E5442', '#FFF6E6'],
  lembut: ['#E4D6C3', '#F4EEE3', '#E4D6C3', '#F4EEE3'],
  terisi: ['#E2D7C6', '#EAE0CF', '#E2D7C6', '#EAE0CF'],
};

export function belangSvg(warna, lebar = 6) {
  const t = lebar * 4;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 ${t} ${t}">` +
    `<rect width="${t}" height="${t}" fill="${warna[1]}"/>` +
    warna.map((c, i) => `<path d="M${i * lebar - t} ${t} L${i * lebar} 0 L${(i + 1) * lebar} 0 L${(i + 1) * lebar - t} ${t} Z M${i * lebar} ${t} L${i * lebar + t} 0 L${(i + 1) * lebar + t} 0 L${(i + 1) * lebar} ${t} Z" fill="${c}"/>`).join('') +
    `</svg>`
  );
}

export const dataUri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
