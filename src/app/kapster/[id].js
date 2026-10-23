import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { W, F, R, angkaTabel } from '../../lib/tema';
import { KAPSTER, kapsterById, layananById, JAM_BUKA, gayaById } from '../../lib/data';
import { HARI, jam, hariKe, hariPekan, sebutanHari, HARI_PENDEK, durasi, rupiah } from '../../lib/waktu';
import { useToko } from '../../lib/store';
import { slotTerdekat } from '../../lib/slot';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Judul, Lencana, Tombol, Kerangka, Kartu, Garis, Taut } from '../../components/ui';
import Gambar from '../../components/Gambar';
import Pola from '../../components/Pola';

export function generateStaticParams() {
  return KAPSTER.map((k) => ({ id: k.id }));
}

export function generateMetadata(_req, params) {
  return meta(`/kapster/${kapsterById[params?.id] ? params.id : KAPSTER[0].id}`);
}

const URUT_HARI = [1, 2, 3, 4, 5, 6, 0];

export default function DetailKapster() {
  const { id } = useLocalSearchParams();
  const k = kapsterById[String(id)];
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const utama = k ? k.layanan[0] : null;
  const terdekat = useMemo(
    () => (siap && k ? slotTerdekat({ durasi: layananById[utama].menit, kapsterIds: [k.id], bookings, sekarang, jumlah: 6, hari: 10, jarak: 60 }) : []),
    [siap, k?.id, bookings, Math.floor(sekarang / 60000)],
  );
  if (!k) {
    return (
      <Layar kembali induk="/kapster" judul="Kapster tidak ditemukan">
        <Tombol label="Lihat semua kapster" href="/kapster" replace />
      </Layar>
    );
  }
  const hIni = hariKe(sekarang);
  const hpIni = siap ? hariPekan(hIni) : -1;

  return (
    <Layar
      kembali
      induk="/kapster"
      judul={k.nama}
      sub={k.peran}
      bawah={<Tombol label={`Booking dengan ${k.nama}`} href={{ pathname: '/booking', params: { layanan: utama, kapster: k.id } }} penuh />}
    >
      <View style={st.sampul}>
        <Pola jenis="kulit" varian="marun" ukuran={40} />
        <View style={st.potret}>
          <Gambar nama={`kapster-${k.id}.webp`} lebar={156} tinggi={156} bulat={78} alt={`Ilustrasi ${k.nama}, ${k.peran.toLowerCase()}`} prioritas />
        </View>
      </View>
      <T>{k.bio}</T>
      <View style={st.keahlian}>
        {k.keahlian.map((x) => (
          <Lencana key={x}>{x}</Lencana>
        ))}
      </View>

      {k.gaya.length ? (
        <View style={{ gap: 8 }}>
          <Judul level={2}>Gaya andalan</Judul>
          <View style={st.gayaBaris} role="list">
            {k.gaya.map((gid) => {
              const g = gayaById[gid];
              return (
                <View key={gid} role="listitem" style={{ flex: 1 }}>
                  <Taut href={{ pathname: '/booking/kapster', params: { layanan: g.layanan, kapster: k.id, gaya: g.id } }} gaya={({ pressed }) => [st.gaya, pressed && { backgroundColor: W.kertasTua }]}>
                    <Gambar nama={`gaya-${g.id}.webp`} lebar={88} tinggi={88} bulat={14} />
                    <T kecil style={[F.b, { textAlign: 'center' }]} numberOfLines={1}>
                      {g.nama}
                    </T>
                  </Taut>
                </View>
              );
            })}
          </View>
          <T kecil lembut>Ilustrasi gaya, bukan foto pelanggan. Ketuk untuk booking dengan catatan gaya terisi.</T>
        </View>
      ) : null}

      <Kartu style={{ gap: 10 }}>
        <Judul level={2}>Jam kosong terdekat</Judul>
        <T kecil lembut>
          Untuk {layananById[utama].nama} ({durasi(layananById[utama].menit)})
        </T>
        <View style={st.slot} role="list">
          {!siap
            ? [0, 1, 2].map((i) => <Kerangka key={i} tinggi={56} style={{ width: '31%', flexGrow: 1 }} />)
            : terdekat.map((s) => (
                <View key={s.mulai} role="listitem" style={{ width: '31%', flexGrow: 1 }}>
                  <Taut href={{ pathname: '/booking/konfirmasi', params: { layanan: utama, kapster: k.id, mulai: String(s.mulai) } }} gaya={({ pressed }) => [st.slotItem, pressed && { backgroundColor: W.mint }]}>
                      <T kecil style={[F.b, { color: W.hijau }]}>{sebutanHari(s.h, hIni) || HARI_PENDEK[hariPekan(s.h)]}</T>
                      <Text style={[st.slotJam, angkaTabel]}>{jam(s.menit)}</Text>
                    </Taut>
                </View>
              ))}
        </View>
      </Kartu>

      <View style={{ gap: 8 }}>
        <Judul level={2}>Jadwal tugas</Judul>
        <View style={st.tabel} role="table" aria-label={`Jadwal tugas ${k.nama}`}>
          {URUT_HARI.map((d, i) => {
            const o = JAM_BUKA[d];
            const libur = !o || k.libur.includes(d);
            const buka = o ? Math.max(o.buka, k.shift ? k.shift[0] : 0) : 0;
            const tutup = o ? Math.min(o.tutup, k.shift ? k.shift[1] : 1440) : 0;
            const ini = d === hpIni;
            return (
              <View key={d} role="row" style={[st.baris, i && st.barisGaris, ini && st.barisIni]}>
                <T role="cell" style={[{ flex: 1 }, ini && F.b]}>
                  {HARI[d]}
                  {ini ? ' (hari ini)' : ''}
                </T>
                <T role="cell" style={[angkaTabel, libur ? { color: W.marun } : F.sb]}>{!o ? 'Outlet tutup' : libur ? 'Libur' : `${jam(buka)}–${jam(tutup)}`}</T>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Judul level={2}>Layanan yang ditangani</Judul>
        <Kartu style={{ paddingVertical: 4 }}>
          {k.layanan.map((lid, i) => {
            const l = layananById[lid];
            return (
              <View key={lid}>
                {i ? <Garis /> : null}
                <View style={st.layanan}>
                  <View style={{ flex: 1 }}>
                    <T style={F.sb}>{l.nama}</T>
                    <T kecil lembut>{durasi(l.menit)}</T>
                  </View>
                  <T style={F.sb}>
                    {l.mulai ? 'mulai ' : ''}
                    {rupiah(l.harga)}
                  </T>
                </View>
              </View>
            );
          })}
        </Kartu>
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  sampul: { height: 200, borderRadius: R.besar, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  potret: { width: 168, height: 168, borderRadius: 84, backgroundColor: W.putih, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#D9A54E' },
  keahlian: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  gayaBaris: { flexDirection: 'row', gap: 8 },
  gaya: { alignItems: 'center', gap: 6, padding: 8, borderRadius: 16, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  slot: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotItem: { minHeight: 56, borderRadius: 14, borderWidth: 1.5, borderColor: W.hijau, paddingHorizontal: 10, paddingVertical: 6, justifyContent: 'center' },
  slotJam: { ...F.display, fontSize: 20, lineHeight: 26, color: W.tinta },
  tabel: { backgroundColor: W.putih, borderRadius: R.besar, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  baris: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, minHeight: 46 },
  barisGaris: { borderTopWidth: 1, borderTopColor: W.garis },
  barisIni: { backgroundColor: W.mint },
  layanan: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
});
