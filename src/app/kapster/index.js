import { View, StyleSheet, Pressable } from 'react-native';
import { W, F, R } from '../../lib/tema';
import { KAPSTER } from '../../lib/data';
import { HARI, jam, hariKe } from '../../lib/waktu';
import { useToko } from '../../lib/store';
import { jadwalKapster } from '../../lib/slot';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Judul, Lencana, Taut } from '../../components/ui';
import { Avatar } from '../../components/booking';
import Ikon from '../../components/Ikon';

export function generateMetadata() {
  return meta('/kapster');
}

export default function DaftarKapster() {
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const hIni = hariKe(sekarang);
  return (
    <Layar kembali judul="Kapster & penata" sub="5 orang · ilustrasi, bukan foto">
      <View role="list" style={{ gap: 10 }}>
        {KAPSTER.map((k) => {
          const j = siap ? jadwalKapster(k, hIni) : null;
          return (
            <View key={k.id} role="listitem">
              <Taut href={`/kapster/${k.id}`} gaya={({ pressed }) => [st.kartu, pressed && { backgroundColor: W.kertasTua }]}>
                  <Avatar id={k.id} ukuran={72} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Judul level={2} style={st.nama}>
                      {k.nama}
                    </Judul>
                    <T kecil lembut>
                      {k.peran} · libur {k.libur.map((d) => HARI[d]).join(', ')}
                    </T>
                    <View style={st.keahlian}>
                      {k.keahlian.slice(0, 2).map((x) => (
                        <Lencana key={x}>{x}</Lencana>
                      ))}
                    </View>
                    {siap ? (
                      <T kecil style={[F.sb, { color: j ? W.hijau : W.marun }]}>{j ? `Bertugas hari ini ${jam(j.buka)}–${jam(j.tutup)}` : 'Tidak bertugas hari ini'}</T>
                    ) : null}
                  </View>
                  <Ikon nama="kanan" warna={W.tintaLembut} />
                </Taut>
            </View>
          );
        })}
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  kartu: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  nama: { fontSize: 20, lineHeight: 26 },
  keahlian: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 },
});
