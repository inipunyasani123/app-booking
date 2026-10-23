// Pembuat gambar Kursi Putar: ilustrasi kapster (buatan sendiri, tanpa wajah orang sungguhan),
// peta ilustrasi, ikon aplikasi/PWA, dan olahan foto CC0 (sumber di public/img/SUMBER.md).
// Jalankan: node scripts/gambar.mjs   (butuh devDependency sharp; foto asli diunduh ke .cache/foto)
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { kulitSvg } from '../src/components/pola-data.js';

const AKAR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const IMG = path.join(AKAR, 'public/img');
const CACHE = path.join(AKAR, '.cache/foto');
const UA = 'PintuWebDemo/1.0 (https://www.pintuweb.id; cs@pintuweb.id)';

const W = { kertas: '#E3EFE8', kertasTua: '#D2E5DA', putih: '#FAFDFB', tinta: '#241A1B', marun: '#7A1F2B', marunTua: '#5A1520', mint: '#C2DFCD', hijau: '#1E5442', kuningan: '#B8853A', krem: '#FFF6E6', garis: '#C6DBCF' };

// ---------- ilustrasi kapster ----------
const tubuh = ({ kulit, kaos, celemek, tali = celemek, saku = W.kuningan }) => `
  <path d="M30 330C30 252 86 222 160 222s130 30 130 108z" fill="${kaos}"/>
  <rect x="134" y="176" width="52" height="60" rx="22" fill="${kulit}"/>
  <path d="M134 212c10 10 42 10 52 0v14c-10 10-42 10-52 0z" fill="#000" opacity=".12"/>
  <path d="M112 240h96l14 90H98z" fill="${celemek}"/>
  <path d="M112 240l-14-12M208 240l14-12" stroke="${tali}" stroke-width="7" stroke-linecap="round"/>
  <rect x="168" y="268" width="30" height="26" rx="5" fill="#000" opacity=".16"/>
  <g transform="translate(176 250) rotate(18)" stroke="${saku}" stroke-width="3.5" fill="none" stroke-linecap="round"><circle cx="0" cy="22" r="4.5"/><circle cx="9" cy="22" r="4.5"/><path d="M2 18 9 0M7 18 0 0"/></g>`;
const kepala = (kulit) => `
  <ellipse cx="106" cy="148" rx="11" ry="16" fill="${kulit}"/><ellipse cx="214" cy="148" rx="11" ry="16" fill="${kulit}"/>
  <ellipse cx="160" cy="140" rx="54" ry="63" fill="${kulit}"/>
  <ellipse cx="148" cy="118" rx="22" ry="14" fill="#fff" opacity=".1"/>`;
const latar = (warna, aksen) => `
  <rect width="320" height="320" fill="${warna}"/>
  <circle cx="250" cy="70" r="90" fill="${aksen}" opacity=".35"/>
  <circle cx="60" cy="250" r="40" fill="${aksen}" opacity=".25"/>`;

