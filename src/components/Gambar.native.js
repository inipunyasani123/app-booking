import { Image } from 'react-native';
import SUMBER from '../lib/gambar-sumber';

export default function Gambar({ nama, lebar, tinggi, alt = '', bulat = 0, style }) {
  return (
    <Image
      source={SUMBER[nama]}
      style={[{ width: lebar, height: tinggi, borderRadius: bulat }, style]}
      resizeMode="cover"
      accessible={!!alt}
      accessibilityLabel={alt || undefined}
      accessibilityIgnoresInvertColors
    />
  );
}
