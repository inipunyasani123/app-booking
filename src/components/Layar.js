import { View, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { W, F } from '../lib/tema';
import { useTepi } from '../lib/tepi';
import { Judul, T, TombolIkon } from './ui';
import BilahTab from './BilahTab';

/**
 * Kerangka satu layar: kepala (judul h1), isi bergulir, dan bilah aksi bawah opsional.
 * `besar` = gaya kepala tab utama; `kembali` = kepala tumpukan dengan tombol kembali.
 */
export default function Layar({ judul, sub, kembali, induk = '/', kanan, bawah, children, besar, padat, latarKepala, sebelumJudul, tab, bawahKepala, refGulir }) {
  const tepi = useTepi();
  const mundur = () => (router.canGoBack() ? router.back() : router.replace(induk));
  const isi = (
    <View role="main" style={st.layar}>
      <View style={[st.kepala, { paddingTop: tepi.atas(besar ? 14 : 8) }, latarKepala && { backgroundColor: latarKepala }]}>
        {kembali ? <TombolIkon ikon="kembali" label="Kembali" onPress={mundur} /> : null}
        <View style={st.kepalaTeks}>
          {sebelumJudul}
          {sub ? (
            <T kecil lembut numberOfLines={1} style={F.sb}>
              {sub}
            </T>
          ) : null}
          <Judul style={besar ? null : st.judulKecil} numberOfLines={besar ? 2 : 1}>
            {judul}
          </Judul>
        </View>
        {kanan}
      </View>
      {bawahKepala ? <View style={st.bawahKepala}>{bawahKepala}</View> : null}
      <ScrollView ref={refGulir} style={st.gulir} contentContainerStyle={[st.isi, padat && { paddingHorizontal: 0 }]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {bawah ? <View style={[st.bawah, { paddingBottom: tepi.bawah(12) }]}>{bawah}</View> : null}
    </View>
  );
  // Layar tab utama: bilah menu di bawah, di luar landmark main.
  return tab ? (
    <View style={st.layar}>
      {isi}
      <BilahTab />
    </View>
  ) : (
    isi
  );
}

const st = StyleSheet.create({
  layar: { flex: 1, backgroundColor: W.kertas, minHeight: 0 },
  kepala: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: W.kertas },
  kepalaTeks: { flex: 1, minWidth: 0 },
  judulKecil: { fontSize: 22, lineHeight: 28 },
  gulir: { flex: 1 },
  bawahKepala: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: W.kertas, borderBottomWidth: 1, borderBottomColor: W.garis },
  isi: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 28, gap: 16 },
  bawah: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: W.putih,
    borderTopWidth: 1,
    borderTopColor: W.garis,
    gap: 8,
  },
});