const KAPSTER = {
  raka: () => `${latar(W.mint, '#fff')}${tubuh({ kulit: '#B07650', kaos: W.hijau, celemek: W.marun })}${kepala('#B07650')}
    <path d="M106 132c-3-48 22-68 56-68 36 0 58 20 52 68-6-16-20-26-52-26-30 0-46 9-56 26z" fill="#241712"/>
    <path d="M118 86c10-8 26-12 42-12M140 76c12-4 30-3 44 4M170 72c14 2 26 8 34 18" stroke="#3a2a22" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="M106 134c0 12 2 22 6 30" stroke="#241712" stroke-width="7" opacity=".35" stroke-linecap="round"/><path d="M214 134c0 12-2 22-6 30" stroke="#241712" stroke-width="7" opacity=".35" stroke-linecap="round"/>
    <path d="M128 98l8 10" stroke="${W.mint}" stroke-width="3" stroke-linecap="round"/>`,
  bayu: () => `${latar(W.kuningan, '#fff')}${tubuh({ kulit: '#8E5A3C', kaos: W.krem, celemek: W.hijau, saku: W.krem })}${kepala('#8E5A3C')}
    <path d="M104 134c-8-54 22-82 62-78 40 4 56 34 48 78-8-22-24-32-54-30-28 2-46 12-56 30z" fill="#1d1310"/>
    <path d="M120 82c14-22 46-30 72-18 14 6 22 18 22 30-16-14-40-20-62-14-14 4-24 2-32 2z" fill="#2c1d17"/>
    <path d="M106 150c2 44 26 66 54 66s52-22 54-66c-10 24-26 36-54 36s-44-12-54-36z" fill="#1d1310"/>
    <path d="M138 178c8-6 16-6 22-2 6-4 14-4 22 2-8 6-36 6-44 0z" fill="#1d1310"/>`,
  wiryo: () => `${latar(W.kertasTua, '#fff')}${tubuh({ kulit: '#C08A62', kaos: '#3E5C7A', celemek: W.marun })}${kepala('#C08A62')}
    <path d="M108 128c-2-36 20-56 52-56 34 0 54 20 52 56-4-14-14-26-44-28-24-1-40 6-52 22z" fill="#D9D3CA"/>
    <path d="M150 100c10-10 30-14 46-6" stroke="#bfb7ab" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M136 178c10-8 18-8 24-4 6-4 14-4 24 4-6 8-42 8-48 0z" fill="#D9D3CA"/>
    <g fill="none" stroke="#3a2a20" stroke-width="4"><circle cx="138" cy="146" r="15"/><circle cx="182" cy="146" r="15"/><path d="M153 146h14M123 144l-14-4M197 144l14-4"/></g>
    <g fill="${W.kuningan}"><circle cx="70" cy="290" r="4"/><circle cx="90" cy="270" r="4"/><circle cx="250" cy="290" r="4"/><circle cx="230" cy="270" r="4"/></g>`,
  laras: () => `${latar(W.marunMuda || '#F2DEDB', '#fff')}
    <path d="M58 330c4-62 40-100 102-102 62 2 98 40 102 102z" fill="#2E6A56"/>
    <rect x="134" y="180" width="52" height="40" rx="20" fill="#C9906A"/>
    <path d="M88 152c0-62 32-92 72-92s72 30 72 92c0 40-18 70-40 84h-64c-22-14-40-44-40-84z" fill="${W.hijau}"/>
    <ellipse cx="160" cy="146" rx="44" ry="54" fill="#C9906A"/>
    <path d="M118 112c10-22 26-32 42-32s32 10 42 32c-14-8-28-12-42-12s-28 4-42 12z" fill="#174535"/>
    <path d="M104 214c18 18 36 26 56 26s38-8 56-26" stroke="#174535" stroke-width="6" fill="none" opacity=".5"/>
    <circle cx="198" cy="226" r="9" fill="${W.kuningan}"/><circle cx="198" cy="226" r="4" fill="${W.krem}"/>
    <path d="M118 262h84l10 68H108z" fill="${W.marun}"/>`,
  sekar: () => `${latar(W.mint, '#fff')}
    <path d="M94 156c-6-62 26-94 68-94s72 32 66 94c-2 46 12 80 22 106H72c10-26 24-60 22-106z" fill="#3B2418"/>
    ${tubuh({ kulit: '#D29B74', kaos: W.krem, celemek: W.tinta, tali: W.tinta, saku: W.kuningan })}${kepala('#D29B74')}
    <path d="M104 130c6-44 34-64 66-62 30 2 48 22 46 56-20-24-50-30-80-20-14 4-24 14-32 26z" fill="#3B2418"/>
    <path d="M196 84c18 22 22 60 18 98" stroke="${W.marun}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M186 80c14 20 18 44 14 70" stroke="${W.kuningan}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>`,
};

async function kapster() {
  for (const [id, f] of Object.entries(KAPSTER)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">${f()}</svg>`;
    await fs.writeFile(path.join(AKAR, `design/kapster-${id}.svg`), svg);
    await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(path.join(IMG, `kapster-${id}.webp`));
  }
}

