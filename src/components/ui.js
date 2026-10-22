import { useState } from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { W, F, R, SENTUH } from '../lib/tema';
import Ikon from './Ikon';

/**
 * Tautan internal berbentuk area tekan. `Link asChild` membuang style berbentuk fungsi,
 * dan menggabungkan array style menjadi objek berindeks; jadi keadaan tekan dikelola di sini
 * dan style dikirim sebagai satu objek datar.
 * gaya: ({ pressed }) => style; children boleh fungsi ({ pressed }) => node.
 */
export function Taut({ href, replace, gaya, style, children, ...p }) {
  const [tekan, setTekan] = useState(false);
  const keadaan = { pressed: tekan };
  return (
    <Link href={href} replace={replace} asChild>
      <Pressable {...p} onPressIn={() => setTekan(true)} onPressOut={() => setTekan(false)} style={StyleSheet.flatten(gaya ? gaya(keadaan) : style)}>
        {typeof children === 'function' ? children(keadaan) : children}
      </Pressable>
    </Link>
  );
}

export function T({ style, kecil, lembut, tebal, children, ...p }) {
  return (
    <Text
      style={[s.t, kecil && s.tKecil, lembut && { color: W.tintaLembut }, tebal && F.b, style]}
      {...p}
    >
      {children}
    </Text>
  );
}

export function Judul({ level = 1, style, children, ...p }) {
  return (
    <Text role="heading" aria-level={level} style={[s.judul, level > 1 && s.judul2, level > 2 && s.judul3, style]} {...p}>
      {children}
    </Text>
  );
}

/** Label kecil di atas judul bagian. */
export function Label({ children, style, warna = W.hijau }) {
  return <Text style={[s.label, { color: warna }, style]}>{children}</Text>;
}

const VARIAN = {
  utama: { bg: W.marun, fg: W.krem, bgTekan: W.marunTua, garis: W.marun },
  hijau: { bg: W.hijau, fg: W.krem, bgTekan: W.hijauTua, garis: W.hijau },
  garis: { bg: 'transparent', fg: W.marun, bgTekan: W.marunMuda, garis: W.marun },
  lembut: { bg: W.putih, fg: W.tinta, bgTekan: W.kertasTua, garis: W.garis },
  teks: { bg: 'transparent', fg: W.marun, bgTekan: W.marunMuda, garis: 'transparent' },
};

export function Tombol({ label, onPress, href, varian = 'utama', ikon, ikonKanan, kecil, disabled, aksesLabel, penuh, style, replace }) {
  const v = VARIAN[varian];
  const isi = (tekan) => [
    s.tombol,
    kecil && s.tombolKecil,
    penuh && { alignSelf: 'stretch' },
    { backgroundColor: tekan ? v.bgTekan : v.bg, borderColor: v.garis },
    disabled && s.mati,
    style,
  ];
  const dalam = (
    <>
      {ikon ? <Ikon nama={ikon} ukuran={kecil ? 18 : 20} warna={v.fg} /> : null}
      <Text style={[s.tombolTeks, kecil && s.tombolTeksKecil, { color: v.fg }]}>{label}</Text>
      {ikonKanan ? <Ikon nama={ikonKanan} ukuran={kecil ? 18 : 20} warna={v.fg} /> : null}
    </>
  );
  if (href && !disabled) {
    return (
      <Taut href={href} replace={replace} aria-label={aksesLabel} gaya={({ pressed }) => isi(pressed)}>
          {dalam}
        </Taut>
    );
  }
  return (
    <Pressable role="button" aria-label={aksesLabel} onPress={onPress} disabled={disabled} aria-disabled={disabled || undefined} style={({ pressed }) => isi(pressed)}>
      {dalam}
    </Pressable>
  );
}

/** Tombol ikon bulat (≥44px). Wajib punya label aksesibel. */
export function TombolIkon({ ikon, label, onPress, href, warna = W.tinta, latar = W.putih, garis = W.garis, ukuran = SENTUH, isi, badge, style }) {
  const gaya = ({ pressed }) => [s.ikonBulat, { width: ukuran, height: ukuran, backgroundColor: pressed ? W.kertasTua : latar, borderColor: garis }, style];
  const dalam = (
    <>
      <Ikon nama={ikon} warna={warna} isi={isi} />
      {badge ? (
        <View style={s.badge}>
          <Text style={s.badgeTeks}>{badge}</Text>
        </View>
      ) : null}
    </>
  );
  if (href) {
    return (
      <Taut href={href} aria-label={label} gaya={gaya}>
          {dalam}
        </Taut>
    );
  }
  return (
    <Pressable role="button" aria-label={label} onPress={onPress} style={gaya}>
      {dalam}
    </Pressable>
  );
}

