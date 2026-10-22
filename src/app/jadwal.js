import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { W, F, R, angkaTabel } from '../lib/tema';
import { useToko, kapsterLangganan } from '../lib/store';
import { layananById, kapsterById } from '../lib/data';
import { bagian, BULAN, BULAN_PENDEK, jamDari, hitungMundur, rupiah, tanggal } from '../lib/waktu';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Segmen, Kerangka, Kartu, Tombol, Taut } from '../components/ui';
import { Karcis } from '../components/booking';
import Pola from '../components/Pola';

export function generateMetadata() {
  return meta('/jadwal');
}

export default function Jadwal() {
  const [tab, setTab] = useState('datang');
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const datang = useMemo(() => bookings.filter((b) => b.status === 'aktif').sort((a, b) => a.mulai - b.mulai), [bookings]);
  const lalu = useMemo(() => bookings.filter((b) => b.status !== 'aktif').sort((a, b) => b.mulai - a.mulai), [bookings]);
  const selesai = lalu.filter((b) => b.status === 'selesai');
  const langganan = kapsterLangganan(bookings);

  const grup = useMemo(() => {
    const g = [];
    for (const b of lalu) {
      const t = bagian(b.mulai);
      const k = `${BULAN[t.bl]} ${t.th}`;
      if (!g.length || g[g.length - 1].k !== k) g.push({ k, isi: [] });
      g[g.length - 1].isi.push(b);
    }
    return g;
  }, [lalu]);

  return (
    <Layar besar tab judul="Jadwalku" sub="Booking aktif & riwayat kunjungan">
      <Segmen
        label="Tampilan jadwal"
        pilihan={[
          { id: 'datang', label: siap ? `Akan datang (${datang.length})` : 'Akan datang' },
          { id: 'riwayat', label: 'Riwayat' },
        ]}
        nilai={tab}
        ubah={setTab}
      />
      {!siap ? (
        <View style={{ gap: 12 }}>
          <Kerangka tinggi={130} />
          <Kerangka tinggi={130} />
        </View>
      ) : tab === 'datang' ? (
        <View role="tabpanel" style={{ gap: 12 }}>
          {datang.length ? (
            datang.map((b) => (
              <View key={b.kode} style={{ gap: 6 }}>
                <T kecil style={[F.b, { color: W.hijau }]}>{hitungMundur(b.mulai, sekarang)}</T>
                <Taut href={{ pathname: '/karcis', params: { kode: b.kode } }} gaya={({ pressed }) => pressed && { opacity: 0.85 }}>
                    <Karcis b={b} ringkas />
                  </Taut>
              </View>
            ))
          ) : (
            <Kartu style={{ gap: 6, overflow: 'hidden', paddingTop: 30 }}>
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 14 }}>
                <Pola jenis="tegel" varian="mint" ukuran={24} />
              </View>
              <T style={F.b}>Tidak ada jadwal mendatang.</T>
              <T kecil lembut>Booking baru akan muncul di sini lengkap dengan kodenya.</T>
              <Tombol label="Booking sekarang" href="/booking" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            </Kartu>
          )}
        </View>
      ) : (
        <View role="tabpanel" style={{ gap: 16 }}>
          <View style={st.ringkas}>
            <View style={st.ringkasItem}>
              <Text style={[st.angka, angkaTabel]}>{selesai.length}</Text>
              <T kecil lembut>kunjungan selesai</T>
            </View>
            <View style={st.ringkasItem}>
              <Text style={st.angka} numberOfLines={1}>
                {langganan ? kapsterById[langganan].nama.replace('Pak ', '') : '–'}
              </Text>
              <T kecil lembut>kapster langganan</T>
            </View>
          </View>
          {grup.map((g) => (
            <View key={g.k} style={{ gap: 8 }}>
              <Judul level={2} style={st.bulan}>
                {g.k}
              </Judul>
              <View role="list" style={{ gap: 8 }}>
                {g.isi.map((b) => {
                  const t = bagian(b.mulai);
                  const l = layananById[b.layanan];
                  const k = kapsterById[b.kapster];
                  const batal = b.status === 'batal';
                  return (
                    <View key={b.kode + b.mulai} role="listitem" style={st.riwayat}>
                      <View style={[st.tgl, batal && { backgroundColor: W.kertasTua }]}>
                        <Text style={st.tglAngka}>{t.tg}</Text>
                        <Text style={st.tglBulan}>{BULAN_PENDEK[t.bl]}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <T style={F.b} numberOfLines={2}>
                          {l.nama}
                          {b.tambahan.length ? ` + ${b.tambahan.map((id) => layananById[id].nama).join(', ')}` : ''}
                        </T>
                        <T kecil lembut>
                          {k.nama} · {jamDari(b.mulai)} · {batal ? 'Dibatalkan' : rupiah(b.total)}
                        </T>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                          <Tombol
                            kecil
                            varian="garis"
                            label="Pesan lagi"
                            aksesLabel={`Pesan lagi ${l.nama} dengan ${k.nama}`}
                            href={{ pathname: '/booking/waktu', params: { layanan: b.layanan, kapster: b.kapster, tambah: b.tambahan.join(',') } }}
                          />
                          <Tombol kecil varian="teks" label="Karcis" aksesLabel={`Karcis ${tanggal(b.mulai)}`} href={{ pathname: '/karcis', params: { kode: b.kode } }} />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
          {!lalu.length ? <T lembut>Belum ada riwayat kunjungan.</T> : null}
        </View>
      )}
    </Layar>
  );
}

const st = StyleSheet.create({
  ringkas: { flexDirection: 'row', gap: 10 },
  ringkasItem: { flex: 1, padding: 14, borderRadius: R.besar, backgroundColor: W.mint, borderWidth: 1, borderColor: W.mintTua },
  angka: { ...F.display, fontSize: 28, lineHeight: 34, color: W.tinta },
  bulan: { fontSize: 18, lineHeight: 24 },
  riwayat: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  tgl: { width: 52, borderRadius: 12, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, alignSelf: 'flex-start' },
  tglAngka: { ...F.display, fontSize: 22, lineHeight: 26, color: W.tinta },
  tglBulan: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tinta },
});