// ---------- katalog gaya: siluet kepala tampak samping, tanpa wajah ----------
const RAMBUT = '#2A1D18';
const fade = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, a]) => `<stop offset="${o}" stop-color="${RAMBUT}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
// Rambut samping = bagian belakang kepala sampai garis pelipis, dipotong mengikuti kontur kepala.
const SISI = 'M30 34H124C118 66 114 100 121 146H30Z';
const dasar = (skala = 1) => `<g transform="translate(100 112) scale(${skala}) translate(-100 -112)">
  <defs><clipPath id="kepala"><ellipse cx="102" cy="92" rx="44" ry="54"/></clipPath></defs>
  <path d="M36 204c8-30 34-46 64-46s56 16 64 46z" fill="${W.marun}"/>
  <path d="M60 176c10-8 24-12 40-12s30 4 40 12" stroke="${W.krem}" stroke-width="4" fill="none" opacity=".7"/>
  <rect x="84" y="124" width="34" height="40" rx="14" fill="#B07A55"/>
  <ellipse cx="102" cy="92" rx="44" ry="54" fill="#C8916A"/>`;
const telinga = `<ellipse cx="90" cy="100" rx="8" ry="12" fill="#B07A55"/><path d="M88 94c3 2 4 6 2 10" stroke="#9A6847" stroke-width="2" fill="none"/></g>`;
const sisi = (isi) => `<path d="${SISI}" fill="${isi}" clip-path="url(#kepala)"/>`;
const ATAS = 'M58 86C56 52 78 36 104 36c28 0 46 18 44 44-8-10-24-14-44-14-22 0-38 8-46 20z';
const GAYA_SVG = {
  'fade-rendah': () => `<defs>${fade('f', [[0, 0.95], [0.55, 0.92], [0.8, 0.25], [0.9, 0]])}</defs>${dasar()}${sisi('url(#f)')}<path d="${ATAS}" fill="${RAMBUT}"/>${telinga}`,
  'mid-fade': () => `<defs>${fade('f', [[0, 0.95], [0.38, 0.85], [0.6, 0.15], [0.7, 0]])}</defs>${dasar()}${sisi('url(#f)')}<path d="${ATAS}" fill="${RAMBUT}"/>${telinga}`,
  taper: () => `<defs>${fade('f', [[0, 0.96], [0.75, 0.94], [0.9, 0.35], [1, 0]])}</defs>${dasar()}${sisi('url(#f)')}<path d="M56 92C54 52 78 34 104 34c30 0 48 18 46 46-8-10-26-14-46-14-24 0-40 10-48 26z" fill="${RAMBUT}"/>${telinga}`,
  crop: () => `<defs>${fade('f', [[0, 0.95], [0.4, 0.7], [0.62, 0]])}</defs>${dasar()}${sisi('url(#f)')}
    <path d="M58 84C56 50 78 36 104 36c24 0 42 12 46 30l-6 2 4 6-8 0 2 6-8-2 0 6-8-4c-10-6-24-8-40-6-14 2-24 6-28 10z" fill="${RAMBUT}"/>
    <path d="M78 46l6 8M92 42l5 9M106 40l4 9M120 42l3 9" stroke="#4A382F" stroke-width="3" stroke-linecap="round"/>${telinga}`,
  'belah-pinggir': () => `${dasar()}${sisi(RAMBUT)}
    <path d="M56 104C50 56 74 32 104 32c32 0 52 20 48 50-10-14-32-20-54-18-20 2-34 12-42 40z" fill="${RAMBUT}"/>
    <path d="M70 52c12-10 30-14 46-12" stroke="#6A5448" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M100 46c18-2 34 4 42 16" stroke="#5A463C" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>${telinga}`,
  undercut: () => `${dasar()}<g opacity=".24">${sisi(RAMBUT)}</g>
    <path d="M62 74C64 40 92 22 124 26c22 3 36 18 32 38-16-12-42-14-64-10-14 2-24 10-30 20z" fill="${RAMBUT}"/>
    <path d="M90 34c18-6 40-4 56 8" stroke="#5A463C" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>${telinga}`,
  cepak: () => `${dasar()}<g opacity=".86">${sisi(RAMBUT)}<path d="M58 100C54 58 76 40 102 40c28 0 46 18 44 42-6-4-16-6-24-6H72c-8 4-12 14-14 24z" fill="${RAMBUT}"/></g>${telinga}`,
  'pangkas-anak': () => `<defs>${fade('f', [[0, 0.95], [0.7, 0.9], [0.85, 0]])}</defs>${dasar(0.84)}${sisi('url(#f)')}
    <path d="M58 92C56 54 78 40 102 40c26 0 44 16 44 40-10 2-20 2-28-2-10 6-26 8-40 6-8 0-14 4-20 8z" fill="#3B2418"/>
    <path d="M118 76c8 2 16 2 26 0" stroke="#5C3A28" stroke-width="3" fill="none" stroke-linecap="round"/>${telinga}`,
};

