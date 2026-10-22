import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { W, F, R } from '../lib/tema';
import { layananById, kapsterById, PENGINGAT, OUTLET, BATAS_UBAH_MENIT } from '../lib/data';
import { tanggal, jamDari, hitungMundur, rupiah, MENIT_MS } from '../lib/waktu';
import { useToko, tampilKode, bisaUbah, batalkan, aturPengingat, kirimContoh } from '../lib/store';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Tombol, Kerangka, Kartu, Saklar, Garis } from '../components/ui';
import { Karcis } from '../components/booking';
import { useLembar } from '../components/Akar';
import Ikon from '../components/Ikon';
import Pola from '../components/Pola';

export function generateMetadata() {
  return meta('/karcis');
}

const ALASAN = ['Ada keperluan mendadak', 'Salah pilih jam', 'Mau ganti kapster', 'Lainnya'];

export default function HalamanKarcis() {
  const q = useLocalSearchParams();
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const { buka } = useLembar();
  const kode = q.kode ? String(q.kode) : '';
  const b = siap ? bookings.find((x) => x.kode === kode) : null;

  if (siap && !b) {
    return (
      <Layar kembali induk="/jadwal" judul="Karcis tidak ditemukan">
        <T>Kode {kode ? tampilKode(kode) : ''} tidak ada di perangkat ini. Karcis demo hanya tersimpan di peramban tempat booking dibuat.</T>
        <Tombol label="Ke Jadwalku" href="/jadwal" replace />
      </Layar>
    );
  }

  const baru = siap && q.baru === '1';
  const diubah = siap && q.diubah === '1';
  const aktif = b && b.status === 'aktif';
  const boleh = b && bisaUbah(b, sekarang);
  const l = b ? layananById[b.layanan] : null;
  const k = b ? kapsterById[b.kapster] : null;

  const teksBagikan = b
    ? `Booking Kursi Putar ${tampilKode(b.kode)}: ${l.nama} dengan ${k.nama}, ${tanggal(b.mulai)} pukul ${jamDari(b.mulai)} WIB. ${OUTLET.alamat}.`
    : '';

  const mintaBatal = () =>
    buka(
      (tutup) => <LembarBatal b={b} tutup={tutup} />,
      { judul: 'Batalkan booking?' },
    );

  return (
    <Layar kembali induk="/jadwal" judul={baru ? 'Booking tersimpan' : diubah ? 'Jadwal diperbarui' : 'Karcis booking'} sub={b ? `${l.nama} · ${k.nama}` : null}>
      {baru || diubah ? (
        <View style={st.sukses} role="status">
          <View style={st.suksesIkon}>
            <Pola jenis="tegel" varian="hijau" ukuran={26} />
            <Ikon nama="centang" ukuran={22} warna={W.krem} tebal={3} />
          </View>
          <T style={[F.b, { flex: 1 }]}>
            {baru ? 'Kursimu sudah dipesan. Tunjukkan kode ini di kasir.' : 'Jam lama sudah dilepas, jam baru tersimpan.'}
          </T>
        </View>
      ) : null}

      {!b ? <Kerangka tinggi={200} /> : <Karcis b={b} />}

      {b && aktif ? (
        <T style={[F.sb, { color: W.hijau }]}>
          {hitungMundur(b.mulai, sekarang)[0].toUpperCase() + hitungMundur(b.mulai, sekarang).slice(1)} · datang 10 menit lebih awal
        </T>
      ) : null}

      {b && b.catatan ? (
        <Kartu style={{ gap: 4 }}>
          <T kecil lembut style={F.sb}>
            Catatan untuk kapster
          </T>
          <T>“{b.catatan}”</T>
        </Kartu>
      ) : null}

      {b && b.status === 'batal' ? (
        <T lembut>
          Dibatalkan {tanggal(b.dibatalkan || b.mulai, { pendek: true })}
          {b.alasan ? ` · ${b.alasan}` : ''}.
        </T>
      ) : null}

      {b && aktif ? (
        <View style={{ gap: 10 }}>
          <View style={st.duaTombol}>
            <Tombol
              style={{ flex: 1 }}
              varian="hijau"
              ikon="kalender"
              label="Ubah jadwal"
              disabled={!boleh}
              onPress={() => router.push({ pathname: '/booking/waktu', params: { ubah: b.kode } })}
            />
            <Tombol style={{ flex: 1 }} varian="garis" ikon="silang" label="Batalkan" disabled={!boleh} onPress={mintaBatal} />
          </View>
          <T kecil lembut>
            {boleh ? `Ubah atau batalkan paling lambat ${BATAS_UBAH_MENIT / 60} jam sebelum jadwal.` : 'Sudah kurang dari 1 jam sebelum jadwal; perubahan lewat WhatsApp outlet.'}
          </T>
        </View>
      ) : null}

      {b && aktif ? (
        <Kartu style={{ gap: 2 }}>
          <Judul level={2}>Pengingat</Judul>
          <T kecil lembut>Muncul sebagai notifikasi di dalam aplikasi (simulasi).</T>
          {PENGINGAT.map((p, i) => {
            const lewat = b.mulai - p.menit * MENIT_MS <= sekarang;
            const terkirim = b.terkirim.includes(p.id) && b.pengingat.includes(p.id);
            return (
              <View key={p.id}>
                {i ? <Garis /> : null}
                <Saklar
                  label={p.label}
                  ket={terkirim ? 'Sudah dikirim' : lewat ? 'Waktunya sudah lewat' : null}
                  nilai={b.pengingat.includes(p.id)}
                  disabled={lewat && !terkirim}
                  ubah={(v) => aturPengingat(b.kode, p.id, v)}
                />
              </View>
            );
          })}
          <Tombol kecil varian="lembut" ikon="lonceng" label="Coba pengingat sekarang" onPress={() => kirimContoh(b.kode)} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
        </Kartu>
      ) : null}

      {b ? (
        <View style={st.duaTombol}>
          <Tombol
            style={{ flex: 1 }}
            varian="lembut"
            ikon="bagikan"
            label="Bagikan"
            aksesLabel="Bagikan detail booking lewat WhatsApp"
            onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(teksBagikan)}`)}
          />
          {!aktif ? (
            <Tombol
              style={{ flex: 1 }}
              ikon="ulang"
              label="Pesan lagi"
              href={{ pathname: '/booking/waktu', params: { layanan: b.layanan, kapster: b.kapster, ...(b.tambahan.length ? { tambah: b.tambahan.join(',') } : {}) } }}
            />
          ) : (
            <Tombol style={{ flex: 1 }} varian="lembut" ikon="toko" label="Info outlet" href="/outlet" />
          )}
        </View>
      ) : null}
    </Layar>
  );
}

function LembarBatal({ b, tutup }) {
  const [alasan, setAlasan] = useState(ALASAN[0]);
  return (
    <>
      <T>
        {layananById[b.layanan].nama} dengan {kapsterById[b.kapster].nama}, {tanggal(b.mulai)} pukul {jamDari(b.mulai)} WIB. Kursinya akan dilepas untuk pelanggan lain.
      </T>
      <View role="radiogroup" aria-label="Alasan pembatalan" style={{ gap: 6 }}>
        {ALASAN.map((a) => {
          const aktif = a === alasan;
          return (
            <Pressable key={a} role="radio" aria-checked={aktif} onPress={() => setAlasan(a)} style={({ pressed }) => [st.alasan, aktif && st.alasanAktif, pressed && { opacity: 0.85 }]}>
              <View style={[st.radio, aktif && { borderColor: W.marun }]}>{aktif ? <View style={st.radioTitik} /> : null}</View>
              <T style={F.sb}>{a}</T>
            </Pressable>
          );
        })}
      </View>
      <Tombol
        label="Ya, batalkan booking"
        onPress={() => {
          batalkan(b.kode, alasan);
          tutup();
        }}
      />
      <Tombol varian="lembut" label="Tidak jadi" onPress={tutup} />
    </>
  );
}

const st = StyleSheet.create({
  sukses: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.besar, backgroundColor: W.mint, borderWidth: 1, borderColor: W.mintTua, overflow: 'hidden' },
  suksesIkon: { width: 44, height: 44, borderRadius: 14, overflow: 'hidden', backgroundColor: W.hijau, alignItems: 'center', justifyContent: 'center' },
  duaTombol: { flexDirection: 'row', gap: 10 },
  alasan: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih },
  alasanAktif: { borderColor: W.marun, backgroundColor: W.krem },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  radioTitik: { width: 10, height: 10, borderRadius: 5, backgroundColor: W.marun },
});
