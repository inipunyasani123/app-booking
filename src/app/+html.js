import { useServerDocumentContext } from 'expo-router/html';
import QRCode from 'qrcode';
import { tegelSvg, dataUri } from '../components/pola-data';
import { SITUS } from '../lib/data';

// Hanya berjalan di Node saat build (static rendering). Tidak ikut bundel klien.

function qrPath(teks) {
  const { modules } = QRCode.create(teks, { errorCorrectionLevel: 'M' });
  const n = modules.size;
  let d = '';
  for (let y = 0; y < n; y++) {
    let x = 0;
    while (x < n) {
      if (modules.get(x, y)) {
        const awal = x;
        while (x < n && modules.get(x, y)) x++;
        d += `M${awal + 4} ${y + 4}h${x - awal}v1h-${x - awal}z`;
      } else x++;
    }
  }
  return { d, ukuran: n + 8 };
}

const QR = qrPath(SITUS.url + '/');
const TEGEL_LATAR = dataUri(tegelSvg('krem', 120));

const JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Kursi Putar',
  alternateName: 'Demo aplikasi booking barbershop & salon',
  url: SITUS.url + '/',
  description:
    'Aplikasi demo booking pangkas rambut dan salon untuk usaha rekaan: daftar layanan, pilih kapster, slot jam kosong (WIB), karcis berkode, ubah atau batalkan jadwal, pengingat simulasi, riwayat, dan kartu cap.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Android, iOS, Web',
  inLanguage: 'id',
  isAccessibleForFree: true,
  image: SITUS.url + '/og.jpg',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
  creator: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
};

