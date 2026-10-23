import { View, Text, StyleSheet, Linking } from 'react-native';
import { W, F, R, angkaTabel } from '../lib/tema';
import { OUTLET, JAM_BUKA } from '../lib/data';
import { HARI, jam, hariKe, hariPekan } from '../lib/waktu';
import { useToko } from '../lib/store';
import { statusOutlet } from '../lib/status';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Tombol, Kartu, Lencana } from '../components/ui';
import Gambar from '../components/Gambar';
import Ikon from '../components/Ikon';
import Pola from '../components/Pola';

export function generateMetadata() {
  return meta('/outlet');
}

const URUT = [1, 2, 3, 4, 5, 6, 0];
const PESAN_WA = 'Halo Kursi Putar, saya mau tanya soal jadwal pangkas.';

export default function Outlet() {
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const stt = siap ? statusOutlet(sekarang) : null;
  const hp = siap ? hariPekan(hariKe(sekarang)) : -1;

  return (
    <Layar kembali judul="Info outlet" sub={`${OUTLET.nama} · ${OUTLET.jenis}`}>
      <View style={st.foto}>
        <Gambar nama="outlet.webp" lebar="100%" tinggi={190} alt="Dua kursi pangkas kulit di depan cermin, lantai kotak-kotak" prioritas />
        {stt ? (
          <View style={[st.status, { backgroundColor: stt.kode === 'buka' ? W.hijau : W.marun }]}>
            <Text style={st.statusTeks}>
              {stt.judul} · {stt.ket}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: 4 }}>
        <Judul level={2}>{OUTLET.alamat}</Judul>
        <T lembut>{OUTLET.patokan}. Alamat rekaan untuk demo.</T>
      </View>

      <View style={{ gap: 8 }}>
        <Judul level={2}>Jam buka</Judul>
        <View style={st.tabel} role="table" aria-label="Jam buka outlet">
          <View role="row" style={[st.baris, st.barisKepala]}>
            <T role="columnheader" kecil style={[F.b, { flex: 1.1 }]}>
              Hari
            </T>
            <T role="columnheader" kecil style={[F.b, { flex: 1 }]}>
              Buka
            </T>
            <T role="columnheader" kecil style={[F.b, { flex: 1, textAlign: 'right' }]}>
              Istirahat
            </T>
          </View>
          {URUT.map((d) => {
            const o = JAM_BUKA[d];
            const ini = d === hp;
            return (
              <View key={d} role="row" style={[st.baris, st.barisGaris, ini && st.barisIni]}>
                <T role="cell" style={[{ flex: 1.1 }, ini && F.b]}>
                  {HARI[d]}
                  {ini ? ' · hari ini' : ''}
                </T>
                <T role="cell" style={[{ flex: 1 }, angkaTabel, !o && { color: W.marun }, F.sb]}>{o ? `${jam(o.buka)}–${jam(o.tutup)}` : 'Tutup'}</T>
                <T role="cell" kecil lembut style={[{ flex: 1, textAlign: 'right' }, angkaTabel]}>
                  {o ? `${jam(o.istirahat[0])}–${jam(o.istirahat[1])}` : '–'}
                </T>
              </View>
            );
          })}
        </View>
        <T kecil lembut>Jumat buka setelah salat Jumat dan istirahat sebentar saat magrib. Semua jam dalam WIB.</T>
      </View>

      <View style={st.peta}>
        <Gambar nama="peta.webp" lebar="100%" tinggi={220} alt="Peta ilustrasi: Kursi Putar di Jl. Tegel Kuno, seberang taman kota, dekat perempatan dan toko bangunan" />
        <View style={st.petaLabel}>
          <Ikon nama="pin" ukuran={18} warna={W.marun} />
          <T kecil style={F.b}>Peta ilustrasi, bukan peta sungguhan</T>
        </View>
      </View>

      <Kartu style={st.kontak}>
        <View style={st.pita}>
          <Pola jenis="belang" varian="pangkas" lebarBelang={5} />
        </View>
        <Judul level={2}>Tanya dulu?</Judul>
        <T kecil>Pesan WhatsApp terisi otomatis. Karena ini demo, nomor tujuan tidak dicantumkan; kamu bisa memilih kontak sendiri.</T>
        <Tombol
          varian="hijau"
          ikon="obrolan"
          label="Chat lewat WhatsApp"
          aksesLabel="Chat lewat WhatsApp (membuka WhatsApp)"
          onPress={() => Linking.openURL(`https://wa.me/?text=${encodeURIComponent(PESAN_WA)}`)}
        />
      </Kartu>

      <View style={{ gap: 8 }}>
        <Judul level={2}>Fasilitas</Judul>
        <View style={st.fasilitas}>
          {OUTLET.fasilitas.map((f) => (
            <View key={f.judul} style={st.fasItem}>
              <View style={st.fasIkon}>
                <Ikon nama={f.ikon} ukuran={20} warna={W.hijau} />
              </View>
              <T style={F.b}>{f.judul}</T>
              <T kecil lembut>
                {f.isi}
              </T>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Judul level={2}>Aturan kecil</Judul>
        {OUTLET.aturan.map((a, i) => (
          <View key={a} style={st.aturan}>
            <Lencana>{String(i + 1)}</Lencana>
            <T style={{ flex: 1 }}>{a}</T>
          </View>
        ))}
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  foto: { borderRadius: R.besar, overflow: 'hidden', backgroundColor: W.marunTua },
  status: { position: 'absolute', left: 12, bottom: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  statusTeks: { ...F.b, fontSize: 13, lineHeight: 18, color: W.krem },
  peta: { borderRadius: R.besar, overflow: 'hidden', borderWidth: 1, borderColor: W.garis, backgroundColor: W.putih },
  petaLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  tabel: { backgroundColor: W.putih, borderRadius: R.besar, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' },
  baris: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, minHeight: 44, gap: 6 },
  barisKepala: { backgroundColor: W.kertasTua },
  barisGaris: { borderTopWidth: 1, borderTopColor: W.garis },
  barisIni: { backgroundColor: W.mint },
  kontak: { gap: 8, overflow: 'hidden', paddingTop: 30 },
  pita: { position: 'absolute', left: 0, right: 0, top: 0, height: 12 },
  fasilitas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fasItem: { width: '47%', flexGrow: 1, gap: 4, padding: 14, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  fasIkon: { width: 36, height: 36, borderRadius: 12, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  aturan: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
