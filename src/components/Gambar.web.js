/** Gambar statis dari public/img. Di web langsung <img> supaya tampil sebelum JavaScript berjalan. */
// Foto & peta punya varian 480w (scripts/gambar.mjs); avatar kapster cukup satu ukuran.
const BERVARIAN = ['outlet.webp', 'alat.webp', 'salon.webp', 'tambahan.webp', 'peta.webp'];

export default function Gambar({ nama, lebar, tinggi, alt = '', bulat = 0, prioritas = false, style }) {
  const varian = BERVARIAN.includes(nama);
  return (
    <img
      src={`/img/${nama}`}
      srcSet={varian ? `/img/${nama.replace('.webp', '-480.webp')} 480w, /img/${nama} 780w` : undefined}
      sizes={varian ? '(min-width: 768px) 358px, calc(100vw - 32px)' : undefined}
      width={typeof lebar === 'number' ? lebar : undefined}
      height={tinggi}
      alt={alt}
      aria-hidden={alt ? undefined : 'true'}
      loading={prioritas ? 'eager' : 'lazy'}
      fetchPriority={prioritas ? 'high' : undefined}
      decoding="async"
      style={{ display: 'block', width: lebar, height: tinggi, maxWidth: '100%', objectFit: 'cover', borderRadius: bulat, flexShrink: 0, ...style }}
    />
  );
}
