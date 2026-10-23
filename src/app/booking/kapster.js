import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { W, F, R } from '../../lib/tema';
import { kapsterUntuk } from '../../lib/data';
import { durasi, jam, sebutanHari, hariKe, HARI, hariPekan } from '../../lib/waktu';
import { useToko } from '../../lib/store';
import { slotTerdekat } from '../../lib/slot';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Tombol, Kerangka } from '../../components/ui';
import { Langkah, Avatar } from '../../components/booking';
import { usePesanan, teruskan } from '../../lib/kait';
import Ikon from '../../components/Ikon';
import Pola from '../../components/Pola';

export function generateMetadata() {
  return meta('/booking/kapster');
}

export default function PilihKapster() {
  const { siap, layanan, p, q, untuk, privat, namaUntuk } = usePesanan();
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const [pilih, setPilih] = useState('semua');
  useEffect(() => {
    if (q.kapster && kapsterUntuk(layanan || '', privat).some((k) => k.id === String(q.kapster))) setPilih(String(q.kapster));
  }, [q.kapster, layanan, privat]);

  const daftar = layanan ? kapsterUntuk(layanan, privat) : [];
  const hIni = hariKe(sekarang);
  const terdekat = useMemo(() => {
    if (!siap || !layanan) return {};
    const o = {};
    for (const k of daftar) o[k.id] = slotTerdekat({ durasi: p.durasi, kapsterIds: [k.id], bookings, sekarang, jumlah: 1, hari: 14 })[0];
    o.semua = slotTerdekat({ durasi: p.durasi, kapsterIds: daftar.map((k) => k.id), bookings, sekarang, jumlah: 1, hari: 14 })[0];
    return o;
  }, [siap, layanan, p.durasi, bookings, Math.floor(sekarang / 60000)]);

  const teksTerdekat = (s) => (s ? `Paling cepat ${(sebutanHari(s.h, hIni) || HARI[hariPekan(s.h)]).toLowerCase()} ${jam(s.menit)}` : 'Penuh 2 pekan ke depan');
  const lanjut = () =>
    router.push({ pathname: '/booking/waktu', params: { layanan, kapster: pilih, ...teruskan(q) } });

  if (siap && !layanan) return <TanpaLayanan />;

  return (
    <Layar
      kembali
      induk="/booking"
      judul="Pilih kapster"
      sebelumJudul={<Langkah ke={2} />}
      bawah={<Tombol label="Pilih tanggal & jam" ikonKanan="kanan" onPress={lanjut} disabled={!siap} penuh />}
    >
      {siap ? (
        <T lembut>
          <T style={[F.b, { color: W.tinta }]}>{p.item.map((l) => l.nama).join(' + ')}</T> · {durasi(p.durasi)}
          {untuk !== 'saya' ? ` · atas nama ${namaUntuk}${untuk === 'anak' ? ' (anak)' : ''}` : ''}
          {privat ? ' · ruang privat' : ''}
        </T>
      ) : (
        <Kerangka tinggi={22} />
      )}
      <View role="radiogroup" aria-label="Pilih kapster" style={{ gap: 10 }}>
        <Pressable
          role="radio"
          aria-checked={pilih === 'semua'}
          onPress={() => setPilih('semua')}
          style={({ pressed }) => [st.opsi, pilih === 'semua' && st.opsiAktif, pressed && pilih !== 'semua' && { backgroundColor: W.kertasTua }]}
        >
          <View style={st.semua}>
            <Pola jenis="belang" varian="pangkas" lebarBelang={6} />
            <View style={st.semuaDalam}>
              <Ikon nama="kursi" ukuran={24} warna={W.krem} />
            </View>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T style={F.b}>Siapa saja</T>
            <T kecil lembut>Jam paling banyak; kami pilihkan yang kosong.</T>
            {siap ? <T kecil style={[F.sb, { color: W.hijau }]}>{teksTerdekat(terdekat.semua)}</T> : null}
          </View>
          <Centang aktif={pilih === 'semua'} />
        </Pressable>
        {(siap ? daftar : []).map((k) => {
          const aktif = pilih === k.id;
          return (
            <Pressable
              key={k.id}
              role="radio"
              aria-checked={aktif}
              onPress={() => setPilih(k.id)}
              style={({ pressed }) => [st.opsi, aktif && st.opsiAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}
            >
              <Avatar id={k.id} ukuran={60} />
              <View style={{ flex: 1, gap: 2 }}>
                <T style={F.b}>
                  {k.nama} <T kecil lembut>· {k.peran}</T>
                </T>
                <T kecil lembut numberOfLines={1}>
                  {k.keahlian.join(', ')}
                </T>
                <T kecil style={[F.sb, { color: terdekat[k.id] ? W.hijau : W.marun }]}>{teksTerdekat(terdekat[k.id])}</T>
                <T kecil lembut>Libur tiap {k.libur.map((d) => HARI[d]).join(', ')}{k.shift ? ` · ${jam(k.shift[0])}–${jam(k.shift[1])}` : ''}</T>
              </View>
              <Centang aktif={aktif} />
            </Pressable>
          );
        })}
        {!siap ? [0, 1, 2].map((i) => <Kerangka key={i} tinggi={96} />) : null}
      </View>
    </Layar>
  );
}

function Centang({ aktif }) {
  return <View style={[st.radio, aktif && st.radioAktif]}>{aktif ? <View style={st.radioTitik} /> : null}</View>;
}

export function TanpaLayanan() {
  return (
    <Layar kembali induk="/booking" judul="Layanan belum dipilih">
      <T>Mulai dari langkah pertama supaya durasi dan harga terhitung.</T>
      <Tombol label="Pilih layanan" href="/booking" replace />
    </Layar>
  );
}

const st = StyleSheet.create({
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1.5, borderColor: W.garis },
  opsiAktif: { borderColor: W.marun, backgroundColor: W.marunMuda },
  semua: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  semuaDalam: { width: 44, height: 44, borderRadius: 22, backgroundColor: W.marun, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: W.marun },
  radioTitik: { width: 12, height: 12, borderRadius: 6, backgroundColor: W.marun },
});