async function gaya() {
  for (const [id, f] of Object.entries(GAYA_SVG)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="${W.mint}"/><circle cx="150" cy="40" r="60" fill="#fff" opacity=".35"/>${f()}</svg>`;
    await fs.writeFile(path.join(AKAR, `design/gaya-${id}.svg`), svg);
    await sharp(Buffer.from(svg)).resize(192).webp({ quality: 86 }).toFile(path.join(IMG, `gaya-${id}.webp`));
  }
}

// ---------- keadaan kosong: kursi pangkas kosong + tiang pangkas ----------
async function kursiKosong() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 200 200">
  <defs><clipPath id="tiang"><rect x="156" y="52" width="18" height="92" rx="9"/></clipPath></defs>
  <circle cx="100" cy="104" r="92" fill="${W.mint}"/>
  <ellipse cx="96" cy="180" rx="50" ry="9" fill="#8FA399"/>
  <rect x="88" y="142" width="14" height="38" rx="4" fill="#B9C6BF"/><rect x="84" y="164" width="22" height="8" rx="3" fill="#A2B2AA"/>
  <rect x="50" y="116" width="92" height="28" rx="12" fill="${W.marun}"/>
  <path d="M60 122h72" stroke="${W.marunTua}" stroke-width="2"/>
  <rect x="44" y="50" width="34" height="76" rx="14" fill="${W.marun}" transform="rotate(-8 61 88)"/>
  <g transform="rotate(-8 61 88)" stroke="${W.marunTua}" stroke-width="2"><path d="M48 66l26 18M74 66 48 84M48 92l26 18M74 92l-26 18"/></g>
  <g fill="${W.krem}" transform="rotate(-8 61 88)"><circle cx="61" cy="75" r="2.4"/><circle cx="61" cy="101" r="2.4"/></g>
  <rect x="44" y="30" width="30" height="16" rx="7" fill="${W.marunTua}" transform="rotate(-8 59 38)"/><rect x="56" y="44" width="5" height="10" fill="#B9C6BF"/>
  <rect x="76" y="104" width="60" height="9" rx="4.5" fill="#DDE4E0"/><rect x="128" y="110" width="6" height="12" fill="#B9C6BF"/>
  <path d="M138 142l18 22h-20" fill="none" stroke="#B9C6BF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <g clip-path="url(#tiang)"><rect x="150" y="40" width="30" height="110" fill="${W.krem}"/>
  ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M150 ${60 + i * 16}l30-18v8l-30 18z" fill="${i % 2 ? W.hijau : W.marun}"/>`).join('')}</g>
  <rect x="152" y="44" width="26" height="10" rx="5" fill="${W.kuningan}"/><rect x="152" y="142" width="26" height="10" rx="5" fill="${W.kuningan}"/>
  <circle cx="165" cy="38" r="7" fill="${W.krem}" stroke="${W.kuningan}" stroke-width="2"/>
  </svg>`;
  await fs.writeFile(path.join(AKAR, 'design/kursi-kosong.svg'), svg);
  await sharp(Buffer.from(svg)).resize(240).webp({ quality: 88 }).toFile(path.join(IMG, 'kursi-kosong.webp'));
}

// ---------- peta ilustrasi ----------
async function peta() {
  const pohon = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2E6A56"/><circle cx="${x - 3}" cy="${y - 3}" r="${r * 0.45}" fill="#3F8068"/>`;
  const label = (x, y, t, besar = false) => `<text x="${x}" y="${y}" font-family="Helvetica Neue, Helvetica, Arial" font-weight="700" font-size="${besar ? 19 : 16}" fill="${W.tinta}">${t}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="440" viewBox="0 0 720 440">
  <rect width="720" height="440" fill="${W.kertas}"/>
  <g fill="${W.kertasTua}">
    <rect x="20" y="20" width="250" height="150" rx="18"/><rect x="330" y="20" width="150" height="150" rx="18"/><rect x="540" y="20" width="160" height="150" rx="18"/>
    <rect x="20" y="250" width="250" height="170" rx="18"/><rect x="540" y="250" width="160" height="170" rx="18"/>
  </g>
  <rect x="330" y="250" width="150" height="170" rx="18" fill="${W.mint}"/>
  ${pohon(360, 285)}${pohon(400, 300, 14)}${pohon(445, 280)}${pohon(370, 350, 13)}${pohon(450, 365, 15)}${pohon(410, 395, 11)}
  <path d="M384 330h48" stroke="#9CC4AE" stroke-width="10" stroke-linecap="round"/>
  <g fill="none" stroke="${W.garis}" stroke-width="2"><path d="M0 210h720M300 0v440M510 0v440"/></g>
  <path d="M0 210h720" stroke="${W.putih}" stroke-width="56"/><path d="M300 0v440" stroke="${W.putih}" stroke-width="44"/><path d="M510 0v440" stroke="${W.putih}" stroke-width="44"/>
  <path d="M0 210h720" stroke="${W.garis}" stroke-width="2" stroke-dasharray="14 12"/>
  <g fill="${W.garis}"><rect x="280" y="186" width="40" height="6" rx="3"/><rect x="280" y="228" width="40" height="6" rx="3"/></g>
  <rect x="44" y="282" width="120" height="70" rx="10" fill="#E0D3BF"/><path d="M52 298h104M52 314h104M52 330h104" stroke="#CDBDA5" stroke-width="5"/>
  <rect x="352" y="56" width="104" height="80" rx="12" fill="${W.putih}" stroke="${W.marun}" stroke-width="4"/>
  <path d="M352 72h104" stroke="${W.marun}" stroke-width="16"/>
  <g transform="translate(404 120)"><path d="M0-70c-22 0-38 16-38 37 0 28 38 61 38 61s38-33 38-61c0-21-16-37-38-37z" fill="${W.marun}"/><circle cx="0" cy="-34" r="15" fill="${W.krem}"/></g>
  <rect x="370" y="146" width="68" height="10" rx="5" fill="${W.kuningan}" opacity=".6"/>
  ${label(30, 202, 'Jl. Tegel Kuno', true)}
  ${label(560, 202, 'Jl. Tegel Kuno')}
  <g transform="translate(296 120) rotate(-90)">${label(0, 0, 'Jl. Kenari')}</g>
  <g transform="translate(506 410) rotate(-90)">${label(0, 0, 'Jl. Kemuning')}</g>
  ${label(350, 412, 'Taman kota')}
  ${label(44, 380, 'Toko bangunan')}
  <rect x="352" y="160" width="104" height="0"/>
  </svg>`;
  await fs.writeFile(path.join(AKAR, 'design/peta.svg'), svg);
  await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(path.join(IMG, 'peta.webp'));
  await sharp(Buffer.from(svg)).resize(480).webp({ quality: 84 }).toFile(path.join(IMG, 'peta-480.webp'));
}

