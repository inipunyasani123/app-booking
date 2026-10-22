import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTepi() {
  const i = useSafeAreaInsets();
  return { atas: (tambah = 0) => i.top + tambah, bawah: (tambah = 0) => i.bottom + tambah };
}
