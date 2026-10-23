import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { W, F, R } from '../lib/tema';
import { LAYANAN, KATEGORI, kapsterUntuk, GAYA, layananById } from '../lib/data';
import { durasi, rupiah } from '../lib/waktu';
import { useToko, alihFavorit } from '../lib/store';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Segmen, Taut } from '../components/ui';
import Ikon from '../components/Ikon';
import Gambar from '../components/Gambar';

export function generateMetadata() {
  return meta('/layanan');
}

const FOTO = {
  pangkas: { nama: 'alat.webp', alt: 'Gunting, sisir, dan sikat pangkas tertata di meja kayu' },
  salon: { nama: 'salon.webp', alt: 'Ruang salon dengan kursi kulit cokelat dan cermin' },
  tambahan: { nama: 'alat.webp', alt: 'Perlengkapan pangkas di meja kayu' },
};

export default function Layanan() {
  const [kat, setKat] = useState('pangkas');
  const favorit = useToko((s) => s.favorit);
  const siap = useToko((s) => s.siap);
  const daftar = LAYANAN.filter((l) => l.kat === kat);
  const info = KATEGORI.find((k) => k.id === kat);

  return (
    <Layar besar tab judul="Layanan & harga" sub="Harga sudah termasuk keramas & penataan">
      <Segmen label="Kategori layanan" pilihan={KATEGORI.map((k) => ({ id: k.id, label: k.nama }))} nilai={kat} ubah={setKat} />
      <View style={st.sampul} role="tabpanel">
        <Gambar nama={FOTO[kat].nama} lebar="100%" tinggi={132} alt={FOTO[kat].alt} prioritas={kat === 'pangkas'} />
        <View style={st.sampulTeks}>
          <T style={[F.b, { color: W.krem }]}>{info.ket}</T>
        </View>
      </View>
      <View role="list" style={{ gap: 10 }}>
        {daftar.map((l) => {
          const fav = favorit.includes(l.id);
          const kap = kapsterUntuk(l.id);
          return (
            <View key={l.id} role="listitem" style={st.baris}>
              <View style={{ flex: 1, gap: 4 }}>
                <Judul level={2} style={st.nama}>
                  {l.nama}
                </Judul>
                <T kecil lembut>
                  {l.ket}
                </T>
                <View style={st.meta}>
                  <View style={st.metaItem}>
                    <Ikon nama="jam" ukuran={16} warna={W.hijau} />
                    <T kecil style={[F.sb, { color: W.hijau }]}>{l.kat === 'tambahan' ? `+${durasi(l.menit)}` : durasi(l.menit)}</T>
                  </View>
                  {l.kat !== 'tambahan' ? (
                    <View style={st.metaItem}>
                      <Ikon nama="orang" ukuran={16} warna={W.hijau} />
                      <T kecil style={[F.sb, { color: W.hijau }]}>{`${kap.length} ${l.kat === 'salon' ? 'penata' : 'kapster'}`}</T>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={st.kanan}>
                <Text style={st.harga}>
                  {l.mulai ? <Text style={st.mulai}>mulai{'\n'}</Text> : null}
                  {l.kat === 'tambahan' ? <Text style={[F.b, { fontSize: 15 }]}>+ </Text> : null}
                  {rupiah(l.harga)}
                </Text>
                <View style={st.aksi}>
                  <Pressable
                    role="button"
                    aria-pressed={siap ? fav : false}
                    aria-label={`Favoritkan ${l.nama}`}
                    onPress={() => alihFavorit(l.id)}
                    style={({ pressed }) => [st.hati, pressed && { backgroundColor: W.marunMuda }]}
                  >
                    <Ikon nama="hati" ukuran={20} warna={W.marun} isi={siap && fav} />
                  </Pressable>
                  {l.kat !== 'tambahan' ? (
                    <Taut href={{ pathname: '/booking/kapster', params: { layanan: l.id } }} aria-label={`Pesan ${l.nama}`} gaya={({ pressed }) => [st.pesan, pressed && { backgroundColor: W.marunTua }]}>
                        <Text style={st.pesanTeks}>Pesan</Text>
                      </Taut>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
      {kat === 'pangkas' ? (
        <View style={{ gap: 10 }}>
          <Judul level={2}>Belum tahu mau potong apa?</Judul>
          <T kecil lembut>Pilih gaya; layanan yang pas dan catatan untuk kapster langsung terisi. Ilustrasi buatan sendiri, bukan foto pelanggan.</T>
          <View role="list" style={st.gayaGrid}>
            {GAYA.map((g) => (
              <View key={g.id} role="listitem" style={st.gayaSel}>
                <Taut href={{ pathname: '/booking/kapster', params: { layanan: g.layanan, gaya: g.id, ...(g.layanan === 'pangkas-anak' ? { untuk: 'anak' } : {}) } }} gaya={({ pressed }) => [st.gaya, pressed && { backgroundColor: W.kertasTua }]}>
                  <Gambar nama={`gaya-${g.id}.webp`} lebar={76} tinggi={76} bulat={14} />
                  <T style={[F.b, { textAlign: 'center' }]} numberOfLines={1}>
                    {g.nama}
                  </T>
                  <T kecil lembut style={{ textAlign: 'center' }}>
                    {g.ket}
                  </T>
                  <T kecil style={[F.sb, { color: W.hijau, textAlign: 'center' }]} numberOfLines={1}>
                    {layananById[g.layanan].nama.split(' + ')[0]}
                  </T>
                </Taut>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {kat === 'tambahan' ? (
        <T kecil lembut>
          Tambahan dipilih di langkah pertama booking dan menambah durasi layananmu, jadi jam kosong yang tampil ikut menyesuaikan.
        </T>
      ) : null}
    </Layar>
  );
}

const st = StyleSheet.create({
  sampul: { borderRadius: R.besar, overflow: 'hidden', backgroundColor: W.marunTua },
  sampulTeks: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, paddingTop: 28, backgroundColor: 'rgba(58,14,21,0.72)' },
  baris: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  nama: { ...F.b, fontSize: 16, lineHeight: 22 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kanan: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  harga: { ...F.display, fontSize: 19, lineHeight: 24, color: W.tinta, textAlign: 'right' },
  mulai: { ...F.sb, fontSize: 12, lineHeight: 14, color: W.tintaLembut },
  aksi: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  hati: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: W.garis },
  pesan: { minHeight: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: W.marun, alignItems: 'center', justifyContent: 'center' },
  pesanTeks: { ...F.b, fontSize: 14, lineHeight: 18, color: W.krem },
  gayaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gayaSel: { width: '48%', flexGrow: 1 },
  gaya: { alignItems: 'center', gap: 4, padding: 12, borderRadius: 16, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis, minHeight: 190 },
});
