import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { W, F } from '../lib/tema';
import { useTepi } from '../lib/tepi';
import Ikon from './Ikon';
import Pola from './Pola';
import { Taut } from './ui';

const TAB = [
  { href: '/', label: 'Beranda', ikon: 'rumah' },
  { href: '/layanan', label: 'Layanan', ikon: 'gunting' },
  { href: '/booking', label: 'Booking', ikon: 'tambah', tengah: true },
  { href: '/jadwal', label: 'Jadwalku', ikon: 'kalender' },
  { href: '/profil', label: 'Profil', ikon: 'orang' },
];

export default function BilahTab() {
  const jalur = usePathname();
  const tepi = useTepi();
  return (
    <View role="navigation" aria-label="Menu utama" style={[st.bilah, { paddingBottom: tepi.bawah(6) }]}>
      {TAB.map((t) => {
        const aktif = t.href === '/' ? jalur === '/' : jalur.startsWith(t.href);
        if (t.tengah) {
          return (
            <Taut key={t.href} href={t.href} aria-label="Booking baru" style={st.item}>
                {({ pressed }) => (
                  <>
                    <View style={[st.tengah, pressed && { transform: [{ scale: 0.96 }] }]}>
                      <Pola jenis="belang" varian="pangkas" lebarBelang={5} />
                      <View style={st.tengahDalam}>
                        <Ikon nama="tambah" ukuran={26} warna={W.krem} tebal={2.6} />
                      </View>
                    </View>
                    <Text style={[st.label, { color: W.marun }]}>{t.label}</Text>
                  </>
                )}
              </Taut>
          );
        }
        return (
          <Taut key={t.href} href={t.href} replace aria-current={aktif ? 'page' : undefined} gaya={({ pressed }) => [st.item, pressed && { opacity: 0.7 }]}>
              <View style={[st.pil, aktif && st.pilAktif]}>
                <Ikon nama={t.ikon} ukuran={22} warna={aktif ? W.marun : W.tintaLembut} tebal={aktif ? 2.3 : 2} />
              </View>
              <Text style={[st.label, aktif && st.labelAktif]}>{t.label}</Text>
          </Taut>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  bilah: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: W.putih,
    borderTopWidth: 1,
    borderTopColor: W.garis,
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2, minHeight: 52, paddingBottom: 2 },
  pil: { width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pilAktif: { backgroundColor: W.marunMuda },
  label: { ...F.sb, fontSize: 11, lineHeight: 14, color: W.tintaLembut },
  labelAktif: { ...F.b, color: W.marun },
  tengah: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginTop: -22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: W.putih,
  },
  tengahDalam: { width: 40, height: 40, borderRadius: 20, backgroundColor: W.marun, alignItems: 'center', justifyContent: 'center' },
});
