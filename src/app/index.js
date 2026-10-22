import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { W, F, R, angkaTabel } from '../lib/tema';
import { useToko, capTerkumpul } from '../lib/store';
import { KAPSTER, OUTLET, layananById, CAP_PENUH, kapsterUntuk } from '../lib/data';
import { sapaan, hitungMundur, sebutanHari, hariKe, jamDari, jam, HARI_PENDEK, hariPekan, durasi, tanggal, rupiah } from '../lib/waktu';
import { slotTerdekat, jadwalKapster } from '../lib/slot';
import { statusOutlet } from '../lib/status';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Label, Tombol, TombolIkon, Kerangka, Kartu, Taut } from '../components/ui';
import { Karcis, Avatar } from '../components/booking';
import Pola from '../components/Pola';
import Ikon from '../components/Ikon';
import Gambar from '../components/Gambar';

export function generateMetadata() {
  return meta('/');
}

export default function Beranda() {
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const nama = useToko((s) => s.profil.nama);
  const bookings = useToko((s) => s.bookings);
  const favorit = useToko((s) => s.favorit);
  const notif = useToko((s) => s.notif);
  const hadiahDipakai = useToko((s) => s.hadiahDipakai);
  const belum = notif.filter((n) => !n.dibaca).length;

  const berikut = useMemo(
    () => bookings.filter((b) => b.status === 'aktif').sort((a, b) => a.mulai - b.mulai)[0],
    [bookings],
  );
  const cap = capTerkumpul({ bookings, hadiahDipakai });
  const layananCepat = layananById[favorit[0]] || layananById['pangkas-reguler'];
  const terdekat = useMemo(() => {
    if (!siap) return [];
    return slotTerdekat({
      durasi: layananCepat.menit,
      kapsterIds: kapsterUntuk(layananCepat.id).map((k) => k.id),
      bookings,
      sekarang,
      jumlah: 4,
      jarak: 45,
    });
    // sekarang berubah tiap 15 dtk; cukup hitung ulang per menit
  }, [siap, layananCepat, bookings, Math.floor(sekarang / 60000)]);
  const hIni = hariKe(sekarang);
  const stt = siap ? statusOutlet(sekarang) : null;

  return (
    <Layar
      besar
      tab
      judul="Kursi Putar"
      sub={`${OUTLET.jenis} · Blitar`}
      kanan={
        <TombolIkon
          ikon="lonceng"
          label={siap && belum ? `Notifikasi, ${belum} belum dibaca` : 'Notifikasi'}
          href="/notifikasi"
          badge={siap && belum ? String(belum) : null}
        />
      }
    >
      <View style={st.sapa}>
        <T style={[F.sb, { fontSize: 17, lineHeight: 24 }]}>{siap ? `${sapaan(sekarang)}, ${nama}.` : 'Selamat datang.'}</T>
        <T lembut>Pilih kapster, lihat jam yang masih kosong, datang tanpa antre.</T>
      </View>

      {/* Jadwal berikutnya */}
      <View style={{ gap: 8 }}>
        <View style={st.kepalaBagian}>
          <Judul level={2}>Jadwal berikutnya</Judul>
          {siap && berikut ? <T kecil style={[F.b, { color: W.hijau }]}>{hitungMundur(berikut.mulai, sekarang)}</T> : null}
        </View>
        {!siap ? (
          <Kerangka tinggi={241} />
        ) : berikut ? (
          <Taut href={{ pathname: '/karcis', params: { kode: berikut.kode } }} gaya={({ pressed }) => pressed && { opacity: 0.85 }}>
              <Karcis b={berikut} />
            </Taut>
        ) : (
          <Kartu style={[st.kosong, { paddingTop: 30 }]}>
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 14 }}>
                <Pola jenis="tegel" varian="mint" ukuran={24} />
              </View>
            <T style={F.b}>Belum ada jadwal.</T>
            <T kecil lembut>Pilih layanan dan jam yang cocok; karcisnya langsung muncul di sini.</T>
            <Tombol label="Cari jam kosong" href="/booking" ikonKanan="kanan" style={{ alignSelf: 'flex-start', marginTop: 6 }} />
          </Kartu>
        )}
      </View>

      {/* Bento: status outlet + kartu cap */}
      <View style={st.duo}>
        <Taut href="/outlet" gaya={({ pressed }) => [st.ubin, st.ubinMint, pressed && { opacity: 0.85 }]}>
            <View style={st.ubinPita}>
              <Pola jenis="tegel" varian="mint" ukuran={30} />
            </View>
            <Label>Outlet sekarang</Label>
            {stt ? (
              <>
                <Text style={[st.ubinBesar, { color: stt.kode === 'buka' ? W.hijau : W.marun }]}>{stt.judul}</Text>
                <T kecil style={F.sb}>{stt.ket}</T>
              </>
            ) : (
              <>
                <Text style={st.ubinBesar}>Jam buka</Text>
                <T kecil style={F.sb}>Lihat jadwal outlet</T>
              </>
            )}
          </Taut>
        <Taut href="/profil" gaya={({ pressed }) => [st.ubin, st.ubinKrem, pressed && { opacity: 0.85 }]}>
            <Label warna={W.marun}>Kartu cap</Label>
            <Text style={[st.ubinBesar, angkaTabel]}>
              {siap ? Math.min(cap, CAP_PENUH) : '–'}
              <Text style={st.ubinPer}>/{CAP_PENUH}</Text>
            </Text>
            <View style={st.titikCap} aria-hidden>
              {Array.from({ length: CAP_PENUH }).map((_, i) => (
                <View key={i} style={[st.titik, siap && i < cap && st.titikIsi]} />
              ))}
            </View>
          </Taut>
      </View>

      {/* Jam kosong terdekat */}
      <Kartu style={{ gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Judul level={2}>Jam kosong terdekat</Judul>
          <T kecil lembut>
            {layananCepat.nama} · {durasi(layananCepat.menit)} · kapster mana saja
          </T>
        </View>
        <View style={st.cepat} role="list">
          {!siap
            ? [0, 1, 2, 3].map((i) => <Kerangka key={i} tinggi={62} style={st.cepatItem} />)
            : terdekat.map((s) => {
                const kap = s.kapster[0];
                const sb = sebutanHari(s.h, hIni) || HARI_PENDEK[hariPekan(s.h)];
                return (
                  <View key={s.mulai} role="listitem" style={st.cepatItem}>
                    <Taut
                      href={{ pathname: '/booking/konfirmasi', params: { layanan: layananCepat.id, kapster: kap, mulai: String(s.mulai), otomatis: '1' } }}
                      gaya={({ pressed }) => [st.cepatTombol, pressed && { backgroundColor: W.mint }]}
                    >
                      <T kecil style={[F.b, { color: W.hijau }]}>{sb}</T>
                      <Text style={[st.cepatJam, angkaTabel]}>{jam(s.menit)}</Text>
                    </Taut>
                  </View>
                );
              })}
          {siap && !terdekat.length ? <T lembut>Sepekan ke depan sudah penuh. Coba layanan lain.</T> : null}
        </View>
        <Tombol
          varian="garis"
          kecil
          label="Lihat semua jam"
          ikonKanan="kanan"
          href={{ pathname: '/booking/kapster', params: { layanan: layananCepat.id } }}
          style={{ alignSelf: 'flex-start' }}
        />
      </Kartu>

      {/* Kapster bertugas */}
      <View style={{ gap: 10 }}>
        <View style={st.kepalaBagian}>
          <Judul level={2}>{siap ? 'Bertugas hari ini' : 'Kapster & penata'}</Judul>
          <Link href="/kapster" style={st.tautan}>
            Semua
          </Link>
        </View>
        <View style={st.kapsterBaris} role="list">
          {KAPSTER.map((k) => {
            const j = siap ? jadwalKapster(k, hIni) : true;
            return (
              <View key={k.id} role="listitem" style={{ flex: 1 }}>
                <Taut href={`/kapster/${k.id}`}
                    gaya={({ pressed }) => [st.kapster, pressed && { opacity: 0.8 }]}
                  >
                    <View style={!j && { opacity: 0.45 }}>
                      <Avatar id={k.id} ukuran={58} cincin />
                    </View>
                    <T kecil style={F.b} numberOfLines={1}>
                      {k.nama.replace('Pak ', '')}
                    </T>
                    <T kecil lembut style={{ fontSize: 12 }} numberOfLines={1}>
                      {siap ? (j ? `s.d. ${jam(j.tutup)}` : 'Libur') : k.peran.split(' ')[0]}
                    </T>
                  </Taut>
              </View>
            );
          })}
        </View>
      </View>

      {/* Outlet */}
      <Taut href="/outlet" aria-label="Info outlet: alamat, jam buka, dan peta" gaya={({ pressed }) => [st.outlet, pressed && { opacity: 0.9 }]}>
          <Gambar nama="outlet.webp" lebar="100%" tinggi={168} alt="Dua kursi pangkas kulit di depan cermin, lantai tegel kotak-kotak" />
          <View style={st.outletTeks}>
            <View style={{ flex: 1, gap: 2 }}>
              <T style={F.b}>{OUTLET.alamat}</T>
              <T kecil lembut>{OUTLET.patokan}</T>
            </View>
            <Ikon nama="kanan" warna={W.marun} />
          </View>
        </Taut>

      {/* Favorit */}
      {siap && favorit.length ? (
        <View style={{ gap: 10 }}>
          <Judul level={2}>Layanan favoritmu</Judul>
          <View style={st.favorit}>
            {favorit.map((id) => {
              const l = layananById[id];
              if (!l) return null;
              return (
                <Taut key={id} href={{ pathname: '/booking/kapster', params: { layanan: id } }} gaya={({ pressed }) => [st.favItem, pressed && { backgroundColor: W.kertasTua }]}>
                    <Ikon nama="hati" ukuran={18} warna={W.marun} isi />
                    <T kecil style={F.b}>{l.nama}</T>
                    <T kecil lembut>{rupiah(l.harga)}</T>
                  </Taut>
              );
            })}
          </View>
        </View>
      ) : null}
    </Layar>
  );
}