// ---------- ikon aplikasi ----------
const glyphKursi = (warna, tebal = 34) => `<g fill="none" stroke="${warna}" stroke-width="${tebal}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M392 236h240a30 30 0 0 1 30 30v206H362V266a30 30 0 0 1 30-30z"/><path d="M302 472h420"/><path d="M302 472v104h420V472"/><path d="M512 576v140"/><path d="M392 760h240"/></g>`;

async function ikon() {
  const kulit = kulitSvg('marun', 40).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  const polaMarun = `<defs><pattern id="t" width="170.67" height="170.67" patternUnits="userSpaceOnUse"><g transform="scale(4.2667)">${kulit}</g></pattern></defs>`;
  const ikonPenuh = (ukuran = 1024, bulat = 0) => `<svg xmlns="http://www.w3.org/2000/svg" width="${ukuran}" height="${ukuran}" viewBox="0 0 1024 1024">${polaMarun}
    <rect width="1024" height="1024" rx="${bulat}" fill="url(#t)"/>
    <circle cx="512" cy="512" r="330" fill="${W.marun}"/><circle cx="512" cy="512" r="330" fill="none" stroke="${W.kuningan}" stroke-width="14"/>
    <g transform="translate(512 512) scale(.62) translate(-512 -498)">${glyphKursi(W.krem, 44)}</g></svg>`;
  await sharp(Buffer.from(ikonPenuh())).png().toFile(path.join(AKAR, 'assets/icon.png'));
  await sharp(Buffer.from(ikonPenuh())).resize(512).png().toFile(path.join(AKAR, 'public/icon-maskable-512.png'));
  await sharp(Buffer.from(ikonPenuh(1024, 224))).resize(512).png().toFile(path.join(AKAR, 'public/icon-512.png'));
  await sharp(Buffer.from(ikonPenuh(1024, 224))).resize(192).png().toFile(path.join(AKAR, 'public/icon-192.png'));
  await sharp(Buffer.from(ikonPenuh())).resize(180).png().toFile(path.join(AKAR, 'public/apple-touch-icon.png'));
  // Ikon SVG ringan untuk favicon modern.
  const svgIkon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${W.marun}"/><g fill="none" stroke="${W.krem}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 14h16a2 2 0 0 1 2 2v13H22V16a2 2 0 0 1 2-2z"/><path d="M16 29h32v7H16z"/><path d="M32 36v10M24 50h16"/></g></svg>`;
  await fs.writeFile(path.join(AKAR, 'public/icon.svg'), svgIkon);
  const fav48 = await sharp(Buffer.from(svgIkon)).resize(48).png().toBuffer();
  await fs.writeFile(path.join(AKAR, 'assets/favicon.png'), fav48);
  await fs.writeFile(path.join(AKAR, 'public/favicon.ico'), icoDari(fav48, 48));
  // Android adaptif: latar pola, depan lingkaran + kursi, monokrom.
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${polaMarun}<rect width="1024" height="1024" fill="url(#t)"/></svg>`)).png().toFile(path.join(AKAR, 'assets/android-icon-background.png'));
  const depan = (warna, isi) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><circle cx="512" cy="512" r="250" fill="${isi}"/><g transform="translate(512 512) scale(.46) translate(-512 -498)">${glyphKursi(warna, 48)}</g></svg>`;
  await sharp(Buffer.from(depan(W.krem, W.marun))).png().toFile(path.join(AKAR, 'assets/android-icon-foreground.png'));
  await sharp(Buffer.from(depan('#000', 'none'))).png().toFile(path.join(AKAR, 'assets/android-icon-monochrome.png'));
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 1024 1024"><circle cx="512" cy="512" r="420" fill="${W.marun}"/><g transform="translate(512 512) scale(.7) translate(-512 -498)">${glyphKursi(W.krem, 44)}</g></svg>`)).png().toFile(path.join(AKAR, 'assets/splash-icon.png'));
}

