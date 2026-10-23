import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { W, F, R, angkaTabel } from '../lib/tema';
import { useToko, capTerkumpul, aturPengingat, tutupPanduan } from '../lib/store';
import { KAPSTER, OUTLET, layananById, CAP_PENUH, kapsterUntuk, ANTRE_DETIK_PER_ORANG } from '../lib/data';
import { sapaan, hitungMundur, sebutanHari, hariKe, jamDari, jam, HARI_PENDEK, HARI, hariPekan, durasi, tanggal, rupiah, pada } from '../lib/waktu';
import { slotTerdekat, jadwalKapster, kondisiAntre } from '../lib/slot';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Label, Tombol, TombolIkon, Kerangka, Kartu, Taut, Saklar } from '../components/ui';
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
  const antre = useToko((s) => s.antre);
  const panduanTutup = useToko((s) => s.panduanTutup);
  const belum = notif.filter((n) => !n.dibaca).length;
  const menit = Math.floor(sekarang / 60000);

  const berikut = useMemo(() => bookings.filter((b) => b.status === 'aktif').sort((a, b) => a.mulai - b.mulai)[0], [bookings]);
  const cap = capTerkumpul({ bookings, hadiahDipakai });
  const layananCepat = layananById[favorit[0]] || layananById['pangkas-reguler'];
  const terdekat = useMemo(() => {
    if (!siap) return [];
    return slotTerdekat({ durasi: layananCepat.menit, kapsterIds: kapsterUntuk(layananCepat.id).map((k) => k.id), bookings, sekarang, jumlah: 4, jarak: 45 });
  }, [siap, layananCepat, bookings, menit]);
  const ka = useMemo(() => (siap ? kondisiAntre(sekarang, bookings) : null), [siap, bookings, Math.floor(menit / 1)]);
  const hIni = hariKe(sekarang);

  return (
    <Layar
      besar
      tab
      judul="Kursi Putar"
      sub={`${OUTLET.jenis} · Blitar`}
      kanan={<TombolIkon ikon="lonceng" label={siap && belum ? `Notifikasi, ${belum} belum dibaca` : 'Notifikasi'} href="/notifikasi" badge={siap && belum ? String(belum) : null} />}
    >
      <View style={st.sapa}>
        <T style={[F.sb, { fontSize: 17, lineHeight: 24 }]}>{siap ? `${sapaan(sekarang)}, ${nama}.` : 'Selamat datang.'}</T>
        <T lembut>Booking jam kosong atau ambil nomor antre, lalu bayar di kasir.</T>
      </View>

      {/* Jadwal berikutnya: karcis ringkas + pengingat langsung di kartu */}
      <View style={{ gap: 8 }}>
        <Judul level={2}>Jadwal berikutnya</Judul>
        {!siap ? (
          <Kerangka tinggi={262} />
        ) : berikut ? (
          <View style={st.jadwal}>
            <Taut href={{ pathname: '/karcis', params: { kode: berikut.kode } }} gaya={({ pressed }) => pressed && { opacity: 0.85 }}>
              <Karcis b={berikut} ringkas />
            </Taut>
            <View style={st.jadwalBawah}>
              <T kecil style={[F.b, { color: W.hijau, flex: 1 }]}>
                {hitungMundur(berikut.mulai, sekarang)[0].toUpperCase() + hitungMundur(berikut.mulai, sekarang).slice(1)} · datang 10 menit lebih awal
              </T>
              <Link href={{ pathname: '/karcis', params: { kode: berikut.kode } }} style={st.tautan}>
                Lihat karcis
              </Link>
            </View>
            <Saklar label="Ingatkan 2 jam sebelumnya" nilai={berikut.pengingat.includes('2h')} ubah={(v) => aturPengingat(berikut.kode, '2h', v)} />
          </View>
        ) : (
          <Kartu style={st.kosong}>
            <Gambar nama="kursi-kosong.webp" lebar={96} tinggi={96} />
            <View style={{ flex: 1, gap: 4 }}>
              <T style={F.b}>Kursimu belum dipesan.</T>
              <T kecil lembut>Pilih layanan dan jam kosong; karcisnya langsung muncul di sini.</T>
              <Tombol kecil label="Cari jam kosong" href="/booking" ikonKanan="kanan" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            </View>
          </Kartu>
        )}
      </View>

      {/* Bento: antre datang langsung + kartu cap */}
      <View style={st.duo}>
        <UbinAntre ka={ka} antre={antre} sekarang={sekarang} hIni={hIni} />
        <Taut href="/profil" gaya={({ pressed }) => [st.ubin, st.ubinKrem, pressed && { opacity: 0.85 }]}>
          <Label warna={W.marunTua}>Kartu cap</Label>
          <Text style={[st.ubinBesar, angkaTabel]}>
            {siap ? Math.min(cap, CAP_PENUH) : '–'}
            <Text style={st.ubinPer}>/{CAP_PENUH}</Text>
          </Text>
          <View style={st.titikCap} aria-hidden>
            {Array.from({ length: CAP_PENUH }).map((_, i) => (
              <View key={i} style={[st.titik, siap && i < cap && st.titikIsi]} />
            ))}
          </View>
          <Text style={st.aksiUbin}>{siap && cap >= CAP_PENUH ? 'Pakai potongan' : 'Lihat kartu'}</Text>
        </Taut>
      </View>

      {/* Dirender juga di HTML statis (bawaan belum ditutup) supaya tidak menggeser isi saat muncul. */}
      {!panduanTutup ? (
        <View style={st.panduan}>
          <View style={st.panduanPita}>
            <Pola jenis="belang" varian="pangkas" lebarBelang={5} />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Judul level={2} style={{ flex: 1, fontSize: 18, lineHeight: 24 }}>
                Baru di demo ini?
              </Judul>
              <TombolIkon ikon="silang" label="Tutup panduan" onPress={() => tutupPanduan(true)} ukuran={44} />
            </View>
            <T kecil>Tiga hal yang bisa langsung dicoba. Semua data rekaan dan mengikuti jam WIB.</T>
            <View role="list" style={{ gap: 6 }}>
              {[
                { no: 1, teks: 'Booking jam kosong sampai karcis terbit', href: '/booking' },
                { no: 2, teks: `Ambil nomor antre (maju tiap ${ANTRE_DETIK_PER_ORANG} detik)`, href: '/antre' },
                { no: 3, teks: 'Buka karcis, coba “Coba pengingat sekarang”', href: berikut ? { pathname: '/karcis', params: { kode: berikut.kode } } : '/jadwal' },
              ].map((x) => (
                <View key={x.no} role="listitem">
                  <Taut href={x.href} gaya={({ pressed }) => [st.panduanItem, pressed && { backgroundColor: W.mint }]}>
                    <View style={st.panduanNo}>
                      <Text style={st.panduanNoTeks}>{x.no}</Text>
                    </View>
                    <T kecil style={[F.sb, { flex: 1 }]}>
                      {x.teks}
                    </T>
                    <Ikon nama="kanan" ukuran={18} warna={W.hijau} />
                  </Taut>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}

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
        <Tombol varian="garis" kecil label="Lihat semua jam" ikonKanan="kanan" href={{ pathname: '/booking/kapster', params: { layanan: layananCepat.id } }} style={{ alignSelf: 'flex-start' }} />
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
                <Taut href={`/kapster/${k.id}`} gaya={({ pressed }) => [st.kapster, pressed && { opacity: 0.8 }]}>
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
      <Taut href="/outlet" gaya={({ pressed }) => [st.outlet, pressed && { opacity: 0.9 }]}>
        <Gambar nama="outlet.webp" lebar="100%" tinggi={168} alt="Dua kursi pangkas kulit di depan cermin, lantai kotak-kotak" />
        <View style={st.outletTeks}>
          <View style={{ flex: 1, gap: 2 }}>
            <T style={F.b}>{OUTLET.alamat}</T>
            <T kecil lembut>{OUTLET.patokan}</T>
          </View>
          <Ikon nama="kanan" warna={W.marun} />
        </View>
      </Taut>

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

/** Ubin antre: nomor milikmu, ajakan ambil nomor saat buka, atau hitung mundur buka saat tutup. */
function UbinAntre({ ka, antre, sekarang, hIni }) {
  let label = 'Datang langsung';
  let besar = 'Antre';
  let ket = 'Lihat keadaan kursi';
  let aksi = 'Buka antre';
  let href = '/antre';
  let warna = W.tinta;
  if (antre) {
    label = 'Antre kamu';
    besar = antre.nomor;
    warna = W.marun;
    ket = antre.status === 'dipanggil' ? 'Giliranmu sekarang' : 'Pantau giliranmu';
    aksi = 'Lihat nomor';
  } else if (ka && ka.terima) {
    besar = ka.buka ? 'Buka' : 'Segera';
    warna = W.hijau;
    ket = ka.menunggu ? `${ka.menunggu} antre · ±${ka.perkiraan} mnt` : ka.perkiraan ? `Antre dibuka · ±${ka.perkiraan} mnt` : 'Ada kursi kosong sekarang';
    aksi = 'Ambil nomor';
  } else if (ka) {
    besar = 'Tutup';
    warna = W.marun;
    const b = ka.berikut;
    ket = b ? `Buka ${b.h === hIni ? '' : b.h === hIni + 1 ? 'besok ' : HARI[hariPekan(b.h)] + ' '}${jam(b.menit)} · ${hitungMundur(pada(b.h, b.menit), sekarang)}` : 'Lihat jam buka';
    aksi = 'Jam buka';
    href = '/outlet';
  }
  return (
    <Taut href={href} gaya={({ pressed }) => [st.ubin, st.ubinMint, pressed && { opacity: 0.85 }]}>
      <View style={st.ubinPita}>
        <Pola jenis="belang" varian="pangkas" lebarBelang={5} />
      </View>
      <Label>{label}</Label>
      <Text style={[st.ubinBesar, { color: warna }]} numberOfLines={1}>
        {ka || antre ? besar : 'Antre'}
      </Text>
      <T kecil style={F.sb} numberOfLines={2}>
        {ka || antre ? ket : 'Lihat keadaan kursi'}
      </T>
      <Text style={st.aksiUbin}>{ka || antre ? aksi : 'Buka antre'}</Text>
    </Taut>
  );
}

const st = StyleSheet.create({
  sapa: { gap: 2, marginTop: -2 },
  kepalaBagian: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  jadwal: { gap: 4 },
  jadwalBawah: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6, paddingHorizontal: 4 },
  kosong: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  duo: { flexDirection: 'row', gap: 12 },
  ubin: { flex: 1, borderRadius: R.besar, padding: 14, paddingTop: 26, gap: 2, overflow: 'hidden', borderWidth: 1, minHeight: 150 },
  ubinMint: { backgroundColor: W.putih, borderColor: W.garis },
  ubinKrem: { backgroundColor: W.kuninganMuda, borderColor: '#E3CC9C', paddingTop: 14 },
  ubinPita: { position: 'absolute', left: 0, right: 0, top: 0, height: 12 },
  ubinBesar: { ...F.display, fontSize: 30, lineHeight: 36, color: W.tinta, marginTop: 4 },
  ubinPer: { ...F.display, fontSize: 18, color: W.tintaLembut },
  aksiUbin: { ...F.b, fontSize: 13, lineHeight: 18, color: W.marun, textDecorationLine: 'underline', marginTop: 'auto', paddingTop: 6 },
  titikCap: { flexDirection: 'row', gap: 5, marginTop: 8 },
  titik: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: W.marun },
  titikIsi: { backgroundColor: W.marun },
  panduan: { flexDirection: 'row', gap: 12, padding: 14, paddingLeft: 0, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  panduanPita: { width: 10, alignSelf: 'stretch', overflow: 'hidden', borderTopLeftRadius: R.besar, borderBottomLeftRadius: R.besar },
  panduanItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, paddingHorizontal: 10, borderRadius: 12, backgroundColor: W.kertas },
  panduanNo: { width: 28, height: 28, borderRadius: 14, backgroundColor: W.marun, alignItems: 'center', justifyContent: 'center' },
  panduanNoTeks: { ...F.display, fontSize: 15, lineHeight: 18, color: W.krem },
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