const st = StyleSheet.create({
  sapa: { gap: 2, marginTop: -2 },
  kepalaBagian: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  kosong: { gap: 4, overflow: 'hidden' },
  duo: { flexDirection: 'row', gap: 12 },
  ubin: { flex: 1, borderRadius: R.besar, padding: 14, paddingTop: 30, gap: 2, overflow: 'hidden', borderWidth: 1, minHeight: 132 },
  ubinMint: { backgroundColor: W.mint, borderColor: W.mintTua },
  ubinKrem: { backgroundColor: W.kuninganMuda, borderColor: '#E3CC9C', paddingTop: 14 },
  ubinPita: { position: 'absolute', left: 0, right: 0, top: 0, height: 16 },
  ubinBesar: { ...F.display, fontSize: 30, lineHeight: 36, color: W.tinta, marginTop: 4 },
  ubinPer: { ...F.display, fontSize: 18, color: W.tintaLembut },
  titikCap: { flexDirection: 'row', gap: 5, marginTop: 8 },
  titik: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: W.marun },
  titikIsi: { backgroundColor: W.marun },
  cepat: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cepatItem: { width: '48%', flexGrow: 1 },
  cepatTombol: { minHeight: 62, borderRadius: 14, borderWidth: 1.5, borderColor: W.hijau, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'center' },
  cepatJam: { ...F.display, fontSize: 22, lineHeight: 28, color: W.tinta },
  tautan: { ...F.b, fontSize: 14, lineHeight: 20, color: W.marun, textDecorationLine: 'underline', paddingVertical: 4 },
  kapsterBaris: { flexDirection: 'row', gap: 4 },
  kapster: { alignItems: 'center', gap: 4, paddingVertical: 4, borderRadius: 14 },
  outlet: { borderRadius: R.besar, overflow: 'hidden', backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  outletTeks: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  favorit: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  favItem: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 12, borderRadius: 999, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
});