function icoDari(png, ukuran) {
  const kepala = Buffer.alloc(22);
  kepala.writeUInt16LE(0, 0);
  kepala.writeUInt16LE(1, 2);
  kepala.writeUInt16LE(1, 4);
  kepala.writeUInt8(ukuran, 6);
  kepala.writeUInt8(ukuran, 7);
  kepala.writeUInt8(0, 8);
  kepala.writeUInt8(0, 9);
  kepala.writeUInt16LE(1, 10);
  kepala.writeUInt16LE(32, 12);
  kepala.writeUInt32LE(png.length, 14);
  kepala.writeUInt32LE(22, 18);
  return Buffer.concat([kepala, png]);
}

// ---------- foto CC0 ----------
const FOTO = [
  {
    nama: 'outlet.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Barber_shop%2C_Quebec_city%2C_Canada.jpg/1920px-Barber_shop%2C_Quebec_city%2C_Canada.jpg',
    // Potong bagian kursi & lantai tegel (papan nama di cermin ikut terbuang), lalu duotone marun-krem.
    olah: (s, m) => s.extract({ left: Math.round(m.width * 0.08), top: Math.round(m.height * 0.42), width: Math.round(m.width * 0.84), height: Math.round(m.height * 0.5) }).resize(780, 368, { fit: 'cover' }),
    duotone: ['#3A0F16', '#F6E7D2'],
  },
  {
    nama: 'alat.webp',
    url: 'https://pd.w.org/2024/05/27966437d76455679.49525659.jpg',
    olah: (s, m) => s.extract({ left: Math.round(m.width * 0.2), top: Math.round(m.height * 0.5), width: Math.round(m.width * 0.78), height: Math.round(m.height * 0.42) }).resize(780, 288, { fit: 'cover' }),
  },
  {
    nama: 'salon.webp',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Hair_salon_-_Arlington%2C_MA.jpg/1920px-Hair_salon_-_Arlington%2C_MA.jpg',
    olah: (s, m) => s.extract({ left: 0, top: Math.round(m.height * 0.3), width: m.width, height: Math.round(m.height * 0.62) }).resize(780, 288, { fit: 'cover' }),
  },
];

