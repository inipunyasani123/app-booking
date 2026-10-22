import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { W, F, R } from '../../lib/tema';
import { LAYANAN_UTAMA, TAMBAHAN, KATEGORI, layananById } from '../../lib/data';
import { durasi, rupiah } from '../../lib/waktu';
import { hitungPesanan } from '../../lib/store';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Judul, Tombol } from '../../components/ui';
import { Langkah } from '../../components/booking';
import Ikon from '../../components/Ikon';

export function generateMetadata() {
  return meta('/booking');
}

export default function PilihLayanan() {
  const q = useLocalSearchParams();
  const [layanan, setLayanan] = useState(null);
  const [tambah, setTambah] = useState([]);
  useEffect(() => {
    if (q.layanan && layananById[q.layanan]) setLayanan(q.layanan);
    if (q.tambah) setTambah(String(q.tambah).split(',').filter((id) => layananById[id]));
  }, [q.layanan, q.tambah]);

  const p = hitungPesanan(layanan, tambah);
  const alih = (id) => setTambah((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const lanjut = () =>
    router.push({ pathname: '/booking/kapster', params: { layanan, ...(tambah.length ? { tambah: tambah.join(',') } : {}), ...(q.kapster ? { kapster: String(q.kapster) } : {}) } });

  return (
    <Layar
      kembali
      judul="Pilih layanan"
      sebelumJudul={<Langkah ke={1} />}
      bawah={
        <>
          <View style={st.ringkas} aria-live="polite">
            <T kecil lembut style={{ flex: 1 }} numberOfLines={1}>
              {layanan ? `${durasi(p.durasi)} · ${p.item.length} layanan` : 'Belum ada layanan dipilih'}
            </T>
            <Text style={st.total}>{layanan ? `${p.mulai ? 'mulai ' : ''}${rupiah(p.total)}` : ''}</Text>
          </View>
          <Tombol label="Pilih kapster" ikonKanan="kanan" disabled={!layanan} onPress={lanjut} penuh />
        </>
      }
    >
      {KATEGORI.filter((k) => k.id !== 'tambahan').map((k) => (
        <View key={k.id} style={{ gap: 8 }}>
          <Judul level={2}>{k.nama}</Judul>
          <View role="radiogroup" aria-label={`Layanan ${k.nama.toLowerCase()}`} style={{ gap: 8 }}>
            {LAYANAN_UTAMA.filter((l) => l.kat === k.id).map((l) => {
              const aktif = layanan === l.id;
              return (
                <Pressable
                  key={l.id}
                  role="radio"
                  aria-checked={aktif}
                  onPress={() => setLayanan(l.id)}
                  style={({ pressed }) => [st.opsi, aktif && st.opsiAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}
                >
                  <View style={[st.radio, aktif && st.radioAktif]}>{aktif ? <View style={st.radioTitik} /> : null}</View>
                  <View style={{ flex: 1 }}>
                    <T style={F.b}>{l.nama}</T>
                    <T kecil lembut>
                      {durasi(l.menit)}
                    </T>
                  </View>
                  <Text style={st.harga}>
                    {l.mulai ? 'mulai ' : ''}
                    {rupiah(l.harga)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <View style={{ gap: 8 }}>
        <Judul level={2}>Tambahan (opsional)</Judul>
        <T kecil lembut>Durasi tambahan ikut dihitung, jadi jam kosong yang muncul sudah menyesuaikan.</T>
        {TAMBAHAN.map((l) => {
          const aktif = tambah.includes(l.id);
          return (
            <Pressable
              key={l.id}
              role="checkbox"
              aria-checked={aktif}
              onPress={() => alih(l.id)}
              style={({ pressed }) => [st.opsi, aktif && st.opsiAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}
            >
              <View style={[st.kotak, aktif && st.kotakAktif]}>{aktif ? <Ikon nama="centang" ukuran={16} warna={W.krem} tebal={3} /> : null}</View>
              <View style={{ flex: 1 }}>
                <T style={F.b}>{l.nama}</T>
                <T kecil lembut>
                  +{durasi(l.menit)}
                </T>
              </View>
              <Text style={st.harga}>
                <Text style={[F.b, { fontSize: 15 }]}>+ </Text>
                {rupiah(l.harga)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.sedang, backgroundColor: W.putih, borderWidth: 1.5, borderColor: W.garis, minHeight: 64 },
  opsiAktif: { borderColor: W.marun, backgroundColor: W.krem },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: W.marun },
  radioTitik: { width: 12, height: 12, borderRadius: 6, backgroundColor: W.marun },
  kotak: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  kotakAktif: { backgroundColor: W.marun, borderColor: W.marun },
  harga: { ...F.display, fontSize: 17, lineHeight: 22, color: W.tinta },
  ringkas: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  total: { ...F.display, fontSize: 20, lineHeight: 26, color: W.tinta },
});