export function Kartu({ children, style, onPress, href, aksesLabel, role }) {
  if (href) {
    return (
      <Taut href={href} aria-label={aksesLabel} gaya={({ pressed }) => [s.kartu, pressed && s.kartuTekan, style]}>
          {children}
        </Taut>
    );
  }
  if (onPress) {
    return (
      <Pressable role={role || 'button'} aria-label={aksesLabel} onPress={onPress} style={({ pressed }) => [s.kartu, pressed && s.kartuTekan, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.kartu, style]}>{children}</View>;
}

export function Saklar({ nilai, ubah, label, ket, disabled }) {
  return (
    <Pressable
      role="switch"
      aria-checked={nilai}
      aria-label={label}
      disabled={disabled}
      onPress={() => ubah(!nilai)}
      style={({ pressed }) => [s.saklarBaris, pressed && { backgroundColor: W.kertasTua }, disabled && s.mati]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[s.t, F.sb]}>{label}</Text>
        {ket ? <Text style={[s.t, s.tKecil, { color: W.tintaLembut }]}>{ket}</Text> : null}
      </View>
      <View style={[s.saklar, nilai && s.saklarNyala]}>
        <View style={[s.kenop, nilai && s.kenopNyala]} />
      </View>
    </Pressable>
  );
}

/** Pilihan tab di dalam layar (ARIA tablist). */
export function Segmen({ pilihan, nilai, ubah, label }) {
  return (
    <View role="tablist" aria-label={label} style={s.segmen}>
      {pilihan.map((p) => {
        const aktif = p.id === nilai;
        return (
          <Pressable
            key={p.id}
            role="tab"
            aria-selected={aktif}
            onPress={() => ubah(p.id)}
            style={({ pressed }) => [s.segmenItem, aktif && s.segmenAktif, pressed && !aktif && { backgroundColor: W.kertasTua }]}
          >
            <Text style={[s.segmenTeks, aktif && { color: W.krem }]} numberOfLines={1}>
              {p.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Lencana({ children, warna = W.hijau, latar = W.mint, style }) {
  return (
    <View style={[s.lencana, { backgroundColor: latar }, style]}>
      <Text style={[s.lencanaTeks, { color: warna }]}>{children}</Text>
    </View>
  );
}

/** Kotak pengganti selama data perangkat belum dimuat (menjaga tinggi supaya tanpa CLS). */
export function Kerangka({ tinggi = 80, style }) {
  return <View aria-hidden style={[{ height: tinggi, borderRadius: R.sedang, backgroundColor: W.kertasTua }, style]} />;
}

export function Garis({ style }) {
  return <View style={[{ height: 1, backgroundColor: W.garis }, style]} />;
}

export function Baris({ children, style, jarak = 8 }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: jarak }, style]}>{children}</View>;
}

export const s = StyleSheet.create({
  t: { ...F.r, color: W.tinta, fontSize: 15, lineHeight: 22 },
  tKecil: { fontSize: 13, lineHeight: 19 },
  judul: { ...F.display, color: W.tinta, fontSize: 30, lineHeight: 36, letterSpacing: -0.3 },
  judul2: { fontSize: 22, lineHeight: 28, letterSpacing: -0.1 },
  judul3: { fontSize: 18, lineHeight: 24 },
  label: { ...F.b, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' },
  tombol: {
    minHeight: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tombolKecil: { minHeight: 40, paddingHorizontal: 14, borderRadius: 12 },
  tombolTeks: { ...F.b, fontSize: 16, lineHeight: 20 },
  tombolTeksKecil: { fontSize: 14, lineHeight: 18 },
  mati: { opacity: 0.5 },
  ikonBulat: { borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: W.marun,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: W.kertas,
  },
  badgeTeks: { ...F.b, fontSize: 11, lineHeight: 14, color: W.krem },
  kartu: { backgroundColor: W.putih, borderRadius: R.besar, borderWidth: 1, borderColor: W.garis, padding: 16 },
  kartuTekan: { backgroundColor: W.kertasTua },
  saklarBaris: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, minHeight: SENTUH },
  saklar: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#CDBFA9', padding: 3, justifyContent: 'center' },
  saklarNyala: { backgroundColor: W.hijau },
  kenop: { width: 24, height: 24, borderRadius: 12, backgroundColor: W.putih },
  kenopNyala: { transform: [{ translateX: 20 }] },
  segmen: { flexDirection: 'row', backgroundColor: W.putih, borderRadius: 14, borderWidth: 1, borderColor: W.garis, padding: 4, gap: 4 },
  segmenItem: { flex: 1, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  segmenAktif: { backgroundColor: W.hijau },
  segmenTeks: { ...F.b, fontSize: 14, lineHeight: 18, color: W.tinta },
  lencana: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  lencanaTeks: { ...F.b, fontSize: 12, lineHeight: 16 },
});