const CSS = `
@font-face{font-family:Jakarta;src:url(/fonts/jakarta-latin.woff2) format("woff2");font-weight:200 800;font-style:normal;font-display:swap}
@font-face{font-family:Gloock;src:url(/fonts/gloock-latin.woff2) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Jakarta Fallback";src:local("Arial"),local("Helvetica"),local("Roboto");size-adjust:104%;ascent-override:99%;descent-override:21%;line-gap-override:0%}
@font-face{font-family:"Gloock Fallback";src:local("Georgia"),local("Times New Roman"),local("Noto Serif");size-adjust:100%;ascent-override:96%;descent-override:22%;line-gap-override:0%}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;background:#F4EEE3;height:100%}
body{margin:0;min-height:100%;background:#F4EEE3;color:#241A1B;font-family:Jakarta,"Jakarta Fallback",system-ui,sans-serif;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
#root{display:flex;flex-direction:column;width:100%;height:100vh;height:100dvh;overflow:hidden;position:relative}
.samping,.status-palsu,.tombol-palsu{display:none}
:focus-visible{outline:3px solid #1E5442!important;outline-offset:2px}
body>aside a:focus-visible{outline-color:#FFF6E6!important}
#root [role="radio"]:focus-visible,#root [role="tab"]:focus-visible,#root [role="switch"]:focus-visible,#root [role="checkbox"]:focus-visible{outline-offset:1px}
input,textarea{font:inherit}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
@media (min-width:768px){
  body{background:#ECE3D3 ${TEGEL_LATAR};background-size:120px 120px}
  .panggung{min-height:100vh;box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;column-gap:44px;padding:28px 28px 36px}
  .ponsel{grid-column:2;grid-row:1;position:relative;width:390px;padding:11px;border-radius:58px;background:linear-gradient(145deg,#3B2A2C,#1C1415);box-shadow:0 0 0 1px #0d0909,0 2px 0 1px #4a3638 inset,0 40px 80px -24px rgba(36,26,27,.55),0 18px 36px -18px rgba(36,26,27,.45)}
  .tombol-palsu{display:block;position:absolute;width:4px;border-radius:3px;background:#2b1f20}
  .layar{position:relative;display:flex;flex-direction:column;height:min(844px,calc(100vh - 86px));min-height:620px;border-radius:47px;overflow:hidden;background:#F4EEE3;isolation:isolate}
  .status-palsu{display:flex;flex:none;height:42px;padding:0 30px 0 34px;align-items:center;justify-content:space-between;font:600 15px/1 Jakarta,"Jakarta Fallback",system-ui,sans-serif;color:#241A1B;background:#F4EEE3}
  .pulau{width:104px;height:30px;border-radius:20px;background:#120d0e}
  #root{flex:1;height:auto;min-height:0}
  .samping{display:block;font-size:15px;line-height:1.55}
  .kiri{grid-column:1;grid-row:1;justify-self:end;max-width:350px}
  .kanan{grid-column:3;grid-row:1;justify-self:start;max-width:280px}
}
@media (min-width:768px) and (max-width:1139px){
  .panggung{grid-template-columns:auto minmax(0,330px);justify-content:center;align-content:center;row-gap:20px;column-gap:36px}
  .ponsel{grid-column:1;grid-row:1/span 2}
  .kiri{grid-column:2;grid-row:1;justify-self:start;align-self:end}
  .kanan{grid-column:2;grid-row:2;align-self:start}
  .fitur li:nth-child(n+4){display:none}
}
.label{margin:0 0 10px;font:700 12px/1.3 Jakarta,"Jakarta Fallback",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#1E5442}
.merek{margin:0;font:400 46px/1.02 Gloock,"Gloock Fallback",Georgia,serif;letter-spacing:-.01em;color:#5A1520}
.lead{margin:12px 0 18px;color:#241A1B}
.fitur{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.fitur li{display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start;padding:12px 14px;border-radius:18px;background:rgba(255,252,246,.88);border:1px solid #DCCFBC}
.fitur .no{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font:400 18px/1 Gloock,"Gloock Fallback",Georgia,serif;color:#FFF6E6;background:#7A1F2B}
.fitur b{display:block;font-weight:700;color:#241A1B}
.fitur span{display:block;font-size:14px;line-height:1.45;color:#5B4C48}
.catatan{margin:14px 0 0;font-size:13px;color:#5B4C48}
.qr-kartu{padding:18px;border-radius:24px;background:#FFFCF6;border:1px solid #DCCFBC;box-shadow:0 18px 40px -26px rgba(36,26,27,.5)}
.qr-kartu svg{display:block;width:100%;max-width:200px;height:auto;margin:0 auto 12px;border-radius:12px}
.qr-kartu p{margin:0;font-size:14px;line-height:1.45;color:#5B4C48}
.qr-kartu b{color:#241A1B}
.qr-url{margin-top:8px!important;font:700 13px/1.3 Jakarta,"Jakarta Fallback",system-ui,sans-serif!important;color:#1E5442!important;word-break:break-all}
.cta{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;min-height:52px;padding:0 18px;border-radius:14px;background:#7A1F2B;color:#FFF6E6;font:700 16px/1.2 Jakarta,"Jakarta Fallback",system-ui,sans-serif;text-decoration:none;box-shadow:0 10px 24px -14px rgba(90,21,32,.8)}
.cta:hover{background:#5A1520}
.teknis{margin:10px 2px 0;font-size:13px;color:#5B4C48}
`;

const FITUR = [
  ['Jam kosong yang jujur', 'Dihitung dari jam buka, istirahat, durasi layanan, dan kursi yang sudah terisi. Semua WIB.'],
  ['Pilih kapster atau siapa saja', 'Lihat keahlian, hari libur, dan jam paling cepat tiap kapster.'],
  ['Karcis, ubah, batal, ingatkan', 'Kode booking, geser jadwal sendiri, dan pengingat sebagai notifikasi simulasi.'],
  ['Riwayat & kartu cap', 'Pesan lagi sekali ketuk, layanan favorit, dan cap tiap kunjungan.'],
];

