import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { W, F, R, angkaTabel } from '../lib/tema';
import { kapsterById, layananById, CAP_PENUH, NILAI_HADIAH } from '../lib/data';
import { tanggal, jamDari, jam, bagian, BULAN_PENDEK, HARI_PENDEK, HARI, BULAN, rupiah, durasi } from '../lib/waktu';
import { tampilKode } from '../lib/store';
import Gambar from './Gambar';
import Pola from './Pola';
import Ikon from './Ikon';
import { T } from './ui';

export function Avatar({ id, ukuran = 56, cincin = false }) {
  const k = kapsterById[id];
  if (!k) return null;
  return (
    <View style={[st.avatar, { width: ukuran, height: ukuran, borderRadius: ukuran / 2, backgroundColor: k.warna }, cincin && st.avatarCincin]}>
      <Gambar nama={`kapster-${id}.webp`} lebar={ukuran} tinggi={ukuran} bulat={ukuran / 2} />
    </View>
  );
}

const STATUS = {
  aktif: { teks: 'Aktif', fg: W.hijau, bg: W.mint },
  selesai: { teks: 'Selesai', fg: W.tinta, bg: W.kertasTua },
  batal: { teks: 'Dibatalkan', fg: W.marun, bg: W.marunMuda },
};

/** Karcis booking: motif tiket antre dengan sobekan, kode besar, dan cap status. */
export function Karcis({ b, ringkas = false }) {
  const l = layananById[b.layanan];
  const k = kapsterById[b.kapster];
  const t = bagian(b.mulai);
  const selesai = b.mulai + b.durasi * 60000;
  const stt = STATUS[b.status];
  const tambahan = b.tambahan.map((id) => layananById[id]?.nama).filter(Boolean);
  return (
    <View style={[st.karcis, ringkas && st.karcisRingkas]}>
      <View style={[st.sobek, ringkas && { width: 76 }]}>
        <Pola jenis="tegel" varian={b.status === 'batal' ? 'krem' : 'mint'} ukuran={38} />
        <View style={st.tanggalBlok}>
          <Text style={st.tanggalHari}>{HARI_PENDEK[t.hr]}</Text>
          <Text style={st.tanggalAngka}>{t.tg}</Text>
          <Text style={st.tanggalBulan}>{BULAN_PENDEK[t.bl]}</Text>
        </View>
      </View>
      <View style={[st.lubang, { top: -10, left: (ringkas ? 76 : 84) - 10 }]} />
      <View style={[st.lubang, { bottom: -10, left: (ringkas ? 76 : 84) - 10 }]} />
      <View style={st.karcisBadan}>
        <View style={st.karcisAtas}>
          <Text style={st.karcisLabel}>KARCIS BOOKING</Text>
          <View style={[st.status, { backgroundColor: stt.bg }]}>
            <Text style={[st.statusTeks, { color: stt.fg }]}>{stt.teks}</Text>
          </View>
        </View>
        <Text style={[st.kode, ringkas && { fontSize: 24, lineHeight: 30 }]}>
          {tampilKode(b.kode)}
        </Text>
        <T style={F.b} numberOfLines={ringkas ? 1 : 2}>
          {l?.nama}
          {tambahan.length ? ` + ${tambahan.join(', ')}` : ''}
        </T>
        <T kecil style={[F.sb, angkaTabel]}>
          {tanggal(b.mulai, { pendek: ringkas })} · {jamDari(b.mulai)}–{jamDari(selesai)} WIB
        </T>
        <View style={st.karcisKapster}>
          <Avatar id={b.kapster} ukuran={28} />
          <T kecil lembut style={{ flex: 1 }} numberOfLines={1}>
            {k?.nama} · {k?.peran}
            {b.otomatis ? ' (dipilihkan)' : ''}
          </T>
        </View>
        {!ringkas ? (
          <>
            <View style={st.putus} />
            <View style={st.karcisBawah}>
              <T kecil lembut>{b.status === 'selesai' ? 'Dibayar di kasir' : 'Bayar di kasir · tunai/QRIS'}</T>
              <Text style={st.harga}>{rupiah(b.total)}</Text>
            </View>
          </>
        ) : null}
      </View>
      {b.status !== 'aktif' && !ringkas ? (
        <View style={[st.cap, { borderColor: stt.fg }]} aria-hidden>
          <Text style={[st.capTeks, { color: stt.fg }]}>{b.status === 'batal' ? 'DIBATALKAN' : 'SELESAI'}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function Langkah({ ke, judul }) {
  const NAMA = ['Layanan', 'Kapster', 'Jam', 'Konfirmasi'];
  return (
    <View style={{ gap: 8 }}>
      <View style={st.langkahBaris} aria-hidden>
        {NAMA.map((n, i) => (
          <View key={n} style={[st.langkahRuas, i < ke && st.langkahIsi]}>
            {i < ke ? <Pola jenis="belang" varian="pangkas" lebarBelang={5} /> : null}
          </View>
        ))}
      </View>
      <T kecil lembut style={F.sb}>
        Langkah {ke} dari 4 · {judul || NAMA[ke - 1]}
      </T>
    </View>
  );
}

/** Strip tanggal 14 hari ke depan. */
export function StripHari({ hari, pilih, ubah }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.strip} role="radiogroup" aria-label="Pilih tanggal">
      {hari.map((d) => {
        const aktif = d.h === pilih;
        const mati = d.kosong === 0;
        const t = bagian(d.awal);
        const ket = d.alasan === 'tutup' ? 'Tutup' : d.alasan === 'libur' ? 'Libur' : d.alasan === 'habis' ? 'Habis' : mati ? 'Penuh' : `${d.kosong} jam`;
        return (
          <Pressable
            key={d.h}
            role="radio"
            aria-checked={aktif}
            aria-disabled={mati || undefined}
            disabled={mati}
            aria-label={`${d.sebutan && d.sebutan !== 'Lusa' ? d.sebutan : HARI_PENDEK[t.hr]} ${t.tg} ${ket}${mati ? '' : ' kosong'}, ${HARI[t.hr]} ${t.tg} ${BULAN[t.bl]}`}
            onPress={() => ubah(d.h)}
            style={({ pressed }) => [st.hari, aktif && st.hariAktif, mati && st.hariMati, pressed && !aktif && { backgroundColor: W.kertasTua }]}
          >
            {mati ? <Pola jenis="belang" varian="terisi" lebarBelang={4} /> : null}
            <Text style={[st.hariNama, aktif && { color: W.krem }]}>{d.sebutan && d.sebutan !== 'Lusa' ? d.sebutan : HARI_PENDEK[t.hr]}</Text>
            <Text style={[st.hariAngka, aktif && { color: W.krem }]}>{t.tg}</Text>
            <Text style={[st.hariKet, aktif && { color: W.krem }, mati && { color: W.tintaLembut }]}>{ket}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const KELOMPOK = [
  { id: 'pagi', nama: 'Pagi', dari: 0, sampai: 720 },
  { id: 'siang', nama: 'Siang', dari: 720, sampai: 900 },
  { id: 'sore', nama: 'Sore', dari: 900, sampai: 1080 },
  { id: 'malam', nama: 'Malam', dari: 1080, sampai: 1440 },
];

export function GridSlot({ data, pilih, ubah }) {
  const { slot, istirahat } = data;
  const grup = KELOMPOK.map((g) => ({ ...g, slot: slot.filter((s) => s.menit >= g.dari && s.menit < g.sampai) })).filter((g) => g.slot.length);
  return (
    <View style={{ gap: 14 }}>
      {grup.map((g, gi) => {
        const istirahatSebelum = istirahat && gi > 0 && istirahat[0] >= grup[gi - 1].slot[0].menit && istirahat[1] <= g.slot[0].menit + 15;
        const kosong = g.slot.filter((s) => s.status === 'kosong').length;
        return (
          <View key={g.id} style={{ gap: 8 }}>
            {istirahatSebelum ? (
              <View style={st.istirahat}>
                <Ikon nama="jam" ukuran={16} warna={W.tintaLembut} />
                <T kecil lembut style={F.sb}>
                  Istirahat {jam(istirahat[0])}–{jam(istirahat[1])}
                </T>
              </View>
            ) : null}
            <View style={st.grupKepala}>
              <Text role="heading" aria-level={3} style={st.grupNama}>
                {g.nama}
              </Text>
              <T kecil lembut>{kosong ? `${kosong} kosong` : 'semua terisi'}</T>
            </View>
            <View style={st.grid}>
              {g.slot.map((s) => {
                const aktif = s.menit === pilih;
                const terisi = s.status !== 'kosong';
                return (
                  <Pressable
                    key={s.menit}
                    role="radio"
                    aria-checked={aktif}
                    aria-disabled={terisi || undefined}
                    disabled={terisi}
                    aria-label={`${jam(s.menit)}, ${terisi ? 'sudah terisi' : 'kosong'}`}
                    onPress={() => ubah(s.menit)}
                    style={({ pressed }) => [st.slot, terisi && st.slotIsi, aktif && st.slotAktif, pressed && !aktif && !terisi && { backgroundColor: W.mint }]}
                  >
                    {terisi ? <Pola jenis="belang" varian="terisi" lebarBelang={4} /> : null}
                    <Text style={[st.slotTeks, angkaTabel, terisi && st.slotTeksIsi, aktif && { color: W.krem }]}>{jam(s.menit)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function KartuCap({ jumlah }) {
  const n = Math.max(0, jumlah);
  const penuh = n >= CAP_PENUH;
  return (
    <View style={{ gap: 10 }}>
      <View style={st.capBaris} aria-label={`${Math.min(n, CAP_PENUH)} dari ${CAP_PENUH} cap terkumpul`} role="img">
        {Array.from({ length: CAP_PENUH }).map((_, i) => {
          const isi = i < n;
          return (
            <View key={i} style={[st.capBulat, isi ? st.capIsi : st.capKosong]}>
              {isi ? <Ikon nama="kursi" ukuran={18} warna={W.krem} /> : <Text style={st.capNo}>{i + 1}</Text>}
            </View>
          );
        })}
      </View>
      <T kecil lembut>
        {penuh
          ? `Kartu penuh. Potongan ${rupiah(NILAI_HADIAH)} bisa dipakai saat konfirmasi booking.`
          : `${CAP_PENUH - n} kunjungan lagi untuk potongan ${rupiah(NILAI_HADIAH)}.`}
      </T>
    </View>
  );
}

export function infoLayanan(id) {
  const l = layananById[id];
  return l ? `${durasi(l.menit)} · ${l.mulai ? 'mulai ' : ''}${rupiah(l.harga)}` : '';
}

const st = StyleSheet.create({
  avatar: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarCincin: { borderWidth: 3, borderColor: W.putih },
  karcis: { flexDirection: 'row', backgroundColor: W.putih, borderRadius: R.besar, borderWidth: 1, borderColor: W.garis, minHeight: 150 },
  karcisRingkas: { minHeight: 0 },
  sobek: { width: 84, borderTopLeftRadius: R.besar, borderBottomLeftRadius: R.besar, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRightWidth: 2, borderRightColor: W.garis, borderStyle: 'dashed' },
  tanggalBlok: { backgroundColor: W.krem, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', minWidth: 54, borderWidth: 1, borderColor: W.garis },
  tanggalHari: { ...F.b, fontSize: 12, lineHeight: 16, color: W.hijau, letterSpacing: 0.4 },
  tanggalAngka: { ...F.display, fontSize: 28, lineHeight: 32, color: W.tinta },
  tanggalBulan: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tinta },
  lubang: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: W.kertas, borderWidth: 1, borderColor: W.garis },
  karcisBadan: { flex: 1, padding: 14, paddingLeft: 16, gap: 4, minWidth: 0 },
  karcisAtas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  karcisLabel: { ...F.b, fontSize: 11, lineHeight: 14, letterSpacing: 1, color: W.tintaLembut },
  status: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  statusTeks: { ...F.b, fontSize: 12, lineHeight: 16 },
  kode: { ...F.display, fontSize: 32, lineHeight: 38, color: W.marun, letterSpacing: 1 },
  karcisKapster: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  putus: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTegas, marginVertical: 8 },
  karcisBawah: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  harga: { ...F.display, fontSize: 20, lineHeight: 26, color: W.tinta },
  cap: { position: 'absolute', right: 14, top: 44, borderWidth: 2.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-9deg' }], backgroundColor: 'rgba(255,252,246,0.85)' },
  capTeks: { ...F.xb, fontSize: 16, lineHeight: 20, letterSpacing: 1.5 },
  langkahBaris: { flexDirection: 'row', gap: 6 },
  langkahRuas: { flex: 1, height: 8, borderRadius: 4, backgroundColor: W.kertasTua, overflow: 'hidden' },
  langkahIsi: { backgroundColor: W.marun },
  strip: { gap: 8, paddingVertical: 2, paddingRight: 16 },
  hari: { width: 66, minHeight: 86, borderRadius: 16, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, overflow: 'hidden' },
  hariAktif: { backgroundColor: W.marun, borderColor: W.marun },
  hariMati: { backgroundColor: W.kertasTua, borderColor: W.kertasTua },
  hariNama: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tintaLembut },
  hariAngka: { ...F.display, fontSize: 24, lineHeight: 30, color: W.tinta },
  hariKet: { ...F.sb, fontSize: 11, lineHeight: 14, color: W.hijau },
  istirahat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: W.kertasTua, alignSelf: 'flex-start' },
  grupKepala: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  grupNama: { ...F.b, fontSize: 16, lineHeight: 22, color: W.tinta },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '23%', flexGrow: 1, maxWidth: '25%', minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: W.hijau, backgroundColor: W.putih, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  slotIsi: { borderColor: W.kertasTua, backgroundColor: W.kertasTua },
  slotAktif: { backgroundColor: W.marun, borderColor: W.marun },
  slotTeks: { ...F.b, fontSize: 16, lineHeight: 20, color: W.tinta },
  slotTeksIsi: { color: W.tintaLembut, textDecorationLine: 'line-through' },
  capBaris: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  capBulat: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  capIsi: { backgroundColor: W.marun },
  capKosong: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTegas },
  capNo: { ...F.b, fontSize: 13, lineHeight: 16, color: W.tintaLembut },
});
