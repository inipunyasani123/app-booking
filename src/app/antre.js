import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { W, F, R, angkaTabel } from '../lib/tema';
import { layananById, kapsterById, LAYANAN_ANTRE, ANTRE_DETIK_PER_ORANG, ANTRE_BUKA_LEBIH_AWAL } from '../lib/data';
import { jam, jamDari, durasi, rupiah, hariKe, HARI, hariPekan, hitungMundur, pada, MENIT_MS } from '../lib/waktu';
import { useToko, ambilAntre, batalAntre, selesaiAntre, detak } from '../lib/store';
import { kondisiAntre } from '../lib/slot';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Label, Tombol, Kerangka, Kartu } from '../components/ui';
import { DeretKursi } from '../components/booking';
import Ikon from '../components/Ikon';
import Pola from '../components/Pola';

export function generateMetadata() {
  return meta('/antre');
}

export default function Antre() {
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const antre = useToko((s) => s.antre);
  const nama = useToko((s) => s.profil.nama);
  const [layanan, setLayanan] = useState('pangkas-reguler');
  const [untuk, setUntuk] = useState('saya');
  const [namaLain, setNamaLain] = useState('');
  const [selesai, setSelesai] = useState(false);

  // Simulasi: antrean diperbarui tiap 3 detik selama layar ini terbuka.
  useEffect(() => {
    if (!antre || antre.status !== 'menunggu') return;
    const id = setInterval(detak, 3000);
    return () => clearInterval(id);
  }, [antre?.status]);

  const k = useMemo(() => (siap ? kondisiAntre(sekarang, bookings) : null), [siap, Math.floor(sekarang / 30000), bookings]);
  const hIni = hariKe(sekarang);

  return (
    <Layar kembali judul="Antre datang langsung" sub="Tanpa janji · nomor antre simulasi">
      <T style={st.pengantar}>
        Datang tanpa janji? Ambil nomor dari sini, pantau berapa orang sebelum kamu, lalu datang saat giliranmu hampir tiba. Kursi kosong dihitung dari jadwal kapster dan booking yang sudah masuk.
      </T>
      {!siap ? (
        <Kerangka tinggi={260} />
      ) : antre ? (
        <Tiket antre={antre} sekarang={sekarang} k={k} />
      ) : selesai ? (
        <Kartu style={{ gap: 8 }}>
          <Judul level={2}>Kunjungan tercatat</Judul>
          <T>Satu cap masuk ke kartumu dan kunjungan ini muncul di Riwayat.</T>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tombol style={{ flex: 1 }} kecil label="Lihat kartu cap" href="/profil" />
            <Tombol style={{ flex: 1 }} kecil varian="garis" label="Riwayat" href="/jadwal" />
          </View>
        </Kartu>
      ) : (
        <>
          <Kartu style={{ gap: 12 }}>
            <View style={st.statusBaris}>
              <View style={[st.titikStatus, { backgroundColor: k.buka ? W.hijau : W.marun }]} />
              <T style={F.b}>
                {k.buka
                  ? `Buka sampai ${jam(k.tutup)}`
                  : k.awal
                    ? `Buka ${jam(k.berikut.menit)}, antre sudah dibuka`
                    : k.berikut
                      ? `Tutup · buka ${k.berikut.h === hIni ? 'hari ini' : k.berikut.h === hIni + 1 ? 'besok' : HARI[hariPekan(k.berikut.h)]} ${jam(k.berikut.menit)}`
                      : 'Tutup'}
              </T>
            </View>
            {k.kursi.length ? (
              <>
                <Label>Kursi sekarang</Label>
                <DeretKursi kursi={k.kursi} />
              </>
            ) : null}
            {k.terima ? (
              <View style={st.ringkas} aria-live="polite">
                <Text style={[st.angka, angkaTabel]}>{k.menunggu}</Text>
                <T style={{ flex: 1 }}>
                  orang menunggu.{' '}
                  {k.perkiraan === 0 ? 'Ada kursi kosong: nomor baru langsung dilayani.' : `Nomor baru diperkirakan dilayani ±${k.perkiraan} menit lagi.`}
                </T>
              </View>
            ) : (
              <T lembut>
                {k.berikut
                  ? `Antre dibuka ${jam(Math.max(0, k.berikut.menit - ANTRE_BUKA_LEBIH_AWAL))}, ${hitungMundur(pada(k.berikut.h, k.berikut.menit - ANTRE_BUKA_LEBIH_AWAL), sekarang)}. Mau pasti dapat kursi? Booking jam kosong saja.`
                  : 'Antre ditutup 30 menit sebelum jam tutup.'}
              </T>
            )}
          </Kartu>

          {k.terima ? (
            <View style={{ gap: 12 }}>
              <Judul level={2}>Ambil nomor</Judul>
              <View role="radiogroup" aria-label="Layanan untuk antre" style={st.pilihan}>
                {LAYANAN_ANTRE.map((id) => {
                  const l = layananById[id];
                  const aktif = layanan === id;
                  return (
                    <Pressable key={id} role="radio" aria-checked={aktif} onPress={() => setLayanan(id)} style={({ pressed }) => [st.opsi, aktif && st.opsiAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}>
                      <T style={[F.b, { flex: 1 }]}>{l.nama}</T>
                      <T kecil lembut>
                        {durasi(l.menit)} · {rupiah(l.harga)}
                      </T>
                    </Pressable>
                  );
                })}
              </View>
              <View role="radiogroup" aria-label="Atas nama" style={st.untukBaris}>
                {[
                  { id: 'saya', label: `Saya (${nama})` },
                  { id: 'anak', label: 'Anak' },
                  { id: 'lain', label: 'Orang lain' },
                ].map((u) => {
                  const aktif = untuk === u.id;
                  return (
                    <Pressable key={u.id} role="radio" aria-checked={aktif} onPress={() => setUntuk(u.id)} style={({ pressed }) => [st.keping, aktif && st.kepingAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}>
                      <Text style={[st.kepingTeks, aktif && { color: W.krem }]} numberOfLines={1}>
                        {u.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {untuk !== 'saya' ? (
                <TextInput
                  value={namaLain}
                  onChangeText={setNamaLain}
                  aria-label="Nama panggilan untuk nomor antre"
                  placeholder={untuk === 'anak' ? 'Nama anak, misalnya Dafa' : 'Nama panggilan'}
                  placeholderTextColor={W.tintaLembut}
                  maxLength={24}
                  style={st.input}
                />
              ) : null}
              <Tombol
                ikon="antre"
                label={untuk !== 'saya' && !namaLain.trim() ? 'Isi nama dulu' : 'Ambil nomor antre'}
                disabled={untuk !== 'saya' && !namaLain.trim()}
                onPress={() => ambilAntre({ layanan, nama: untuk === 'saya' ? nama : namaLain, untuk: { jenis: untuk } })}
                penuh
              />
              <T kecil lembut>Layanan salon butuh waktu lebih lama, jadi dilayani lewat booking. Simulasi: antrean maju satu orang tiap {ANTRE_DETIK_PER_ORANG} detik.</T>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Tombol style={{ flex: 1 }} label="Booking jam kosong" href="/booking" />
              <Tombol style={{ flex: 1 }} varian="garis" label="Jam buka" href="/outlet" />
            </View>
          )}
        </>
      )}
      {siap && antre && antre.status === 'dipanggil' ? (
        <View style={{ gap: 10 }}>
          <Tombol
            ikon="centang"
            label="Selesai dilayani (simulasi)"
            onPress={() => {
              selesaiAntre();
              setSelesai(true);
            }}
            penuh
          />
          <Tombol varian="lembut" label="Batal antre" onPress={batalAntre} />
        </View>
      ) : null}
    </Layar>
  );
}

function Tiket({ antre, sekarang, k }) {
  const l = layananById[antre.layanan];
  const kap = kapsterById[antre.kapster];
  const mulai = Math.max(sekarang, antre.palingCepat);
  const jalan = Math.max(0, sekarang - antre.palingCepat);
  const depan = Math.max(0, antre.depanAwal - Math.floor(jalan / (ANTRE_DETIK_PER_ORANG * 1000)));
  const dipanggil = antre.status === 'dipanggil';
  const sisaMenit = dipanggil ? 0 : Math.max(depan ? 5 : 0, Math.round((antre.perkiraan * (depan + 1)) / (antre.depanAwal + 1)));
  const belumBuka = antre.palingCepat - sekarang > 60000;
  const total = antre.depanAwal + 1;
  const maju = total - depan - (dipanggil ? 0 : 1);
  return (
    <View style={{ gap: 12 }}>
      <View style={[st.tiket, dipanggil && { borderColor: W.hijau }]}>
        <View style={st.tiketPita}>
          <Pola jenis="belang" varian="pangkas" lebarBelang={6} />
        </View>
        <Text style={st.tiketLabel}>{dipanggil ? 'GILIRANMU' : 'NOMOR ANTRE'}</Text>
        <Text style={[st.nomor, angkaTabel]} aria-label={`Nomor antre ${antre.nomor}`}>
          {antre.nomor}
        </Text>
        <T style={F.b}>
          {l.nama} · atas nama {antre.nama}
          {antre.untuk?.jenis === 'anak' ? ' (anak)' : ''}
        </T>
        <View style={st.garisPutus} />
        {dipanggil ? (
          <View style={st.dipanggil} role="status">
            <Ikon nama="kursi" warna={W.krem} />
            <T style={[F.b, { color: W.krem, flex: 1 }]}>Silakan ke kursi {kap.nama}. Sebutkan nomor {antre.nomor} ke kapster.</T>
          </View>
        ) : (
          <View style={{ gap: 10 }} aria-live="polite">
            <T style={F.b}>{depan ? `${depan} orang sebelum kamu` : 'Kamu yang berikutnya'}</T>
            <View style={st.orangBaris} role="img" aria-label={`Posisi ${depan + 1} dari ${total}`}>
              {Array.from({ length: total }).map((_, i) => {
                const lewat = i < maju;
                const kamu = i === total - 1;
                return (
                  <View key={i} style={st.orang}>
                    <View style={[st.orangIkon, lewat && { opacity: 0.35 }, kamu && { backgroundColor: W.marun }]}>
                      <Ikon nama="orang" ukuran={18} warna={kamu ? W.krem : W.hijau} />
                    </View>
                    <Text style={[st.orangLabel, kamu && { color: W.marun }]}>{kamu ? 'Kamu' : lewat ? 'selesai' : ' '}</Text>
                  </View>
                );
              })}
            </View>
            <T kecil lembut>
              {belumBuka
                ? `Pelayanan mulai ${jamDari(antre.palingCepat)} WIB. Perkiraan dipanggil sekitar ${jamDari(antre.palingCepat + sisaMenit * MENIT_MS)}.`
                : `Perkiraan ±${sisaMenit} menit lagi, sekitar ${jamDari(mulai + sisaMenit * MENIT_MS)} WIB. Kapster: ${kap.nama}.`}
            </T>
          </View>
        )}
      </View>
      {k && k.kursi.length ? (
        <Kartu style={{ gap: 10 }}>
          <Label>Kursi sekarang</Label>
          <DeretKursi kursi={k.kursi} kamu={dipanggil ? antre.kapster : null} />
          <T kecil lembut>
            Kamu dijadwalkan ke kursi {kap.nama}. Boleh menunggu di luar; notifikasi muncul saat giliranmu tiba.
          </T>
        </Kartu>
      ) : null}
      {!dipanggil ? (
        <>
          <Tombol varian="garis" ikon="silang" label="Batal antre" onPress={batalAntre} />
          <T kecil lembut>Simulasi: antrean maju satu orang tiap {ANTRE_DETIK_PER_ORANG} detik selama halaman ini terbuka. Di aplikasi sungguhan urutan diatur kasir.</T>
        </>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  pengantar: { fontSize: 16, lineHeight: 24 },
  statusBaris: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titikStatus: { width: 10, height: 10, borderRadius: 5 },
  ringkas: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.sedang, backgroundColor: W.mint },
  angka: { ...F.display, fontSize: 40, lineHeight: 46, color: W.tinta },
  pilihan: { gap: 8 },
  opsi: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingHorizontal: 14, borderRadius: R.sedang, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih },
  opsiAktif: { borderColor: W.marun, backgroundColor: W.marunMuda },
  untukBaris: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  keping: { minHeight: 44, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: W.hijau, backgroundColor: W.putih, justifyContent: 'center', maxWidth: '100%' },
  kepingAktif: { backgroundColor: W.hijau },
  kepingTeks: { ...F.b, fontSize: 14, lineHeight: 18, color: W.hijau },
  input: { ...F.r, fontSize: 16, minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: W.garisTegas, paddingHorizontal: 12, color: W.tinta, backgroundColor: W.putih },
  tiket: { padding: 18, paddingTop: 28, borderRadius: R.besar, backgroundColor: W.krem, borderWidth: 1.5, borderColor: W.garisKarcis, gap: 4, overflow: 'hidden' },
  tiketPita: { position: 'absolute', left: 0, right: 0, top: 0, height: 12 },
  tiketLabel: { ...F.b, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, color: W.tintaLembut },
  nomor: { ...F.display, fontSize: 72, lineHeight: 80, color: W.marun, letterSpacing: 2 },
  garisPutus: { borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#CDB894', marginVertical: 10 },
  dipanggil: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: R.sedang, backgroundColor: W.hijau },
  orangBaris: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  orang: { alignItems: 'center', gap: 2, width: 52 },
  orangIkon: { width: 40, height: 40, borderRadius: 20, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center' },
  orangLabel: { ...F.b, fontSize: 12, lineHeight: 15, color: W.tintaLembut },
});
