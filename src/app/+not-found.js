import { View, Text, StyleSheet } from 'react-native';
import { W, F } from '../lib/tema';
import { useTepi } from '../lib/tepi';
import { HALAMAN } from '../lib/seo';
import { T, Tombol } from '../components/ui';
import Pola from '../components/Pola';
import Ikon from '../components/Ikon';

export function generateMetadata() {
  const h = HALAMAN['/404'];
  return { title: h.judul, description: h.deskripsi, robots: { index: false, follow: true } };
}

export default function TidakDitemukan() {
  const tepi = useTepi();
  return (
    <View role="main" style={[st.layar, { paddingTop: tepi.atas(24), paddingBottom: tepi.bawah(24) }]}>
      <View style={st.ubin}>
        <Pola jenis="kulit" varian="marun" ukuran={40} />
        <View style={st.kursi}>
          <Ikon nama="kursi" ukuran={56} warna={W.krem} tebal={1.6} />
        </View>
      </View>
      <Text style={st.kode}>404</Text>
      <Text role="heading" aria-level={1} style={st.judul}>
        Kursi ini kosong
      </Text>
      <T lembut style={{ textAlign: 'center', maxWidth: 300 }}>
        Halaman yang kamu cari tidak ada. Mungkin tautannya salah ketik atau sudah dipindah.
      </T>
      <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 8 }}>
        <Tombol label="Ke beranda" href="/" replace ikon="rumah" />
        <Tombol label="Lihat layanan & harga" href="/layanan" varian="lembut" replace />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  layar: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 10, backgroundColor: W.kertas },
  ubin: { width: 180, height: 180, borderRadius: 40, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kursi: { width: 104, height: 104, borderRadius: 52, backgroundColor: W.hijau, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: W.krem },
  kode: { ...F.b, fontSize: 14, lineHeight: 18, letterSpacing: 3, color: W.marun },
  judul: { ...F.display, fontSize: 32, lineHeight: 38, color: W.tinta, textAlign: 'center' },
});