export default function Root({ children, pathname }) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  const beranda = !pathname || pathname === '/' || pathname === '';
  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F4EEE3" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Kursi Putar" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preload" href="/fonts/jakarta-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/gloock-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <style id="kerangka-web" dangerouslySetInnerHTML={{ __html: CSS }} />
        {headNodes}
        {beranda ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} /> : null}
      </head>
      <body {...bodyAttributes}>
        <div className="panggung">
          <aside className="samping kiri" aria-label="Tentang demo aplikasi ini">
            <p className="label">Demo aplikasi mobile · PintuWeb</p>
            <p className="merek">Kursi Putar</p>
            <p className="lead">Aplikasi booking untuk pangkas rambut &amp; salon. Satu kode untuk Android, iOS, dan web.</p>
            <ul className="fitur">
              {FITUR.map(([j, k], i) => (
                <li key={j}>
                  <span className="no" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>
                    <b>{j}</b>
                    <span>{k}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="catatan">Usaha, kapster, dan alamatnya rekaan. Data hanya tersimpan di peramban ini.</p>
          </aside>
          <div className="ponsel">
            <span className="tombol-palsu" aria-hidden="true" style={{ left: -3, top: 150, height: 34 }} />
            <span className="tombol-palsu" aria-hidden="true" style={{ left: -3, top: 200, height: 60 }} />
            <span className="tombol-palsu" aria-hidden="true" style={{ right: -3, top: 190, height: 88 }} />
            <div className="layar">
              <div className="status-palsu" aria-hidden="true">
                <span>09.41</span>
                <span className="pulau" />
                <svg width="66" height="14" viewBox="0 0 66 14" fill="#241A1B">
                  <rect x="0" y="8" width="3" height="5" rx="1" />
                  <rect x="5" y="6" width="3" height="7" rx="1" />
                  <rect x="10" y="3.5" width="3" height="9.5" rx="1" />
                  <rect x="15" y="1" width="3" height="12" rx="1" />
                  <path d="M30 4.6a9 9 0 0 1 12 0l-1.3 1.4a7 7 0 0 0-9.4 0zM32.6 7.4a5.3 5.3 0 0 1 6.8 0L36 11z" />
                  <rect x="46.5" y="1.5" width="17" height="11" rx="3" fill="none" stroke="#241A1B" strokeWidth="1.2" />
                  <rect x="48.5" y="3.5" width="11" height="7" rx="1.6" />
                  <rect x="64.5" y="5" width="1.5" height="4" rx=".7" />
                </svg>
              </div>
              {children}
            </div>
          </div>
          <aside className="samping kanan" aria-label="Buka di HP dan pesan aplikasi">
            <div className="qr-kartu">
              <svg viewBox={`0 0 ${QR.ukuran} ${QR.ukuran}`} role="img" aria-label={`Kode QR menuju ${SITUS.url.replace('https://', '')}`} shapeRendering="crispEdges">
                <rect width={QR.ukuran} height={QR.ukuran} fill="#FFFCF6" />
                <path d={QR.d} fill="#241A1B" />
              </svg>
              <p>
                <b>Buka di HP.</b> Pindai, coba booking sampai dapat karcis, lalu pasang ke layar utama.
              </p>
              <p className="qr-url">{SITUS.url.replace('https://', '')}</p>
            </div>
            <a className="cta" href={SITUS.kontak}>
              Pesan aplikasi seperti ini
            </a>
            <p className="teknis">Dibuat dengan React Native + Expo: satu kode untuk Android, iOS, dan web.</p>
          </aside>
        </div>
        <aside
          aria-label="Tentang situs demo ini"
          style={{ display: 'block', margin: 0, padding: '12px 16px', background: '#0f1b33', color: '#dfe6f3', font: '400 13px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', textAlign: 'center' }}
        >
          Situs demo buatan PintuWeb — nama dan isinya rekaan.{' '}
          <a href={SITUS.kontak} style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Buat yang seperti ini →
          </a>
        </aside>
        {bodyNodes}
      </body>
    </html>
  );
}
