import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet, AppState, Platform, Text } from 'react-native';
import { router, usePathname } from 'expo-router';
import { halamanUntuk } from '../lib/seo';
import { W, F } from '../lib/tema';
import { useTepi } from '../lib/tepi';
import { muat, periksa, useToko, tutupBanner, bacaNotif } from '../lib/store';
import { Judul, T, Tombol, TombolIkon } from './ui';
import Ikon from './Ikon';
import Pola from './Pola';

const WEB = Platform.OS === 'web';
const LembarCtx = createContext({ buka: () => {}, tutup: () => {} });
export const useLembar = () => useContext(LembarCtx);

/** Penyedia global: memuat data perangkat, detak waktu WIB, lembar bawah, dan spanduk notifikasi. */
export default function Akar({ children }) {
  const [lembar, setLembar] = useState(null);
  const asal = useRef(null);
  const jalur = usePathname();

  // Navigasi di sisi klien: judul tab ikut berganti (HTML statis sudah benar sejak awal).
  useEffect(() => {
    if (WEB) document.title = halamanUntuk(jalur).judul;
  }, [jalur]);

  useEffect(() => {
    muat();
    const id = setInterval(() => periksa(), 15000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && periksa());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  const buka = useCallback((isi, opsi = {}) => {
    if (WEB) asal.current = document.activeElement;
    setLembar({ isi, ...opsi });
  }, []);
  const tutup = useCallback(() => {
    setLembar(null);
    if (WEB && asal.current && asal.current.focus) setTimeout(() => asal.current && asal.current.focus(), 0);
  }, []);
  const nilai = useMemo(() => ({ buka, tutup }), [buka, tutup]);

  return (
    <LembarCtx.Provider value={nilai}>
      <View style={st.akar}>
        <View style={st.akar} aria-hidden={lembar ? true : undefined}>
          {children}
        </View>
        {lembar ? <Lembar data={lembar} tutup={tutup} /> : null}
        <Spanduk />
      </View>
    </LembarCtx.Provider>
  );
}

function Lembar({ data, tutup }) {
  const tepi = useTepi();
  const ref = useRef(null);
  useEffect(() => {
    if (!WEB) return;
    const el = ref.current;
    const fokusPertama = () => {
      const f = el && el.querySelector('[data-fokus-awal], button, [role="button"], [role="switch"], [role="radio"], a, input, textarea');
      (f || el)?.focus?.();
    };
    const t = setTimeout(fokusPertama, 30);
    const kunci = (e) => {
      if (e.key === 'Escape') tutup();
      if (e.key === 'Tab' && el) {
        const semua = [...el.querySelectorAll('[tabindex="0"], button, a[href], input, textarea')];
        if (!semua.length) return;
        const awal = semua[0];
        const akhir = semua[semua.length - 1];
        if (e.shiftKey && document.activeElement === awal) {
          e.preventDefault();
          akhir.focus();
        } else if (!e.shiftKey && document.activeElement === akhir) {
          e.preventDefault();
          awal.focus();
        } else if (!el.contains(document.activeElement)) {
          e.preventDefault();
          awal.focus();
        }
      }
    };
    document.addEventListener('keydown', kunci);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', kunci);
    };
  }, [tutup]);

  return (
    <View style={st.latarLembar}>
      <Pressable aria-hidden accessible={false} focusable={false} style={StyleSheet.absoluteFill} onPress={tutup} tabIndex={-1} />
      <View ref={ref} role="dialog" aria-modal="true" aria-label={data.judul} tabIndex={-1} style={[st.lembar, { paddingBottom: tepi.bawah(16) }]}>
        <View style={st.pegangan} />
        <View style={st.lembarKepala}>
          <Judul level={2} style={{ flex: 1 }}>
            {data.judul}
          </Judul>
          <TombolIkon ikon="silang" label="Tutup" onPress={tutup} />
        </View>
        <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>
          {data.isi(tutup)}
        </ScrollView>
      </View>
    </View>
  );
}

/** Spanduk notifikasi dalam aplikasi: simulasi push untuk pengingat jadwal. */
function Spanduk() {
  const b = useToko((s) => s.banner);
  const tepi = useTepi();
  useEffect(() => {
    if (!b) return;
    const id = setTimeout(tutupBanner, 9000);
    return () => clearTimeout(id);
  }, [b]);
  return (
    <View aria-live="polite" style={[st.spandukWadah, { top: tepi.atas(8) }]} pointerEvents="box-none">
      {b ? (
        <View style={st.spanduk}>
          <View style={st.spandukIkon}>
            <Pola jenis="kulit" varian="marun" ukuran={20} />
            <Ikon nama="lonceng" ukuran={20} warna={W.krem} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={st.spandukApp}>KURSI PUTAR · SEKARANG</Text>
            <Text style={st.spandukJudul}>{b.judul}</Text>
            <Text style={st.spandukIsi} numberOfLines={3}>
              {b.isi}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              {b.kode || b.tautan ? (
                <Tombol
                  kecil
                  varian="hijau"
                  label={b.tautan ? 'Lihat antre' : 'Lihat karcis'}
                  onPress={() => {
                    bacaNotif(b.id);
                    tutupBanner();
                    router.push(b.tautan || { pathname: '/karcis', params: { kode: b.kode } });
                  }}
                />
              ) : null}
              <Tombol kecil varian="lembut" label="Tutup" onPress={tutupBanner} />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  akar: { flex: 1, minHeight: 0, backgroundColor: W.kertas },
  latarLembar: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(36,26,27,0.5)', justifyContent: 'flex-end', zIndex: 20 },
  lembar: {
    backgroundColor: W.kertas,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 8,
    maxHeight: '88%',
    gap: 10,
  },
  pegangan: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: W.garisTegas, marginBottom: 4 },
  lembarKepala: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spandukWadah: { position: 'absolute', left: 10, right: 10, zIndex: 30 },
  spanduk: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    backgroundColor: W.putih,
    borderWidth: 1,
    borderColor: W.garis,
    shadowColor: '#241A1B',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  spandukIkon: { width: 40, height: 40, borderRadius: 12, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: W.marun },
  spandukApp: { ...F.b, fontSize: 12, lineHeight: 15, letterSpacing: 0.6, color: W.tintaLembut },
  spandukJudul: { ...F.b, fontSize: 15, lineHeight: 20, color: W.tinta },
  spandukIsi: { ...F.r, fontSize: 14, lineHeight: 20, color: W.tinta },
});
