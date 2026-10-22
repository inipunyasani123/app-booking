import { Platform } from 'react-native';

export const WEB = Platform.OS === 'web';

// Palet "kursi putar": kertas krem, marun kulit jok, mint porselen, hijau botol, kuningan.
// Kontras teks diuji: tinta/tintaLembut/marun/hijau >= 4.5:1 di atas kertas, putih, kertasTua, dan mint.
export const W = {
  kertas: '#F4EEE3',
  kertasTua: '#EAE0CF',
  putih: '#FFFCF6',
  tinta: '#241A1B',
  tintaLembut: '#5B4C48',
  garis: '#DCCFBC',
  garisTegas: '#B9A88F',
  marun: '#7A1F2B',
  marunTua: '#5A1520',
  marunMuda: '#F2DEDB',
  mint: '#D3E8DC',
  mintTua: '#B7D7C5',
  hijau: '#1E5442',
  hijauTua: '#143A2E',
  kuningan: '#B8853A',
  kuninganMuda: '#F1E0BC',
  krem: '#FFF6E6',
};

const JAKARTA_WEB = 'Jakarta, "Jakarta Fallback", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const GLOOCK_WEB = 'Gloock, "Gloock Fallback", Georgia, "Times New Roman", serif';

function jak(berat) {
  return WEB ? { fontFamily: JAKARTA_WEB, fontWeight: berat } : { fontFamily: `Jakarta-${berat}` };
}

export const F = {
  display: WEB ? { fontFamily: GLOOCK_WEB, fontWeight: '400' } : { fontFamily: 'Gloock' },
  r: jak('400'),
  m: jak('500'),
  sb: jak('600'),
  b: jak('700'),
  xb: jak('800'),
};

export const angkaTabel = { fontVariant: ['tabular-nums'] };

export const R = { kecil: 10, sedang: 16, besar: 22, bulat: 999 };

// Lebar sentuh minimum 44px untuk tombol utama, 24px untuk sasaran kecil.
export const SENTUH = 44;
