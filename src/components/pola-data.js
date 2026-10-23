// Motif khas Kursi Putar: jok kulit berkancing (tufted, seperti kursi pangkas lama)
// dan belang tiang pangkas. Tegel sengaja tidak dipakai (motif itu milik demo lain).
export const VARIAN_KULIT = {
  marun: { dasar: '#7A1F2B', gembung: '#8A2A36', jahit: '#5A1520', kancing: '#3E0E15', kilau: '#A04450' },
  hijau: { dasar: '#1E5442', gembung: '#266150', jahit: '#143A2E', kancing: '#0E2A21', kilau: '#3A7A64' },
};

/** Ubin jok kulit: garis jahitan diagonal, gembungan di tengah tiap belah ketupat, kancing di simpul. */
export function kulitSvg(varian = 'marun', ukuran = 40) {
  const { dasar, gembung, jahit, kancing, kilau } = VARIAN_KULIT[varian] || VARIAN_KULIT.marun;
  const tengah = [[20, 0], [0, 20], [40, 20], [20, 40]];
  const simpul = [[0, 0], [40, 0], [0, 40], [40, 40], [20, 20]];
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ukuran}" height="${ukuran}" viewBox="0 0 40 40">` +
    `<rect width="40" height="40" fill="${dasar}"/>` +
    tengah.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="11" fill="${gembung}"/><ellipse cx="${x - 3}" cy="${y - 4}" rx="4.5" ry="3" fill="${kilau}" opacity=".55"/>`).join('') +
    `<path d="M0 0L40 40M40 0L0 40" stroke="${jahit}" stroke-width="1.6"/>` +
    `<path d="M0 0L40 40M40 0L0 40" stroke="${kilau}" stroke-width=".6" stroke-dasharray="1.6 2.4" transform="translate(.9 0)" opacity=".7"/>` +
    simpul.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${kancing}"/><circle cx="${x - 0.8}" cy="${y - 0.8}" r=".9" fill="${kilau}"/>`).join('') +
    `</svg>`
  );
}

export const BELANG = {
  pangkas: ['#7A1F2B', '#FFF6E6', '#1E5442', '#FFF6E6'],
  lembut: ['#CDE3D6', '#E3EFE8', '#CDE3D6', '#E3EFE8'],
  terisi: ['#C9DDD1', '#D6E7DD', '#C9DDD1', '#D6E7DD'],
  porselen: ['#D3E6DB', '#DBEBE2', '#D3E6DB', '#DBEBE2'],
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
