import { layananById, kapsterById, OUTLET } from './data';

const dua = (n) => String(n).padStart(2, '0');
export const waktuUtc = (ms) => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${dua(d.getUTCMonth() + 1)}${dua(d.getUTCDate())}T${dua(d.getUTCHours())}${dua(d.getUTCMinutes())}00Z`;
};
const kode = (k) => `${k.slice(0, 2)}-${k.slice(2)}`;

export function teksAcara(b) {
  return {
    judul: `${layananById[b.layanan].nama} dengan ${kapsterById[b.kapster].nama} · Kursi Putar`,
    lokasi: `${OUTLET.alamat} (alamat rekaan, demo PintuWeb)`,
    ket: `Karcis ${kode(b.kode)} atas nama ${b.nama}. Datang 10 menit lebih awal, bayar di kasir.`,
  };
}

export const namaBerkasIcs = (b) => `kursi-putar-${b.kode.toLowerCase()}.ics`;

export function isiIcs(b) {
  const { judul, lokasi, ket } = teksAcara(b);
  const esc = (t) => t.replace(/([,;\\])/g, '\\$1');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PintuWeb//Kursi Putar demo//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${b.kode}@app-booking.pintuweb.id`, `DTSTAMP:${waktuUtc(Date.now())}`,
    `DTSTART:${waktuUtc(b.mulai)}`, `DTEND:${waktuUtc(b.mulai + b.durasi * 60000)}`,
    `SUMMARY:${esc(judul)}`, `LOCATION:${esc(lokasi)}`, `DESCRIPTION:${esc(ket)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(judul)}`, 'TRIGGER:-PT2H', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}
