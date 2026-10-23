import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { W, F, R } from '../../lib/tema';
import { kapsterUntuk, kapsterById, RENTANG_HARI } from '../../lib/data';
import { durasi, jam, jamDari, menitKe, sebutanHari, hariKe, tanggal, pada, awalHari } from '../../lib/waktu';
import { useToko, hitungPesanan, tampilKode, bisaUbah } from '../../lib/store';
import { slotHari, pilihOtomatis } from '../../lib/slot';
import { usePesanan, teruskan } from '../../lib/kait';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Judul, Tombol, Kerangka, Saklar } from '../../components/ui';
import { Langkah, StripHari, GridSlot, Avatar } from '../../components/booking';
import Pola from '../../components/Pola';
import Ikon from '../../components/Ikon';

export function generateMetadata() {
  return meta('/booking/waktu');
}

export default function PilihWaktu() {
  const { siap, q, ...pesan } = usePesanan();
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const kodeUbah = siap && q.ubah ? String(q.ubah) : null;
  const lama = siap && kodeUbah ? bookings.find((b) => b.kode === kodeUbah) : null;

  // Saat mengubah jadwal, layanan & tambahan diambil dari booking lama.
  const layanan = lama ? lama.layanan : pesan.layanan;
  const tambah = lama ? lama.tambahan : pesan.tambah;
  const p = useMemo(() => (lama ? hitungPesanan(lama.layanan, lama.tambahan) : pesan.p), [lama, pesan.p]);

  const [kapster, setKapster] = useState('semua');
  const [hari, setHari] = useState(null);
  const [menit, setMenit] = useState(null);
  const [sembunyi, setSembunyi] = useState(null);
  const setelah = q.setelah ? Number(q.setelah) : 0;
  const sambungHari = setelah ? hariKe(setelah) : null;
  const sambungMenit = setelah ? menitKe(setelah) : null;
  useEffect(() => {
    if (lama) setKapster(lama.kapster);
    else if (q.kapster) setKapster(String(q.kapster));
  }, [lama?.kode, q.kapster]);

  const bisa = layanan ? kapsterUntuk(layanan, pesan.privat) : [];
  const pilihKapster = bisa.some((k) => k.id === kapster) ? kapster : 'semua';
  const ids = pilihKapster === 'semua' ? bisa.map((k) => k.id) : [pilihKapster];
  const hIni = hariKe(sekarang);
  const menitIni = Math.floor(sekarang / 60000);

  const daftarHari = useMemo(() => {
    if (!siap || !layanan) return [];
    return Array.from({ length: RENTANG_HARI }, (_, i) => {
      const h = hIni + i;
      const r = slotHari({ h, durasi: p.durasi, kapsterIds: ids, bookings, kecuali: kodeUbah, sekarang });
      return { h, awal: awalHari(h) + 12 * 3600e3, kosong: r.slot.filter((s) => s.status === 'kosong').length, alasan: r.alasan, sebutan: sebutanHari(h, hIni) };
    });
  }, [siap, layanan, p.durasi, ids.join(), bookings, kodeUbah, hIni, menitIni]);

  // Pilih otomatis hari pertama yang masih punya jam kosong (atau hari karcis yang mau disambung).
  useEffect(() => {
    if (!daftarHari.length) return;
    const masih = daftarHari.find((d) => d.h === hari && d.kosong > 0);
    if (!masih) {
      const sbg = sambungHari != null && daftarHari.find((d) => d.h === sambungHari && d.kosong > 0);
      const pertama = sbg || daftarHari.find((d) => d.kosong > 0);
      setHari(pertama ? pertama.h : null);
      setMenit(null);
    }
  }, [daftarHari]);

  const data = useMemo(
    () => (siap && layanan && hari != null ? slotHari({ h: hari, durasi: p.durasi, kapsterIds: ids, bookings, kecuali: kodeUbah, sekarang }) : null),
    [siap, layanan, hari, p.durasi, ids.join(), bookings, kodeUbah, menitIni],
  );
  const terpilih = data && menit != null ? data.slot.find((s) => s.menit === menit && s.status === 'kosong') : null;
  const menitSambung =
    data && hari === sambungHari ? data.slot.find((x) => x.status === 'kosong' && x.menit >= sambungMenit && x.menit - sambungMenit <= 60)?.menit ?? null : null;
  useEffect(() => {
    if (menit != null && data && !terpilih) setMenit(null);
    // Jam kosong terdekat sesudah karcis sebelumnya (maks. 60 menit) langsung dipilih.
    if (data && menit == null && menitSambung != null) setMenit(menitSambung);
  }, [data]);
  const rasioTerisi = data && data.slot.length ? data.slot.filter((x) => x.status !== 'kosong').length / data.slot.length : 0;
  const sembunyikan = sembunyi ?? rasioTerisi > 0.5;

  if (siap && !layanan) {
    return (
      <Layar kembali induk="/booking" judul={kodeUbah ? 'Booking tidak ditemukan' : 'Layanan belum dipilih'}>
        <T>{kodeUbah ? 'Kode booking ini tidak ada di perangkat ini.' : 'Mulai dari langkah pertama supaya durasi dan harga terhitung.'}</T>
        <Tombol label={kodeUbah ? 'Ke Jadwalku' : 'Pilih layanan'} href={kodeUbah ? '/jadwal' : '/booking'} replace />
      </Layar>
    );
  }
  if (lama && !bisaUbah(lama, sekarang)) {
    return (
      <Layar kembali induk="/jadwal" judul="Jadwal tidak bisa diubah">
        <T>
          Karcis {tampilKode(lama.kode)} {lama.status === 'aktif' ? 'sudah kurang dari 1 jam sebelum jadwal' : 'sudah tidak aktif'}. Hubungi outlet lewat WhatsApp kalau perlu bantuan.
        </T>
        <Tombol label="Lihat karcis" href={{ pathname: '/karcis', params: { kode: lama.kode } }} replace />
      </Layar>
    );
  }

  const lanjut = () => {
    const otomatis = pilihKapster === 'semua' && ids.length > 1;
    const kap = otomatis ? pilihOtomatis(terpilih.kapster, hari) : ids[0];
    router.push({
      pathname: '/booking/konfirmasi',
      params: {
        layanan,
        kapster: kap,
        mulai: String(pada(hari, menit)),
        ...teruskan(q, { tambah: tambah.join(',') }),
        ...(otomatis ? { otomatis: '1' } : {}),
        ...(kodeUbah ? { ubah: kodeUbah } : {}),
      },
    });
  };

  const selesai = terpilih ? menit + p.durasi : null;

  return (
    <Layar
      kembali
      induk={kodeUbah ? '/jadwal' : '/booking'}
      judul={kodeUbah ? 'Ubah jadwal' : 'Pilih tanggal & jam'}
      sebelumJudul={kodeUbah ? null : <Langkah ke={3} />}
      sub={kodeUbah && lama ? `Karcis ${tampilKode(lama.kode)} · semula ${tanggal(lama.mulai, { pendek: true })} ${jamDari(lama.mulai)}` : null}
      bawah={
        <>
          <T kecil style={F.sb} aria-live="polite" numberOfLines={1}>
            {terpilih ? `${tanggal(pada(hari, menit), { pendek: true })} · ${jam(menit)}–${jam(selesai)} WIB` : 'Pilih jam yang masih kosong'}
          </T>
          <Tombol label={kodeUbah ? 'Tinjau perubahan' : 'Lanjut ke konfirmasi'} ikonKanan="kanan" disabled={!terpilih} onPress={lanjut} penuh />
        </>
      }
    >
      {siap ? (
        <T lembut>
          <T style={[F.b, { color: W.tinta }]}>{p.item.map((l) => l.nama).join(' + ')}</T> · {durasi(p.durasi)}
        </T>
      ) : (
        <Kerangka tinggi={22} />
      )}

      <View style={{ gap: 8 }}>
        <Judul level={2} style={st.kecil}>
          Kapster
        </Judul>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.chipBaris} role="radiogroup" aria-label="Kapster">
          {[{ id: 'semua', nama: 'Siapa saja' }, ...(siap ? bisa : [])].map((k) => {
            const aktif = pilihKapster === k.id;
            return (
              <Pressable
                key={k.id}
                role="radio"
                aria-checked={aktif}
                onPress={() => {
                  setKapster(k.id);
                  setMenit(null);
                }}
                style={({ pressed }) => [st.chip, aktif && st.chipAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}
              >
                {k.id === 'semua' ? (
                  <View style={st.chipSemua}>
                    <Pola jenis="belang" varian="pangkas" lebarBelang={4} />
                  </View>
                ) : (
                  <Avatar id={k.id} ukuran={30} />
                )}
                <Text style={[st.chipTeks, aktif && { color: W.krem }]}>{k.nama}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ gap: 8 }}>
        <Judul level={2} style={st.kecil}>
          Tanggal
        </Judul>
        {siap ? <StripHari hari={daftarHari} pilih={hari} ubah={(h) => { setHari(h); setMenit(null); }} /> : <Kerangka tinggi={86} />}
      </View>

      <View style={{ gap: 10 }}>
        <View style={st.legenda} aria-hidden>
          <View style={st.legendaItem}>
            <View style={[st.legendaKotak, { borderColor: W.hijau, backgroundColor: W.putih }]} />
            <T kecil lembut>Kosong</T>
          </View>
          <View style={st.legendaItem}>
            <View style={[st.legendaKotak, { backgroundColor: W.kertasTua, borderColor: W.kertasTua, overflow: 'hidden' }]}>
              <Pola jenis="belang" varian="terisi" lebarBelang={3} />
            </View>
            <T kecil lembut>Terisi</T>
          </View>
          <View style={st.legendaItem}>
            <View style={[st.legendaKotak, { backgroundColor: W.marun, borderColor: W.marun }]} />
            <T kecil lembut>Pilihanmu</T>
          </View>
        </View>
        {!siap || !data ? (
          siap && !daftarHari.some((d) => d.kosong) ? (
            <T>Dua pekan ke depan sudah penuh untuk pilihan ini. Coba kapster lain atau "Siapa saja".</T>
          ) : (
            <KerangkaGrid />
          )
        ) : (
          <>
            {data.lewat && hari === hIni ? (
              <T kecil lembut>Jam sebelum {jam(Math.min(1439, Math.ceil((menitKe(sekarang) + 30) / 15) * 15))} tidak ditampilkan: paling cepat 30 menit dari sekarang.</T>
            ) : null}
            <Saklar
              label="Sembunyikan jam yang terisi"
              ket={`${data.slot.filter((x) => x.status !== 'kosong').length} dari ${data.slot.length} jam sudah terisi hari ini`}
              nilai={sembunyikan}
              ubah={setSembunyi}
            />
            {menitSambung != null ? (
              <View style={st.sambung}>
                <Ikon nama="karcis" ukuran={18} warna={W.hijau} />
                <T kecil style={[F.sb, { flex: 1 }]}>
                  {menitSambung === sambungMenit
                    ? `Jam ${jam(menitSambung)} menyambung karcis sebelumnya, jadi bisa datang bersama.`
                    : `Jam ${jam(menitSambung)} paling dekat setelah karcis sebelumnya selesai ${jam(sambungMenit)} (tunggu ${menitSambung - sambungMenit} menit).`}
                </T>
              </View>
            ) : hari === sambungHari ? (
              <T kecil lembut>Tidak ada jam kosong dalam 1 jam setelah karcis sebelumnya; pilih jam lain atau kapster lain.</T>
            ) : null}
            <GridSlot data={data} pilih={menit} ubah={setMenit} durasiMenit={p.durasi} sembunyikan={sembunyikan} sambung={menitSambung} />
            <T kecil lembut>Jam yang tampil sudah memperhitungkan durasi {durasi(p.durasi)}, jam istirahat, dan jam tutup. Semua waktu dalam WIB.</T>
          </>
        )}
      </View>
    </Layar>
  );
}

function KerangkaGrid() {
  return (
    <View aria-hidden style={{ gap: 8 }}>
      <Kerangka tinggi={22} style={{ width: 120 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={{ width: '23%', flexGrow: 1, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: W.kertasTua }}>
            <Pola jenis="belang" varian="lembut" lebarBelang={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  kecil: { fontSize: 18, lineHeight: 24 },
  sambung: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, backgroundColor: W.mint },
  chipBaris: { gap: 8, paddingRight: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingLeft: 6, paddingRight: 14, borderRadius: 999, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih },
  chipAktif: { backgroundColor: W.hijau, borderColor: W.hijau },
  chipSemua: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
  chipTeks: { ...F.b, fontSize: 14, lineHeight: 18, color: W.tinta },
  legenda: { flexDirection: 'row', gap: 16 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaKotak: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5 },
});
