import { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { W, F, R, angkaTabel } from '../lib/tema';
import { kapsterById, layananById, CAP_PENUH, NILAI_HADIAH } from '../lib/data';
import { tanggal, jamDari, jam, bagian, BULAN_PENDEK, HARI_PENDEK, HARI, BULAN, rupiah, durasi } from '../lib/waktu';
import { tampilKode, atasNama } from '../lib/store';
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
  hadir: { teks: 'Sudah sampai', fg: W.krem, bg: W.hijau },
  selesai: { teks: 'Selesai', fg: W.tinta, bg: W.kertasTua },
  batal: { teks: 'Dibatalkan', fg: W.marun, bg: W.marunMuda },
};

function useGerakDikurangi() {
  const r = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => (r.current = !!v)).catch(() => {});
  }, []);
  return r;
}

/**
 * Karcis booking: kertas krem bertakik, sobekan kiri jok kulit marun berisi tanggal.
 * ringkas = untuk daftar; lengkap = sobekan bawah berisi QR simulasi (`qr`, dirender layar karcis
 * supaya pustaka QR tidak ikut dimuat di Beranda) + kode besar untuk kasir.
 * cetak = animasi karcis keluar dari celah + cap "TERCATAT" (dimatikan bila gerak dikurangi).
 */
