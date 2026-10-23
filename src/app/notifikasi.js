import { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { W, F, R } from '../lib/tema';
import { tanggal, jamDari, sebutanHari, hariKe } from '../lib/waktu';
import { useToko, bacaSemua, bacaNotif } from '../lib/store';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Tombol, Kerangka, Lencana } from '../components/ui';
import Ikon from '../components/Ikon';

export function generateMetadata() {
  return meta('/notifikasi');
}

const IKON = { pengingat: 'lonceng', tersimpan: 'karcis', ubah: 'kalender', batal: 'silang', cap: 'hadiah', info: 'info', hadir: 'lokasi', antre: 'antre' };

function kelompok(h, hIni) {
  const d = hIni - h;
  if (d <= 0) return 'Hari ini';
  if (d === 1) return 'Kemarin';
  if (d < 7) return 'Pekan ini';
  return 'Lebih lama';
}

export default function Notifikasi() {
  const siap = useToko((s) => s.siap);
  const notif = useToko((s) => s.notif);
  const sekarang = useToko((s) => s.sekarang);
  const urut = useMemo(() => [...notif].sort((a, b) => b.waktu - a.waktu), [notif]);
  const belum = notif.filter((n) => !n.dibaca).length;
  const hIni = hariKe(sekarang);

  return (
    <Layar
      kembali
      judul="Notifikasi"
      sub={siap ? (belum ? `${belum} belum dibaca` : 'Semua sudah dibaca') : ' '}
      kanan={siap && belum ? <Tombol kecil varian="teks" label="Tandai dibaca" onPress={bacaSemua} /> : null}
    >
      {!siap ? (
        <Kerangka tinggi={240} />
      ) : urut.length ? (
        <View style={{ gap: 16 }}>
          {['Hari ini', 'Kemarin', 'Pekan ini', 'Lebih lama'].map((g) => {
            const isi = urut.filter((n) => kelompok(hariKe(n.waktu), hIni) === g);
            if (!isi.length) return null;
            return (
              <View key={g} style={{ gap: 8 }}>
                <Judul level={2} style={{ fontSize: 18, lineHeight: 24 }}>
                  {g}
                </Judul>
                <View role="list" style={{ gap: 8 }}>
          {isi.map((n) => (
            <View key={n.id} role="listitem">
              <Pressable
                onPress={() => {
                  bacaNotif(n.id);
                  if (n.tautan) router.push(n.tautan);
                  else if (n.kode) router.push({ pathname: '/karcis', params: { kode: n.kode } });
                }}
                style={({ pressed }) => [st.item, !n.dibaca && st.itemBaru, pressed && { backgroundColor: W.kertasTua }]}
              >
                <View style={[st.ikon, !n.dibaca && { backgroundColor: W.marun }]}>
                  <Ikon nama={IKON[n.jenis] || 'lonceng'} ukuran={20} warna={n.dibaca ? W.hijau : W.krem} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <T style={[F.b, { flexShrink: 1 }]}>{n.judul}</T>
                    {!n.dibaca ? <Lencana warna={W.krem} latar={W.marun}>Baru</Lencana> : null}
                  </View>
                  <T kecil>{n.isi}</T>
                  <T kecil lembut>
                    {sebutanHari(hariKe(n.waktu), hIni) || tanggal(n.waktu, { pendek: true })} · {jamDari(n.waktu)} WIB
                  </T>
                </View>
              </Pressable>
            </View>
          ))}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <T lembut>Belum ada notifikasi.</T>
      )}
    </Layar>
  );
}

const st = StyleSheet.create({
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  itemBaru: { borderColor: W.marun, backgroundColor: W.marunMuda },
  ikon: { width: 40, height: 40, borderRadius: 14, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center' },
});
