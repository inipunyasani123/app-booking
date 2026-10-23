import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { W, F, R } from '../lib/tema';
import { layananById, kapsterById, PENGINGAT, OUTLET, BATAS_UBAH_MENIT, CHECKIN_SEBELUM } from '../lib/data';
import { tanggal, jamDari, hitungMundur, MENIT_MS, hariKe, hariPekan, HARI } from '../lib/waktu';
import { useToko, tampilKode, bisaUbah, batalkan, aturPengingat, kirimContoh, bisaCheckin, jendelaCheckin, checkIn, atasNama } from '../lib/store';
import { tambahKeKalender } from '../lib/kalender';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Tombol, Kerangka, Kartu, Saklar, Garis, Taut } from '../components/ui';
import { Karcis } from '../components/booking';
import { useLembar } from '../components/Akar';
import Ikon from '../components/Ikon';
import Pola from '../components/Pola';
import KodeQR from '../components/KodeQR';

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
  const bisaHadir = b && bisaCheckin(b, sekarang);
  const selesaiMs = b ? b.mulai + b.durasi * MENIT_MS : 0;

  const teksBagikan = b
    ? `Booking Kursi Putar ${tampilKode(b.kode)}: ${l.nama} dengan ${k.nama}, ${tanggal(b.mulai)} pukul ${jamDari(b.mulai)} WIB, atas nama ${atasNama(b)}. ${OUTLET.alamat}.`
    : '';
  const mintaBatal = () => buka((tutup) => <LembarBatal b={b} tutup={tutup} />, { judul: 'Batalkan booking?' });
  const hubungi = () =>
    buka(
      (tutup) => (
        <>
          <T>Ini demo, jadi nomor outlet tidak dicantumkan. Pesan WhatsApp sudah terisi kode karcismu; kamu tinggal memilih kontak.</T>
          <Tombol
            varian="hijau"
            ikon="obrolan"
            label="Chat lewat WhatsApp"
            onPress={() => {
              Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`Halo Kursi Putar, saya punya karcis ${tampilKode(b.kode)} (${tanggal(b.mulai, { pendek: true })} ${jamDari(b.mulai)}).`)}`);
              tutup();
            }}
          />
          <Tombol varian="lembut" label="Tutup" onPress={tutup} />
        </>
      ),
      { judul: 'Hubungi outlet (simulasi)' },
    );

  return (
    <Layar kembali induk="/jadwal" judul={baru ? 'Karcis tercetak' : diubah ? 'Jadwal diperbarui' : 'Karcis booking'} sub={b ? `${l.nama} · ${k.nama}` : null}>
      {baru || diubah ? (
        <View style={st.sukses} role="status">
          <View style={st.suksesIkon}>
            <Pola jenis="belang" varian="pangkas" lebarBelang={5} />
            <View style={st.suksesDalam}>
              <Ikon nama="centang" ukuran={20} warna={W.krem} tebal={3} />
            </View>
          </View>
          <T style={[F.b, { flex: 1 }]}>{baru ? `Kursi ${k ? k.nama : ''} sudah dipesan. Tunjukkan kode ini di kasir.` : 'Jam lama sudah dilepas, jam baru tersimpan.'}</T>
        </View>
      ) : null}

      {baru ? <View style={st.celah} aria-hidden /> : null}
      {!b ? (
        <Kerangka tinggi={330} />
      ) : (
        <Karcis b={b} lengkap cetak={baru} qr={<KodeQR teks={`Kursi Putar (demo) · karcis ${tampilKode(b.kode)}`} ukuran={92} label={`Kode QR simulasi karcis ${tampilKode(b.kode)}`} />} />
      )}

      {b && aktif ? (
        <View style={{ gap: 10 }}>
          {b.hadir ? (
            <View style={st.hadir} role="status">
              <Ikon nama="lokasi" warna={W.krem} />
              <T style={[F.b, { flex: 1, color: W.krem }]}>
                Sudah sampai pukul {jamDari(b.hadir)}. {k.nama} memanggil sesuai jadwal {jamDari(b.mulai)} WIB.
              </T>
            </View>
          ) : (
            <>
              <T style={[F.sb, { color: W.hijau }]}>
                {hitungMundur(b.mulai, sekarang)[0].toUpperCase() + hitungMundur(b.mulai, sekarang).slice(1)} · datang 10 menit lebih awal
              </T>
              <Tombol
                ikon="lokasi"
                label={bisaHadir ? 'Saya sudah sampai' : `“Saya sudah sampai” aktif ${hariKe(jendelaCheckin(b)[0]) === hariKe(sekarang) ? '' : HARI[hariPekan(hariKe(jendelaCheckin(b)[0]))] + ' '}${jamDari(jendelaCheckin(b)[0])}`}
                disabled={!bisaHadir}
                onPress={() => checkIn(b.kode)}
                penuh
              />
              {!bisaHadir ? <T kecil lembut>Tombol aktif {CHECKIN_SEBELUM} menit sebelum jadwal sampai 15 menit sesudahnya (simulasi check-in di outlet).</T> : null}
            </>
          )}
        </View>
      ) : null}

      {b ? (
        <View style={st.aksiBaris} role="list">
          <Aksi ikon="arah" label="Arah" href="/outlet" />
          {aktif ? <Aksi ikon="kalenderTambah" label="Kalender" onPress={() => tambahKeKalender(b)} /> : null}
          <Aksi ikon="bagikan" label="Bagikan" onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(teksBagikan)}`)} />
          <Aksi ikon="telepon" label="Hubungi" onPress={hubungi} />
        </View>
      ) : null}

      {b && b.status === 'batal' ? (
        <T lembut>
          Dibatalkan {tanggal(b.dibatalkan || b.mulai, { pendek: true })}
          {b.alasan ? ` · ${b.alasan}` : ''}.
        </T>
      ) : null}

      {b && aktif ? (
        <View style={{ gap: 8 }}>
          <View style={st.duaTombol}>
            <Tombol style={{ flex: 1 }} varian="hijau" ikon="kalender" label="Ubah jadwal" disabled={!boleh} onPress={() => router.push({ pathname: '/booking/waktu', params: { ubah: b.kode } })} />
            <Tombol style={{ flex: 1 }} varian="garis" ikon="silang" label="Batalkan" disabled={!boleh} onPress={mintaBatal} />
          </View>
          <T kecil lembut>
            {boleh
              ? `Ubah atau batalkan paling lambat ${BATAS_UBAH_MENIT / 60} jam sebelum jadwal.`
              : b.hadir
                ? 'Kamu sudah check-in, jadwal tidak bisa diubah lagi.'
                : 'Sudah kurang dari 1 jam sebelum jadwal; perubahan lewat WhatsApp outlet.'}
          </T>
        </View>
      ) : null}

      {b && aktif && !b.hadir ? (
        <Kartu style={st.sambung}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ikon nama="anak" warna={W.hijau} />
            <T style={[F.b, { flex: 1 }]}>Datang berdua?</T>
          </View>
          <T kecil lembut>Pesan karcis kedua untuk anak atau orang lain, mulai pukul {jamDari(selesaiMs)} supaya bisa bergantian.</T>
          <View style={st.duaTombol}>
            <Tombol style={{ flex: 1 }} kecil varian="garis" label="Untuk anak" href={{ pathname: '/booking', params: { untuk: 'anak', setelah: String(selesaiMs) } }} />
            <Tombol style={{ flex: 1 }} kecil varian="garis" label="Orang lain" href={{ pathname: '/booking', params: { untuk: 'lain', setelah: String(selesaiMs) } }} />
          </View>
        </Kartu>
      ) : null}

      {b && b.catatan ? (
        <Kartu style={{ gap: 4 }}>
          <T kecil lembut style={F.sb}>
            Catatan untuk kapster
          </T>
          <T>“{b.catatan}”</T>
        </Kartu>
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

      {b && !aktif ? (
        <Tombol
          ikon="ulang"
          label="Pesan lagi"
          href={{ pathname: '/booking/waktu', params: { layanan: b.layanan, kapster: b.kapster, ...(b.tambahan.length ? { tambah: b.tambahan.join(',') } : {}) } }}
        />
      ) : null}
    </Layar>
  );
}