async function unduh(url) {
  await fs.mkdir(CACHE, { recursive: true });
  const f = path.join(CACHE, decodeURIComponent(url.split('/').pop()).replace(/[^\w.-]+/g, '_'));
  try {
    await fs.access(f);
  } catch {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    await fs.writeFile(f, Buffer.from(await r.arrayBuffer()));
  }
  return f;
}

function hexKeRgb(h) {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
}

async function foto() {
  for (const f of FOTO) {
    const file = await unduh(f.url);
    const asli = sharp(file).rotate();
    const m = await asli.metadata();
    let s = f.olah(sharp(file).rotate(), m);
    if (f.duotone) {
      const [g, t] = f.duotone.map(hexKeRgb);
      const { data, info } = await s.clone().greyscale().normalise().raw().toBuffer({ resolveWithObject: true });
      const out = Buffer.alloc(info.width * info.height * 3);
      for (let i = 0; i < info.width * info.height; i++) {
        const v = data[i * info.channels] / 255;
        for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(g[c] + (t[c] - g[c]) * v);
      }
      s = sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } });
    } else {
      s = s.modulate({ saturation: 0.92 });
    }
    const buf = await s.webp({ quality: 72 }).toBuffer();
    await fs.writeFile(path.join(IMG, f.nama), buf);
    // Varian 480w untuk layar ponsel 1x–1.5x (dipakai lewat srcset di Gambar.web.js).
    await sharp(buf).resize(480).webp({ quality: 70 }).toFile(path.join(IMG, f.nama.replace('.webp', '-480.webp')));
  }
}

await fs.mkdir(IMG, { recursive: true });
await fs.mkdir(path.join(AKAR, 'design'), { recursive: true });
const pilih = process.argv[2];
if (!pilih || pilih === 'kapster') await kapster();
if (!pilih || pilih === 'gaya') await gaya();
if (!pilih || pilih === 'kursi') await kursiKosong();
if (!pilih || pilih === 'peta') await peta();
if (!pilih || pilih === 'ikon') await ikon();
if (!pilih || pilih === 'foto') await foto();
console.log('selesai', pilih || 'semua');
