import { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { W, F, R, angkaTabel } from '../lib/tema';
import { useToko, kapsterLangganan, atasNama } from '../lib/store';
import { layananById, kapsterById, OUTLET } from '../lib/data';
import { bagian, BULAN, BULAN_PENDEK, jamDari, hitungMundur, rupiah, tanggal } from '../lib/waktu';
import { meta } from '../lib/seo';
import Layar from '../components/Layar';
import { T, Judul, Segmen, Kerangka, Kartu, Tombol, Taut } from '../components/ui';
import { Karcis, Avatar } from '../components/booking';
import Gambar from '../components/Gambar';
import Ikon from '../components/Ikon';

export function generateMetadata() {
  return meta('/jadwal');
}

export default function Jadwal() {
  const [tab, setTab] = useState('datang');
  const siap = useToko((s) => s.siap);
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const datang = useMemo(() => bookings.filter((b) => b.status === 'aktif').sort((a, b) => a.mulai - b.mulai), [bookings]);
  const selesai = useMemo(() => bookings.filter((b) => b.status === 'selesai').sort((a, b) => b.mulai - a.mulai), [bookings]);
  const batal = useMemo(() => bookings.filter((b) => b.status === 'batal').sort((a, b) => b.mulai - a.mulai), [bookings]);
  const langganan = kapsterLangganan(bookings);
  const terakhir = selesai[0];

  return (
    <Layar besar tab judul="Jadwalku" sub="Booking aktif & riwayat kunjungan">
      <Segmen
        label="Tampilan jadwal"
        pilihan={[
          { id: 'datang', label: siap ? `Mendatang (${datang.length})` : 'Mendatang' },
          { id: 'selesai', label: 'Selesai' },
          { id: 'batal', label: 'Dibatalkan' },
        ]}
        nilai={tab}
        ubah={setTab}
      />
      {!siap ? (
        <View style={{ gap: 12 }}>
          <Kerangka tinggi={176} />
          <Kerangka tinggi={120} />
        </View>
      ) : tab === 'datang' ? (
        <View role="tabpanel" style={{ gap: 14 }}>
          {datang.length ? (
            datang.map((b) => (
              <View key={b.kode} style={{ gap: 6 }}>
                <T kecil style={[F.b, { color: W.hijau }]}>{hitungMundur(b.mulai, sekarang)}</T>
                <Taut href={{ pathname: '/karcis', params: { kode: b.kode } }} gaya={({ pressed }) => pressed && { opacity: 0.85 }}>
                  <Karcis b={b} ringkas />
                </Taut>
              </View>
            ))
          ) : (
            <Kartu style={st.kosong}>
              <Gambar nama="kursi-kosong.webp" lebar={120} tinggi={120} />
              <T style={[F.b, { textAlign: 'center' }]}>Kursimu masih kosong.</T>
              <T kecil lembut style={{ textAlign: 'center' }}>
                Booking baru muncul di sini lengkap dengan kode karcis untuk kasir.
              </T>
              <Tombol label="Cari jam kosong" href="/booking" />
            </Kartu>
          )}
          {terakhir ? (
            <Kartu style={{ gap: 10 }}>
              <T kecil lembut style={F.sb}>
                Pesan lagi seperti terakhir
              </T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Avatar id={terakhir.kapster} ukuran={44} />
                <View style={{ flex: 1 }}>
                  <T style={F.b}>{layananById[terakhir.layanan].nama}</T>
                  <T kecil lembut>
                    {kapsterById[terakhir.kapster].nama} · {tanggal(terakhir.mulai, { pendek: true })}
                  </T>
                </View>
              </View>
              <Tombol
                kecil
                varian="garis"
                ikon="ulang"
                label="Pilih jam"
                aksesLabel={`Pesan lagi ${layananById[terakhir.layanan].nama} dengan ${kapsterById[terakhir.kapster].nama}`}
                href={{ pathname: '/booking/waktu', params: { layanan: terakhir.layanan, kapster: terakhir.kapster, ...(terakhir.tambahan.length ? { tambah: terakhir.tambahan.join(',') } : {}) } }}
                style={{ alignSelf: 'flex-start' }}
              />
            </Kartu>
          ) : null}
          <Kartu style={{ gap: 8, backgroundColor: W.mint, borderColor: W.mintTua }}>
            <T style={F.b}>Aturan datang & batal</T>
            {OUTLET.aturan.map((a) => (
              <View key={a} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Ikon nama="info" ukuran={18} warna={W.hijau} />
                <T kecil style={{ flex: 1 }}>
                  {a}
                </T>
              </View>
            ))}
            <Tombol kecil varian="lembut" ikon="antre" label="Tanpa janji? Ambil nomor antre" href="/antre" style={{ alignSelf: 'flex-start', marginTop: 4 }} />
          </Kartu>
        </View>
      ) : (
        <View role="tabpanel" style={{ gap: 16 }}>
          {tab === 'selesai' ? (
            <View style={st.ringkas}>
              <View style={st.ringkasItem}>
                <Text style={[st.angka, angkaTabel]}>{selesai.length}</Text>
                <T kecil lembut>kunjungan selesai</T>
              </View>
              <View style={st.ringkasItem}>
                <Text style={st.angka} numberOfLines={1}>
                  {langganan ? kapsterById[langganan].nama.replace('Pak ', '') : '–'}
                </Text>
                <T kecil lembut>kapster langganan</T>
              </View>
            </View>
          ) : null}
          <DaftarBulan daftar={tab === 'selesai' ? selesai : batal} />
          {!(tab === 'selesai' ? selesai : batal).length ? <T lembut>{tab === 'selesai' ? 'Belum ada kunjungan selesai.' : 'Tidak ada booking yang dibatalkan.'}</T> : null}
        </View>
      )}
    </Layar>
  );
}

function DaftarBulan({ daftar }) {
  const grup = [];
  for (const b of daftar) {
    const t = bagian(b.mulai);
    const k = `${BULAN[t.bl]} ${t.th}`;
    if (!grup.length || grup[grup.length - 1].k !== k) grup.push({ k, isi: [] });
    grup[grup.length - 1].isi.push(b);
  }
  return grup.map((g) => (
    <View key={g.k} style={{ gap: 8 }}>
      <Judul level={2} style={st.bulan}>
        {g.k}
      </Judul>
      <View role="list" style={{ gap: 8 }}>
        {g.isi.map((b) => {
          const t = bagian(b.mulai);
          const l = layananById[b.layanan];
          const k = kapsterById[b.kapster];
          const batal = b.status === 'batal';
          return (
            <View key={b.kode + b.mulai} role="listitem" style={st.riwayat}>
              <View style={[st.tgl, batal && { backgroundColor: W.kertasTua }]}>
                <Text style={st.tglAngka}>{t.tg}</Text>
                <Text style={st.tglBulan}>{BULAN_PENDEK[t.bl]}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T style={F.b} numberOfLines={2}>
                  {l.nama}
                  {b.tambahan.length ? ` + ${b.tambahan.map((id) => layananById[id].nama).join(', ')}` : ''}
                </T>
                <T kecil lembut>
                  {k.nama} · {jamDari(b.mulai)} · {batal ? b.alasan || 'Dibatalkan' : rupiah(b.total)}
                  {b.antre ? ` · antre ${b.antre}` : ''}
                  {b.untuk && b.untuk.jenis !== 'saya' ? ` · ${atasNama(b)}` : ''}
                </T>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <Tombol
                    kecil
                    varian="garis"
                    label="Pesan lagi"
                    aksesLabel={`Pesan lagi ${l.nama} dengan ${k.nama}`}
                    href={{ pathname: '/booking/waktu', params: { layanan: b.layanan, kapster: b.kapster, tambah: b.tambahan.join(',') } }}
                  />
                  <Tombol kecil varian="teks" label="Karcis" aksesLabel={`Karcis ${tanggal(b.mulai)}`} href={{ pathname: '/karcis', params: { kode: b.kode } }} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  ));
}

const st = StyleSheet.create({
  kosong: { gap: 8, alignItems: 'center', paddingVertical: 20 },
  ringkas: { flexDirection: 'row', gap: 10 },
  ringkasItem: { flex: 1, padding: 14, borderRadius: R.besar, backgroundColor: W.mint, borderWidth: 1, borderColor: W.mintTua },
  angka: { ...F.display, fontSize: 28, lineHeight: 34, color: W.tinta },
  bulan: { fontSize: 18, lineHeight: 24 },
  riwayat: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: R.besar, backgroundColor: W.putih, borderWidth: 1, borderColor: W.garis },
  tgl: { width: 52, borderRadius: 12, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, alignSelf: 'flex-start' },
  tglAngka: { ...F.display, fontSize: 22, lineHeight: 26, color: W.tinta },
  tglBulan: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tinta },
});
