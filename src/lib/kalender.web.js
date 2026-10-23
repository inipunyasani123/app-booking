import { isiIcs, namaBerkasIcs } from './kalender-isi';

/** Web: unduh berkas .ics (bisa dibuka Kalender iOS/macOS, Google Kalender, Outlook). */
export function tambahKeKalender(b) {
  const blob = new Blob([isiIcs(b)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaBerkasIcs(b);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
