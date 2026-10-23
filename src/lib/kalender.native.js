import { Linking } from 'react-native';
import { teksAcara, waktuUtc } from './kalender-isi';

/** Native: buka formulir acara Google Kalender (tanpa izin kalender perangkat). */
export function tambahKeKalender(b) {
  const { judul, lokasi, ket } = teksAcara(b);
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(judul)}&dates=${waktuUtc(b.mulai)}/${waktuUtc(b.mulai + b.durasi * 60000)}&location=${encodeURIComponent(lokasi)}&details=${encodeURIComponent(ket)}`;
  Linking.openURL(url).catch(() => {});
}