function Aksi({ ikon, label, onPress, href }) {
  const isi = (
    <>
      <View style={st.aksiIkon}>
        <Ikon nama={ikon} warna={W.marun} />
      </View>
      <Text style={st.aksiLabel}>{label}</Text>
    </>
  );
  return (
    <View role="listitem" style={{ flex: 1 }}>
      {href ? (
        <Taut href={href} gaya={({ pressed }) => [st.aksi, pressed && { opacity: 0.75 }]}>
          {isi}
        </Taut>
      ) : (
        <Pressable role="button" onPress={onPress} style={({ pressed }) => [st.aksi, pressed && { opacity: 0.75 }]}>
          {isi}
        </Pressable>
      )}
    </View>
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
  sukses: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: R.besar, backgroundColor: W.mint, borderWidth: 1, borderColor: W.mintTua },
  suksesIkon: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  suksesDalam: { width: 32, height: 32, borderRadius: 16, backgroundColor: W.hijau, alignItems: 'center', justifyContent: 'center' },
  celah: { height: 10, marginHorizontal: 8, marginBottom: -14, borderRadius: 5, backgroundColor: W.tinta, zIndex: 2 },
  hadir: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: R.sedang, backgroundColor: W.hijau },
  aksiBaris: { flexDirection: 'row', gap: 8 },
  aksi: { alignItems: 'center', gap: 6, paddingVertical: 4, minHeight: 72 },
  aksiIkon: { width: 52, height: 52, borderRadius: 26, backgroundColor: W.putih, borderWidth: 1.5, borderColor: W.garis, alignItems: 'center', justifyContent: 'center' },
  aksiLabel: { ...F.b, fontSize: 13, lineHeight: 16, color: W.tinta },
  duaTombol: { flexDirection: 'row', gap: 10 },
  sambung: { gap: 8 },
  alasan: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih },
  alasanAktif: { borderColor: W.marun, backgroundColor: W.marunMuda },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: W.garisTegas, alignItems: 'center', justifyContent: 'center' },
  radioTitik: { width: 10, height: 10, borderRadius: 5, backgroundColor: W.marun },
});
