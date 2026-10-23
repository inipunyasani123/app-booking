import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { W, F, R } from '../../lib/tema';
import { TAMBAHAN, KATEGORI, layananById, UNTUK, SERING, layananUntuk } from '../../lib/data';
import { durasi, rupiah } from '../../lib/waktu';
import { hitungPesanan, useToko } from '../../lib/store';
import { teruskan } from '../../lib/kait';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Judul, Tombol, Lencana, Label, Saklar } from '../../components/ui';
import { Langkah } from '../../components/booking';
import Ikon from '../../components/Ikon';

export function generateMetadata() {
  return meta('/booking');
}

const IKON_UNTUK = { saya: 'orang', anak: 'anak', lain: 'berdua' };

export default function PilihLayanan() {
  const q = useLocalSearchParams();
  const siap = useToko((s) => s.siap);
  const [untuk, setUntuk] = useState('saya');
  const [nama, setNama] = useState('');
  const [privat, setPrivat] = useState(false);
  const [layanan, setLayanan] = useState(null);
  const [tambah, setTambah] = useState([]);
  const gulir = useRef(null);
  const posisi = useRef({});

  useEffect(() => {
    if (q.untuk === 'anak' || q.untuk === 'lain') setUntuk(String(q.untuk));
    if (q.nama) setNama(String(q.nama));
    if (q.privat === '1') setPrivat(true);
    if (q.layanan && layananById[q.layanan]) setLayanan(String(q.layanan));
    if (q.tambah) setTambah(String(q.tambah).split(',').filter((id) => layananById[id]));
  }, [q.layanan, q.tambah, q.untuk, q.nama, q.privat]);

  const daftar = layananUntuk(untuk, untuk === 'lain' && privat);
  // Pilihan yang tidak lagi cocok dengan "untuk siapa" dilepas.
  useEffect(() => {
    if (layanan && !daftar.some((l) => l.id === layanan)) setLayanan(untuk === 'anak' ? 'pangkas-anak' : null);
    if (untuk === 'anak' && !layanan) setLayanan('pangkas-anak');
  }, [untuk, privat]);

  const p = hitungPesanan(layanan, tambah);
  const alih = (id) => setTambah((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));
  const perluNama = untuk !== 'saya' && !nama.trim();
  const alasan = !layanan ? 'Pilih layanan dulu' : perluNama ? `Isi nama ${untuk === 'anak' ? 'anak' : 'orang yang dipesankan'} dulu` : null;
  const lanjut = () =>
    router.push({
      pathname: '/booking/kapster',
      params: {
        layanan,
        ...teruskan(q, { tambah: tambah.join(','), untuk: untuk === 'saya' ? '' : untuk, nama: untuk === 'saya' ? '' : nama.trim(), privat: untuk === 'lain' && privat ? '1' : '' }),
        ...(q.kapster ? { kapster: String(q.kapster) } : {}),
      },
    });
  const lompat = (id) => gulir.current?.scrollTo({ y: Math.max(0, (posisi.current[id] || 0) - 8), animated: true });
  const kategori = KATEGORI.filter((k) => k.id === 'tambahan' || daftar.some((l) => l.kat === k.id));

  return (
    <Layar
      kembali
      judul="Pilih layanan"
      sebelumJudul={<Langkah ke={1} />}
      refGulir={gulir}
      bawahKepala={
        <View style={st.lompat} role="toolbar" aria-label="Lompat ke bagian">
          {[{ id: 'untuk', nama: 'Untuk siapa' }, ...kategori].map((k) => (
            <Pressable key={k.id} role="button" onPress={() => lompat(k.id)} style={({ pressed }) => [st.keping, pressed && { backgroundColor: W.mint }]}>
              <Text style={st.kepingTeks}>{k.nama}</Text>
            </Pressable>
          ))}
        </View>
      }
      bawah={
        <>
          <View style={st.ringkas} aria-live="polite">
            <T kecil style={[F.sb, { flex: 1 }]} numberOfLines={1}>
              {layanan ? `${p.item.map((l) => l.nama).join(' + ')} · ${durasi(p.durasi)}` : alasan}
            </T>
            <Text style={st.total}>{layanan ? `${p.mulai ? 'mulai ' : ''}${rupiah(p.total)}` : ''}</Text>
          </View>
          <Tombol label={alasan || 'Pilih kapster'} ikonKanan={alasan ? null : 'kanan'} disabled={!!alasan} onPress={lanjut} penuh />
        </>
      }
    >
      <View style={{ gap: 10 }} onLayout={(e) => (posisi.current.untuk = e.nativeEvent.layout.y)}>
        <Judul level={2}>Untuk siapa?</Judul>
        <View role="radiogroup" aria-label="Untuk siapa booking ini" style={st.untukBaris}>
          {UNTUK.map((u) => {
            const aktif = untuk === u.id;
            return (
              <Pressable
                key={u.id}
                role="radio"
                aria-checked={aktif}
                onPress={() => setUntuk(u.id)}
                style={({ pressed }) => [st.untuk, aktif && st.untukAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}
              >
                <View style={[st.untukIkon, aktif && { backgroundColor: W.marun }]}>
                  <Ikon nama={IKON_UNTUK[u.id]} ukuran={20} warna={aktif ? W.krem : W.hijau} />
                </View>
                <Text style={st.untukNama}>{u.label}</Text>
                <Text style={st.untukKet}>{u.ket}</Text>
              </Pressable>
            );
          })}
        </View>
        {untuk !== 'saya' ? (
          <View style={{ gap: 6 }}>
            <Label nativeID="label-untuk">{untuk === 'anak' ? 'Nama panggilan anak' : 'Nama panggilan'}</Label>
            <TextInput
              value={nama}
              onChangeText={setNama}
              aria-label={untuk === 'anak' ? 'Nama panggilan anak' : 'Nama panggilan'}
              placeholder={untuk === 'anak' ? 'Misalnya Dafa' : 'Misalnya Sinta'}
              placeholderTextColor={W.tintaLembut}
              maxLength={24}
              style={st.input}
            />
            {untuk === 'anak' ? <T kecil lembut>Pangkas Anak ditangani Pak Wiryo atau Laras, ada dudukan khusus anak.</T> : null}
            {untuk === 'lain' ? (
              <Saklar
                label="Perlu ruang privat"
                ket="Bilik bertirai, ditangani penata perempuan (Laras atau Sekar)."
                nilai={privat}
                ubah={setPrivat}
              />
            ) : null}
          </View>
        ) : null}
      </View>

      {kategori
        .filter((k) => k.id !== 'tambahan')
        .map((k) => (
          <View key={k.id} style={{ gap: 8 }} onLayout={(e) => (posisi.current[k.id] = e.nativeEvent.layout.y)}>
            <Judul level={2}>{k.nama}</Judul>
            <View role="radiogroup" aria-label={`Layanan ${k.nama.toLowerCase()}`} style={{ gap: 8 }}>
              {daftar
                .filter((l) => l.kat === k.id)
                .map((l) => {
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
                      <View style={{ flex: 1, gap: 2 }}>
                        <T style={F.b}>{l.nama}</T>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <T kecil lembut>{durasi(l.menit)}</T>
                          {siap && SERING.includes(l.id) && untuk !== 'anak' ? (
                            <Lencana warna={W.marunTua} latar={W.kuninganMuda}>
                              Sering dipesan
                            </Lencana>
                          ) : null}
                        </View>
                      </View>
                      <Text style={st.harga}>
                        {l.mulai ? <Text style={st.mulai}>mulai </Text> : null}
                        {rupiah(l.harga)}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </View>
        ))}
      <View style={{ gap: 8 }} onLayout={(e) => (posisi.current.tambahan = e.nativeEvent.layout.y)}>
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
                <T kecil lembut>+{durasi(l.menit)}</T>
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
  lompat: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  keping: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: W.hijau, backgroundColor: W.putih, justifyContent: 'center' },
  kepingTeks: { ...F.b, fontSize: 13, lineHeight: 18, color: W.hijau },
  untukBaris: { flexDirection: 'row', gap: 8 },
  untuk: { flex: 1, padding: 10, borderRadius: R.sedang, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih, gap: 4, minHeight: 112 },
  untukAktif: { borderColor: W.marun, backgroundColor: W.marunMuda },
  untukIkon: { width: 36, height: 36, borderRadius: 12, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center' },
  untukNama: { ...F.b, fontSize: 14, lineHeight: 18, color: W.tinta },
  untukKet: { ...F.r, fontSize: 12, lineHeight: 16, color: W.tintaLembut },
  input: { ...F.r, fontSize: 16, minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: W.garisTegas, paddingHorizontal: 12, color: W.tinta, backgroundColor: W.putih },
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.sedang, backgroundColor: W.putih, borderWidth: 1.5, borderColor: W.garis, minHeight: 64 },
  opsiAktif: { borderColor: W.marun, backgroundColor: W.marunMuda },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  radioAktif: { borderColor: W.marun },
  radioTitik: { width: 12, height: 12, borderRadius: 6, backgroundColor: W.marun },
  kotak: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  kotakAktif: { backgroundColor: W.marun, borderColor: W.marun },
  harga: { ...F.display, fontSize: 17, lineHeight: 22, color: W.tinta },
  mulai: { ...F.sb, fontSize: 12, color: W.tintaLembut },
  ringkas: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  total: { ...F.display, fontSize: 20, lineHeight: 26, color: W.tinta },
});