export function Karcis({ b, ringkas = false, lengkap = false, cetak = false, qr = null }) {
  const l = layananById[b.layanan];
  const k = kapsterById[b.kapster];
  const t = bagian(b.mulai);
  const selesai = b.mulai + b.durasi * 60000;
  const stt = STATUS[b.status === 'aktif' && b.hadir ? 'hadir' : b.status];
  const tambahan = b.tambahan.map((id) => layananById[id]?.nama).filter(Boolean);
  const kurangi = useGerakDikurangi();
  const geser = useRef(new Animated.Value(cetak ? 1 : 0)).current;
  const cap = useRef(new Animated.Value(cetak ? 0 : 1)).current;
  useEffect(() => {
    if (!cetak) return;
    if (kurangi.current) {
      geser.setValue(0);
      cap.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.timing(geser, { toValue: 0, duration: 300, useNativeDriver: false }),
      Animated.spring(cap, { toValue: 1, friction: 5, tension: 120, useNativeDriver: false }),
    ]).start();
  }, [cetak]);
  const lebarSobek = ringkas ? 76 : 84;

  return (
    <Animated.View
      style={[
        st.karcis,
        ringkas && st.karcisRingkas,
        cetak && { transform: [{ translateY: geser.interpolate({ inputRange: [0, 1], outputRange: [0, -36] }) }], opacity: geser.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
      ]}
    >
      <View style={st.karcisAtasBaris}>
        <View style={[st.sobek, { width: lebarSobek }]}>
          <Pola jenis="kulit" varian={b.status === 'batal' ? 'hijau' : 'marun'} ukuran={28} />
          <View style={st.tanggalBlok}>
            <Text style={st.tanggalHari}>{HARI_PENDEK[t.hr]}</Text>
            <Text style={st.tanggalAngka}>{t.tg}</Text>
            <Text style={st.tanggalBulan}>{BULAN_PENDEK[t.bl]}</Text>
          </View>
        </View>
        <View style={[st.lubang, { top: -10, left: lebarSobek - 10 }]} />
        {!lengkap ? <View style={[st.lubang, { bottom: -10, left: lebarSobek - 10 }]} /> : null}
        <View style={st.karcisBadan}>
          <View style={st.karcisAtas}>
            <Text style={st.karcisLabel}>{b.antre ? `ANTRE ${b.antre}` : 'KARCIS BOOKING'}</Text>
            <View style={[st.status, { backgroundColor: stt.bg }]}>
              <Text style={[st.statusTeks, { color: stt.fg }]}>{stt.teks}</Text>
            </View>
          </View>
          <Text style={[st.kode, ringkas && { fontSize: 24, lineHeight: 30 }]}>{tampilKode(b.kode)}</Text>
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
              {k?.nama} · {b.untuk && b.untuk.jenis !== 'saya' ? `atas nama ${atasNama(b)}` : k?.peran}
              {b.otomatis && !(b.untuk && b.untuk.jenis !== 'saya') ? ' (dipilihkan)' : ''}
            </T>
          </View>
          {!ringkas && !lengkap ? (
            <>
              <View style={st.putus} />
              <View style={st.karcisBawah}>
                <T kecil lembut>{b.status === 'selesai' ? 'Dibayar di kasir' : 'Bayar di kasir · tunai/QRIS'}</T>
                <Text style={st.harga}>{rupiah(b.total)}</Text>
              </View>
            </>
          ) : null}
        </View>
      </View>
      {lengkap ? (
        <View>
          <View style={st.perforasi}>
            <View style={[st.lubang, st.lubangKiri]} />
            <View style={st.putusDatar} />
            <View style={[st.lubang, st.lubangKanan]} />
          </View>
          <View style={st.stub}>
            {qr ? <View style={st.qrBingkai}>{qr}</View> : null}
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={st.karcisLabel}>TUNJUKKAN KE KASIR</Text>
              <Text style={st.kodeBesar} numberOfLines={1} adjustsFontSizeToFit>
                {tampilKode(b.kode)}
              </Text>
              <T kecil lembut>QR simulasi · bayar di kasir</T>
              <Text style={st.harga}>
                {rupiah(b.total)}
                {b.potongan ? <Text style={st.potongan}>{`  (cap −${rupiah(b.potongan)})`}</Text> : null}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
      {b.status !== 'aktif' && !ringkas ? (
        <View style={[st.cap, { borderColor: stt.fg }]} aria-hidden>
          <Text style={[st.capTeks, { color: stt.fg }]}>{b.status === 'batal' ? 'DIBATALKAN' : 'SELESAI'}</Text>
        </View>
      ) : null}
      {cetak && b.status === 'aktif' ? (
        <Animated.View style={[st.capCetak, { opacity: cap, transform: [{ rotate: '-9deg' }, { scale: cap.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1] }) }] }]} aria-hidden>
          <Text style={[st.capTeks, { color: W.marunTua }]}>TERCATAT</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
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

/** Strip tanggal 14 hari ke depan. "N slot" = jumlah jam mulai yang masih kosong. */
export function StripHari({ hari, pilih, ubah }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.strip} role="radiogroup" aria-label="Pilih tanggal">
      {hari.map((d) => {
        const aktif = d.h === pilih;
        const mati = d.kosong === 0;
        const t = bagian(d.awal);
        const ket = d.alasan === 'tutup' ? 'Tutup' : d.alasan === 'libur' ? 'Libur' : d.alasan === 'habis' ? 'Habis' : mati ? 'Penuh' : `${d.kosong} slot`;
        const nama = d.sebutan && d.sebutan !== 'Lusa' && d.sebutan !== 'Kemarin' ? d.sebutan : HARI_PENDEK[t.hr];
        return (
          <Pressable
            key={d.h}
            role="radio"
            aria-checked={aktif}
            aria-disabled={mati || undefined}
            disabled={mati}
            aria-label={`${nama} ${t.tg}, ${ket}${mati ? '' : ' kosong'}, ${HARI[t.hr]} ${t.tg} ${BULAN[t.bl]}`}
            onPress={() => ubah(d.h)}
            style={({ pressed }) => [st.hari, aktif && st.hariAktif, mati && st.hariMati, pressed && !aktif && { backgroundColor: W.kertasTua }]}
          >
            {mati ? <Pola jenis="belang" varian="terisi" lebarBelang={4} /> : null}
            <Text style={[st.hariNama, aktif && { color: W.krem }]}>{nama}</Text>
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

/** Grid jam mulai per kelompok waktu. sembunyikan = hanya tampilkan yang kosong; sambung = menit yang menyambung karcis lain. */
export function GridSlot({ data, pilih, ubah, durasiMenit, sembunyikan = false, sambung = null }) {
  const { slot, istirahat } = data;
  const grup = KELOMPOK.map((g) => ({ ...g, semua: slot.filter((s) => s.menit >= g.dari && s.menit < g.sampai) })).filter((g) => g.semua.length);
  return (
    <View style={{ gap: 14 }}>
      {grup.map((g, gi) => {
        const istirahatSebelum = istirahat && gi > 0 && istirahat[0] >= grup[gi - 1].semua[0].menit && istirahat[1] <= g.semua[0].menit + 15;
        const kosong = g.semua.filter((s) => s.status === 'kosong');
        const tampil = sembunyikan ? kosong : g.semua;
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
              <View style={st.grupIkon}>
                <Ikon nama={g.id} ukuran={18} warna={W.hijau} />
              </View>
              <Text role="heading" aria-level={3} style={st.grupNama}>
                {g.nama}
              </Text>
              <T kecil lembut style={{ marginLeft: 'auto' }}>
                {kosong.length ? `${kosong.length} kosong` : 'semua terisi'}
                {sembunyikan && g.semua.length > kosong.length ? ` · ${g.semua.length - kosong.length} terisi disembunyikan` : ''}
              </T>
            </View>
            {tampil.length ? (
              <View style={st.grid}>
                {tampil.map((s) => {
                  const aktif = s.menit === pilih;
                  const terisi = s.status !== 'kosong';
                  const sbg = sambung === s.menit && !terisi;
                  return (
                    <Pressable
                      key={s.menit}
                      role="radio"
                      aria-checked={aktif}
                      aria-disabled={terisi || undefined}
                      disabled={terisi}
                      aria-label={`${jam(s.menit)} sampai ${jam(s.menit + durasiMenit)}, ${terisi ? 'sudah terisi' : sbg ? 'kosong, menyambung karcis sebelumnya' : 'kosong'}`}
                      onPress={() => ubah(s.menit)}
                      style={({ pressed }) => [st.slot, terisi && st.slotIsi, sbg && st.slotSambung, aktif && st.slotAktif, pressed && !aktif && !terisi && { backgroundColor: W.mint }]}
                    >
                      {terisi ? <Pola jenis="belang" varian="terisi" lebarBelang={4} /> : null}
                      <Text style={[st.slotTeks, angkaTabel, terisi && st.slotTeksIsi, aktif && { color: W.krem }]}>{jam(s.menit)}</Text>
                      {aktif ? (
                        <View style={st.centang} aria-hidden>
                          <Ikon nama="centang" ukuran={12} warna={W.krem} tebal={3.2} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <T kecil lembut>Semua jam di kelompok ini sudah terisi.</T>
            )}
          </View>
        );
      })}
    </View>
  );
}

/** Kartu cap: tiap kunjungan selesai = satu cap bertanggal. */
export function KartuCap({ jumlah, tanggalCap = [] }) {
  const n = Math.max(0, jumlah);
  const penuh = n >= CAP_PENUH;
  return (
    <View style={{ gap: 10 }}>
      <View style={st.capBaris} role="list" aria-label={`${Math.min(n, CAP_PENUH)} dari ${CAP_PENUH} cap terkumpul`}>
        {Array.from({ length: CAP_PENUH }).map((_, i) => {
          const isi = i < n;
          const tgl = tanggalCap[i];
          return (
            <View key={i} role="listitem" style={st.capSel} aria-label={isi ? `Cap ${i + 1}${tgl ? `, ${tanggal(tgl, { pendek: true, hari: false })}` : ''}` : `Cap ${i + 1} belum`}>
              <View style={[st.capBulat, isi ? st.capIsi : st.capKosong]}>
                {isi ? (
                  <>
                    <View style={st.capCincin} />
                    <Ikon nama="kursi" ukuran={18} warna={W.krem} />
                  </>
                ) : (
                  <Text style={st.capNo}>{i + 1}</Text>
                )}
              </View>
              <Text style={st.capTgl}>{isi && tgl ? tanggal(tgl, { pendek: true, hari: false }) : ' '}</Text>
            </View>
          );
        })}
      </View>
      <T kecil lembut>
        {penuh
          ? `Kartu penuh. Potongan ${rupiah(NILAI_HADIAH)} bisa dipakai saat konfirmasi booking dan tertulis di karcis.`
          : `${CAP_PENUH - n} kunjungan lagi untuk potongan ${rupiah(NILAI_HADIAH)}.`}
      </T>
    </View>
  );
}

/** Deret kursi putar di outlet saat ini (untuk layar antre). */
export function DeretKursi({ kursi, kamu = null }) {
  return (
    <View role="list" style={st.deret}>
      {kursi.map((x, i) => {
        const milikmu = kamu === x.kapster;
        const pakai = x.status === 'dipakai' || milikmu;
        const k = kapsterById[x.kapster];
        return (
          <View key={x.kapster} role="listitem" style={st.kursi} aria-label={`Kursi ${i + 1}, ${k.nama}, ${milikmu ? 'kursimu' : pakai ? `dipakai sampai ${jam(x.sampai)}` : 'kosong'}`}>
            <View style={[st.kursiIkon, pakai ? { backgroundColor: W.marun } : { backgroundColor: W.putih, borderColor: W.hijau }]}>
              {pakai ? <Pola jenis="kulit" varian="marun" ukuran={20} /> : null}
              <Ikon nama="kursi" ukuran={26} warna={pakai ? W.krem : W.hijau} />
            </View>
            <Text style={st.kursiNama} numberOfLines={1}>
              {k.nama.replace('Pak ', '')}
            </Text>
            <Text style={[st.kursiKet, !pakai && { color: W.hijau }, milikmu && { color: W.marun }]}>{milikmu ? 'kursimu' : pakai ? `s.d. ${jam(x.sampai)}` : 'kosong'}</Text>
          </View>
        );
      })}
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
  karcis: { backgroundColor: W.krem, borderRadius: R.besar, borderWidth: 1, borderColor: W.garisKarcis },
  karcisRingkas: {},
  karcisAtasBaris: { flexDirection: 'row', minHeight: 150 },
  sobek: { borderTopLeftRadius: R.besar, borderBottomLeftRadius: R.besar, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRightWidth: 2, borderRightColor: W.garisKarcis, borderStyle: 'dashed' },
  tanggalBlok: { backgroundColor: W.krem, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', minWidth: 54, borderWidth: 2, borderColor: '#D9A54E' },
  tanggalHari: { ...F.b, fontSize: 12, lineHeight: 16, color: W.hijau, letterSpacing: 0.4 },
  tanggalAngka: { ...F.display, fontSize: 28, lineHeight: 32, color: W.tinta },
  tanggalBulan: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tinta },
  lubang: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: W.kertas, borderWidth: 1, borderColor: W.garisKarcis },
  karcisBadan: { flex: 1, padding: 14, paddingLeft: 16, gap: 4, minWidth: 0 },
  karcisAtas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  karcisLabel: { ...F.b, fontSize: 12, lineHeight: 16, letterSpacing: 1, color: W.tintaLembut },
  status: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  statusTeks: { ...F.b, fontSize: 12, lineHeight: 16 },
  kode: { ...F.display, fontSize: 32, lineHeight: 38, color: W.marun, letterSpacing: 1 },
  karcisKapster: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  putus: { borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#CDB894', marginVertical: 8 },
  karcisBawah: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  harga: { ...F.display, fontSize: 20, lineHeight: 26, color: W.tinta },
  potongan: { ...F.sb, fontSize: 13, color: W.hijau },
  perforasi: { height: 20, justifyContent: 'center' },
  lubangKiri: { left: -10, top: 0 },
  lubangKanan: { right: -10, top: 0 },
  putusDatar: { marginHorizontal: 16, borderTopWidth: 2, borderStyle: 'dashed', borderColor: '#CDB894' },
  stub: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  qrBingkai: { padding: 6, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: W.garisKarcis },
  kodeBesar: { ...F.display, fontSize: 36, lineHeight: 42, color: W.tinta, letterSpacing: 2 },
  cap: { position: 'absolute', right: 14, top: 44, borderWidth: 2.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: '-9deg' }], backgroundColor: 'rgba(255,246,230,0.88)' },
  capCetak: { position: 'absolute', right: 12, bottom: 10, borderWidth: 2.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderColor: '#B8853A', backgroundColor: 'rgba(241,224,188,0.94)' },
  capTeks: { ...F.xb, fontSize: 16, lineHeight: 20, letterSpacing: 1.5 },
  langkahBaris: { flexDirection: 'row', gap: 6 },
  langkahRuas: { flex: 1, height: 8, borderRadius: 4, backgroundColor: W.kertasTua, overflow: 'hidden' },
  langkahIsi: { backgroundColor: W.marun },
  strip: { gap: 8, paddingVertical: 2, paddingRight: 16 },
  hari: { width: 68, minHeight: 86, borderRadius: 16, borderWidth: 1.5, borderColor: W.garis, backgroundColor: W.putih, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, overflow: 'hidden' },
  hariAktif: { backgroundColor: W.marun, borderColor: W.marun },
  hariMati: { backgroundColor: W.kertasTua, borderColor: W.kertasTua },
  hariNama: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tintaLembut },
  hariAngka: { ...F.display, fontSize: 24, lineHeight: 30, color: W.tinta },
  hariKet: { ...F.b, fontSize: 12, lineHeight: 16, color: W.hijau },
  istirahat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: W.kertasTua, alignSelf: 'flex-start' },
  grupKepala: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grupIkon: { width: 30, height: 30, borderRadius: 15, backgroundColor: W.mint, alignItems: 'center', justifyContent: 'center' },
  grupNama: { ...F.b, fontSize: 16, lineHeight: 22, color: W.tinta },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { width: '23%', flexGrow: 1, maxWidth: '25%', minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: W.hijau, backgroundColor: W.putih, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  slotIsi: { borderColor: W.kertasTua, backgroundColor: W.kertasTua, overflow: 'hidden' },
  slotSambung: { borderWidth: 2.5, backgroundColor: W.mint },
  slotAktif: { backgroundColor: W.marun, borderColor: W.marun },
  slotTeks: { ...F.b, fontSize: 16, lineHeight: 20, color: W.tinta },
  slotTeksIsi: { color: W.tintaLembut, textDecorationLine: 'line-through' },
  centang: { position: 'absolute', top: -7, right: -7, width: 22, height: 22, borderRadius: 11, backgroundColor: '#B8853A', borderWidth: 2, borderColor: W.putih, alignItems: 'center', justifyContent: 'center' },
  capBaris: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  capSel: { alignItems: 'center', gap: 2, width: 46 },
  capBulat: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  capIsi: { backgroundColor: W.marun, transform: [{ rotate: '-8deg' }] },
  capCincin: { position: 'absolute', top: 3, left: 3, right: 3, bottom: 3, borderRadius: 18, borderWidth: 1.5, borderColor: W.krem, borderStyle: 'dashed', opacity: 0.8 },
  capKosong: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTegas },
  capNo: { ...F.b, fontSize: 13, lineHeight: 16, color: W.tintaLembut },
  capTgl: { ...F.sb, fontSize: 12, lineHeight: 15, color: W.tintaLembut },
  deret: { flexDirection: 'row', gap: 6 },
  kursi: { flex: 1, alignItems: 'center', gap: 3 },
  kursiIkon: { width: '100%', height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: W.marun },
  kursiNama: { ...F.b, fontSize: 12, lineHeight: 16, color: W.tinta },
  kursiKet: { ...F.sb, fontSize: 12, lineHeight: 15, color: W.tintaLembut },
});
