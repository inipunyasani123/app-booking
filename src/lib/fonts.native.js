import { useFonts } from 'expo-font';

export function useHuruf() {
  const [siap] = useFonts({
    Gloock: require('@expo-google-fonts/gloock/400Regular/Gloock_400Regular.ttf'),
    'Jakarta-400': require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'),
    'Jakarta-500': require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf'),
    'Jakarta-600': require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'),
    'Jakarta-700': require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'),
    'Jakarta-800': require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf'),
  });
  return siap;
}
