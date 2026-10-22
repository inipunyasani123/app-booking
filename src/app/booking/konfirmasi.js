import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { W, F, R } from '../../lib/tema';
import { kapsterById, PENGINGAT, OUTLET, CAP_PENUH, NILAI_HADIAH } from '../../lib/data';
import { durasi, jam, jamDari, tanggal, rupiah, hariKe, menitKe, MENIT_MS } from '../../lib/waktu';
import { useToko, hitungPesanan, buatBooking, ubahJadwal, capTerkumpul, tampilKode, bisaUbah } from '../../lib/store';
import { kapsterKosong } from '../../lib/slot';
import { usePesanan } from '../../lib/kait';
import { JEDA_PESAN_MENIT } from '../../lib/data';
import { meta } from '../../lib/seo';
import Layar from '../../components/Layar';
import { T, Judul, Label, Tombol, Kerangka, Kartu, Saklar, Garis } from '../../components/ui';
import { Langkah, Avatar } from '../../components/booking';
import Ikon from '../../components/Ikon';

export function generateMetadata() {
  return meta('/booking/konfirmasi');
}

export default function Konfirmasi() {
  const { siap, q, ...pesan } = usePesanan();
  const sekarang = useToko((s) => s.sekarang);
  const bookings = useToko((s) => s.bookings);
  const profil = useToko((s) => s.profil);
  const hadiahDipakai = useToko((s) => s.hadiahDipakai);
  const kodeUbah = q.ubah ? String(q.ubah) : null;
  const lama = siap && kodeUbah ? bookings.find((b) => b.kode === kodeUbah) : null;
  const layanan = lama ? lama.layanan : pesan.layanan;
  const tambah = lama ? lama.tambahan : pesan.tambah;
  const p = lama ? hitungPesanan(lama.layanan, lama.tambahan) : pesan.p;
  const kapster = q.kapster && kapsterById[String(q.kapster)] ? String(q.kapster) : null;
  const mulai = Number(q.mulai) || 0;

  const [nama, setNama] = useState('');
  const [catatan, setCatatan] = useState('');
  const [pengingat, setPengingat] = useState([]);
  const [hadiah, setHadiah] = useState(false);
  const [galat, setGalat] = useState('');
  useEffect(() => {
    if (!siap) return;
    setNama(lama ? lama.nama : profil.nama);
    setCatatan(lama ? lama.catatan : '');
    setPengingat(lama ? lama.pengingat : profil.pengingat);
  }, [siap, lama?.kode]);

  const cap = capTerkumpul({ bookings, hadiahDipakai });
  const valid = siap && layanan && kapster && mulai > 0 && kapsterById[kapster].layanan.includes(layanan);
  const h = hariKe(mulai);
  const m = menitKe(mulai);
  const masihKosong = valid && kapsterKosong(kapsterById[kapster], h, m, p.durasi, bookings, kodeUbah) && mulai - sekarang >= (JEDA_PESAN_MENIT - 1) * MENIT_MS;
  const potongan = hadiah ? Math.min(NILAI_HADIAH, p.total) : 0;

  if (lama && !bisaUbah(lama, sekarang)) {
    return (
      <Layar kembali induk="/jadwal" judul="Jadwal tidak bisa diubah">
        <T>Perubahan hanya bisa sampai 1 jam sebelum jadwal.</T>
        <Tombol label="Lihat karcis" href={{ pathname: '/karcis', params: { kode: lama.kode } }} replace />
      </Layar>
    );
  }
  if (siap && !valid) {
    return (
      <Layar kembali induk="/booking" judul="Data booking kurang">
        <T>Pilihan layanan, kapster, atau jam tidak lengkap. Ulangi dari langkah pertama, ya.</T>
        <Tombol label="Mulai booking" href="/booking" replace />
      </Layar>
    );
  }

  const kirim = () => {
    if (!masihKosong) {
      setGalat('Jam ini baru saja terisi atau sudah terlalu dekat. Pilih jam lain.');
      return;
    }
    if (!nama.trim()) {
      setGalat('Isi nama untuk karcis dulu.');
      return;
    }
    if (lama) {
      ubahJadwal(lama.kode, { kapster, mulai });
      router.replace({ pathname: '/karcis', params: { kode: lama.kode, diubah: '1' } });
    } else {
      const kode = buatBooking({ layanan, tambahan: tambah, kapster, mulai, nama, catatan, pengingat, otomatis: q.otomatis === '1', pakaiHadiah: hadiah });
      router.replace({ pathname: '/karcis', params: { kode, baru: '1' } });
    }
  };

  const k = kapster ? kapsterById[kapster] : null;
  return (
    <Layar
      kembali
      induk="/booking"
      judul={lama ? 'Simpan jadwal baru?' : 'Konfirmasi booking'}
      sebelumJudul={lama ? null : <Langkah ke={4} />}
      bawah={
        <>
          {galat ? (
            <T kecil role="alert" style={[F.sb, { color: W.marun }]}>
              {galat}
            </T>
          ) : null}
          <View style={st.totalBaris}>
            <T kecil lembut>{lama ? `Karcis ${tampilKode(lama.kode)} tetap sama` : 'Bayar di kasir setelah selesai'}</T>
            <Text style={st.total}>{siap ? `${p.mulai ? 'mulai ' : ''}${rupiah(p.total - potongan)}` : ''}</Text>
          </View>
          <Tombol label={lama ? 'Simpan jadwal baru' : 'Konfirmasi booking'} ikon="centang" onPress={kirim} disabled={!siap} penuh />
        </>
      }
    >
      {!siap ? (
        <Kerangka tinggi={220} />
      ) : (
        <Kartu style={{ gap: 12 }}>
          <View style={st.waktu}>
            <View style={st.waktuIkon}>
              <Ikon nama="kalender" warna={W.krem} />
            </View>
            <View style={{ flex: 1 }}>
              <T style={F.b}>{tanggal(mulai)}</T>
              <T style={[F.sb, { color: W.hijau }]}>
                {jam(m)}–{jam(m + p.durasi)} WIB · {durasi(p.durasi)}
              </T>
            </View>
          </View>
          {lama ? (
            <T kecil lembut>
              Semula {tanggal(lama.mulai, { pendek: true })} {jamDari(lama.mulai)} dengan {kapsterById[lama.kapster].nama}.
            </T>
          ) : null}
          <Garis />
          <View style={st.kapster}>
            <Avatar id={kapster} ukuran={44} />
            <View style={{ flex: 1 }}>
              <T style={F.b}>{k.nama}</T>
              <T kecil lembut>
                {k.peran}
                {q.otomatis === '1' ? ' · dipilihkan karena jamnya kosong' : ''}
              </T>
            </View>
          </View>
          <Garis />
          <View style={{ gap: 6 }}>
            {p.item.map((l) => (
              <View key={l.id} style={st.item}>
                <T style={{ flex: 1 }}>{l.nama}</T>
                <T style={F.sb}>
                  {l.mulai ? 'mulai ' : ''}
                  {rupiah(l.harga)}
                </T>
              </View>
            ))}
            {potongan ? (
              <View style={st.item}>
                <T style={[{ flex: 1 }, { color: W.hijau }]}>Hadiah kartu cap</T>
                <T style={[F.sb, { color: W.hijau }]}>−{rupiah(potongan)}</T>
              </View>
            ) : null}
          </View>
          {!masihKosong ? (
            <T kecil role="alert" style={[F.sb, { color: W.marun }]}>
              Jam ini sudah tidak tersedia. Kembali dan pilih jam lain.
            </T>
          ) : null}
        </Kartu>
      )}

      {!lama ? (
        <View style={{ gap: 10 }}>
          <Judul level={2}>Data karcis</Judul>
          <View style={{ gap: 6 }}>
            <Label nativeID="label-nama">Nama panggilan</Label>
            <TextInput value={nama} onChangeText={setNama} aria-labelledby="label-nama" aria-label="Nama panggilan" maxLength={24} style={st.input} placeholder="Misalnya Ardi" placeholderTextColor={W.tintaLembut} />
          </View>
          <View style={{ gap: 6 }}>
            <Label>Catatan untuk kapster (opsional)</Label>
            <TextInput
              value={catatan}
              onChangeText={setCatatan}
              aria-label="Catatan untuk kapster (opsional)"
              maxLength={140}
              multiline
              style={[st.input, { minHeight: 84, paddingTop: 12, textAlignVertical: 'top' }]}
              placeholder="Misalnya: samping tipis, atas tetap panjang"
              placeholderTextColor={W.tintaLembut}
            />
          </View>
          <T kecil lembut>Tanpa nomor HP: demo ini tidak mengirim apa pun ke luar perangkat.</T>
        </View>
      ) : null}

      {!lama && cap >= CAP_PENUH ? (
        <Kartu style={{ backgroundColor: W.krem }}>
          <Saklar label={`Pakai hadiah kartu cap (−${rupiah(NILAI_HADIAH)})`} ket="Kartu capmu sudah penuh." nilai={hadiah} ubah={setHadiah} />
        </Kartu>
      ) : null}

      {!lama ? (
        <Kartu style={{ gap: 2 }}>
          <Judul level={2}>Pengingat</Judul>
          <T kecil lembut>Simulasi notifikasi muncul di aplikasi ini.</T>
          {PENGINGAT.map((pg, i) => {
            const lewat = siap && mulai - pg.menit * MENIT_MS <= sekarang;
            return (
              <View key={pg.id}>
                {i ? <Garis /> : null}
                <Saklar
                  label={pg.label}
                  ket={lewat ? 'Waktunya sudah lewat untuk jadwal ini' : null}
                  nilai={pengingat.includes(pg.id) && !lewat}
                  disabled={lewat}
                  ubah={(v) => setPengingat((x) => (v ? [...new Set([...x, pg.id])] : x.filter((y) => y !== pg.id)))}
                />
              </View>
            );
          })}
        </Kartu>
      ) : null}

      <View style={{ gap: 6 }}>
        {OUTLET.aturan.map((a) => (
          <View key={a} style={st.aturan}>
            <Ikon nama="info" ukuran={18} warna={W.hijau} />
            <T kecil style={{ flex: 1 }}>
              {a}
            </T>
          </View>
        ))}
      </View>
    </Layar>
  );
}

const st = StyleSheet.create({
  waktu: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  waktuIkon: { width: 44, height: 44, borderRadius: 14, backgroundColor: W.hijau, alignItems: 'center', justifyContent: 'center' },
  kapster: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  item: { flexDirection: 'row', gap: 8 },
  totalBaris: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  total: { ...F.display, fontSize: 22, lineHeight: 28, color: W.tinta },
  input: { ...F.r, fontSize: 16, minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: W.garisTegas, paddingHorizontal: 12, color: W.tinta, backgroundColor: W.putih },
  aturan: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
});
