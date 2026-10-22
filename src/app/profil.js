import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Linking } from 'react-native';
import { W, F, R } from '../lib/tema';
import { useToko, capTerkumpul, palingSering, simpanNama, aturPengingatBawaan, alihFavorit, aturUlang } from '../lib/store';
import { layananById, PENGINGAT, SITUS } from '../lib/data';
import { rupiah, durasi } from '../lib/waktu';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Label, Saklar, Kerangka, Kartu, Tombol, Garis, Taut } from '../components/ui';
import { KartuCap } from '../components/booking';
import { useLembar } from '../components/Akar';
import Ikon from '../components/Ikon';
import Pola from '../components/Pola';

export function generateMetadata() {
  return meta('/profil');
}

export default function Profil() {
  const siap = useToko((s) => s.siap);
  const profil = useToko((s) => s.profil);
  const bookings = useToko((s) => s.bookings);
  const favorit = useToko((s) => s.favorit);
  const hadiahDipakai = useToko((s) => s.hadiahDipakai);
  const [nama, setNama] = useState('');
  const [ubahNama, setUbahNama] = useState(false);
  const { buka } = useLembar();
  useEffect(() => setNama(profil.nama), [profil.nama]);

  const cap = capTerkumpul({ bookings, hadiahDipakai });
  const sering = palingSering(bookings).slice(0, 3);

  const konfirmasiUlang = () =>
    buka(
      (tutup) => (
        <>
          <T>Semua booking, riwayat, favorit, dan notifikasi di perangkat ini diganti dengan data contoh awal.</T>
          <Tombol
            label="Ya, atur ulang"
            ikon="ulang"
            onPress={() => {
              aturUlang();
              tutup();
            }}
          />
          <Tombol varian="lembut" label="Batal" onPress={tutup} />
        </>
      ),
      { judul: 'Atur ulang data demo?' },
    );

  return (
    <Layar besar tab judul="Profil" sub="Data tersimpan di perangkat ini">
      <Kartu style={st.identitas}>
        <View style={st.monogram} aria-hidden>
          <Pola jenis="tegel" varian="marun" ukuran={28} />
          <Text style={st.monogramHuruf}>{siap ? profil.nama.slice(0, 1).toUpperCase() : ''}</Text>
        </View>
        {ubahNama ? (
          <View style={{ flex: 1, gap: 8 }}>
            <TextInput
              value={nama}
              onChangeText={setNama}
              aria-label="Nama panggilan"
              placeholder="Nama panggilan"
              placeholderTextColor={W.tintaLembut}
              style={st.input}
              maxLength={24}
              autoFocus
              onSubmitEditing={() => {
                simpanNama(nama);
                setUbahNama(false);
              }}
            />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Tombol
                kecil
                label="Simpan"
                onPress={() => {
                  simpanNama(nama);
                  setUbahNama(false);
                }}
              />
              <Tombol kecil varian="lembut" label="Batal" onPress={() => setUbahNama(false)} />
            </View>
          </View>
        ) : (
          <>
            <View style={{ flex: 1 }}>
              <Label>Nama di karcis</Label>
              <Text style={st.nama}>{siap ? profil.nama : '…'}</Text>
            </View>
            <Tombol kecil varian="lembut" ikon="pensil" label="Ubah" aksesLabel="Ubah nama" onPress={() => setUbahNama(true)} />
          </>
        )}
      </Kartu>

      <Kartu style={{ gap: 12, backgroundColor: W.krem }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ikon nama="hadiah" warna={W.marun} />
          <Judul level={2} style={{ flex: 1 }}>
            Kartu cap kunjungan
          </Judul>
        </View>
        {siap ? <KartuCap jumlah={cap} /> : <Kerangka tinggi={70} />}
        <T kecil lembut>Cap bertambah otomatis setelah jadwalmu lewat (simulasi kunjungan selesai).</T>
      </Kartu>

      <View style={{ gap: 10 }}>
        <Judul level={2}>Layanan favorit</Judul>
        {!siap ? (
          <Kerangka tinggi={60} />
        ) : favorit.length ? (
          <View role="list" style={{ gap: 8 }}>
            {favorit.map((id) => {
              const l = layananById[id];
              if (!l) return null;
              return (
                <View key={id} role="listitem" style={st.fav}>
                  <View style={{ flex: 1 }}>
                    <T style={F.b}>{l.nama}</T>
                    <T kecil lembut>
                      {durasi(l.menit)} · {rupiah(l.harga)}
                    </T>
                  </View>
                  <Pressable role="button" aria-label={`Hapus ${l.nama} dari favorit`} onPress={() => alihFavorit(id)} style={({ pressed }) => [st.hapus, pressed && { backgroundColor: W.marunMuda }]}>
                    <Ikon nama="hati" ukuran={20} warna={W.marun} isi />
                  </Pressable>
                  {l.kat !== 'tambahan' ? <Tombol kecil label="Pesan" aksesLabel={`Pesan ${l.nama}`} href={{ pathname: '/booking/kapster', params: { layanan: id } }} /> : null}
                </View>
              );
            })}
          </View>
        ) : (
          <T lembut>Ketuk ikon hati di halaman Layanan untuk menyimpan favorit.</T>
        )}
        {siap && sering.length ? (
          <T kecil lembut>
            Paling sering kamu pesan: {sering.map((s) => `${layananById[s.id].nama} (${s.jumlah}×)`).join(', ')}.
          </T>
        ) : null}
      </View>

      <Kartu style={{ gap: 4 }}>
        <Judul level={2}>Pengingat bawaan</Judul>
        <T kecil lembut>Dipakai untuk booking baru. Tiap karcis tetap bisa diatur sendiri.</T>
        <View style={{ marginTop: 6 }}>
          {PENGINGAT.map((p, i) => (
            <View key={p.id}>
              {i ? <Garis /> : null}
              <Saklar label={p.label} nilai={siap && profil.pengingat.includes(p.id)} ubah={(v) => aturPengingatBawaan(p.id, v)} />
            </View>
          ))}
        </View>
      </Kartu>

      <View style={st.tautanGrup} role="list">
        {[
          { href: '/notifikasi', ikon: 'lonceng', label: 'Notifikasi' },
          { href: '/kapster', ikon: 'gunting', label: 'Kapster & penata rambut' },
          { href: '/outlet', ikon: 'toko', label: 'Info outlet, jam buka & peta' },
        ].map((t, i) => (
          <View key={t.href} role="listitem">
            {i ? <Garis style={{ marginLeft: 52 }} /> : null}
            <Taut href={t.href} gaya={({ pressed }) => [st.tautan, pressed && { backgroundColor: W.kertasTua }]}>
                <View style={st.tautanIkon}>
                  <Ikon nama={t.ikon} ukuran={20} warna={W.hijau} />
                </View>
                <T style={[F.sb, { flex: 1 }]}>{t.label}</T>
                <Ikon nama="kanan" ukuran={20} warna={W.tintaLembut} />
              </Taut>
          </View>
        ))}
      </View>

      <Kartu style={{ gap: 10, backgroundColor: W.mint, borderColor: W.mintTua }}>
        <Judul level={2} nativeID="tentang">
          Tentang aplikasi demo ini
        </Judul>
        <T kecil>
          Kursi Putar adalah usaha rekaan. Nama kapster, alamat, harga, dan slot terisi dibuat untuk contoh. Tidak ada server: booking, riwayat, dan notifikasi disimpan di perangkat ini. Pengingat berupa simulasi notifikasi di dalam aplikasi.
        </T>
        <T kecil>Dibuat oleh PintuWeb dengan React Native + Expo, jadi satu kode yang sama bisa dirilis ke Android, iOS, dan web.</T>
        <Tombol varian="hijau" label="Pesan aplikasi seperti ini" ikonKanan="keluar" href={SITUS.kontak} aksesLabel="Pesan aplikasi seperti ini di PintuWeb (membuka situs PintuWeb)" />
        <Tombol varian="lembut" ikon="ulang" label="Atur ulang data demo" onPress={konfirmasiUlang} />
      </Kartu>
    </Layar>
  );
}

const st = StyleSheet.create({
  identitas: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  monogram: { width: 56, height: 56, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: W.marun },
  monogramHuruf: { ...F.display, fontSize: 28, lineHeight: 34, color: W.krem, textShadowColor: 'rgba(0,0,0,0.35)', textShadowRadius: 6 },
  nama: { ...F.display, fontSize: 24, lineHeight: 30, color: W.tinta },
  input: { ...F.sb, fontSize: 16, minHeight: 46, borderRadius: 12, borderWidth: 1.5, borderColor: W.hijau, paddingHorizontal: 12, color: W.tinta, backgroundColor: W.putih },
  fav: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: R.sedang, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  hapus: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tautanGrup: { backgroundColor: W.putih, borderRadius: R.besar, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  tautan: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 56 },
  tautanIkon: { width: 28, alignItems: 'center' },
});
