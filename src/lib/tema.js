import { Platform } from 'react-native';

export const WEB = Platform.OS === 'web';

// Palet "kursi putar": mint porselen (permukaan utama, seperti kursi pangkas lama), marun kulit jok,
// hijau botol, kuningan; krem kertas hanya untuk karcis & kartu cap.
// Kontras teks diuji (23 Okt): tinta/tintaLembut/marun/hijau >= 5,7:1 di atas kertas, kertasTua, putih, mint, krem.
export const W = {
  kertas: '#E3EFE8',
  kertasTua: '#D2E5DA',
  putih: '#FAFDFB',
  tinta: '#241A1B',
  tintaLembut: '#5B4C48',
  garis: '#C6DBCF',
  garisTegas: '#6F977F',
  garisKarcis: '#E3D3B6',
  marun: '#7A1F2B',
  marunTua: '#5A1520',
  marunMuda: '#F2DEDB',
  mint: '#C2DFCD',
  mintTua: '#A4CDB5',
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
