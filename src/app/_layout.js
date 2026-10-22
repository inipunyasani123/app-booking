import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Akar from '../components/Akar';
import { useHuruf } from '../lib/fonts';
import { W } from '../lib/tema';

// Native: tumpukan layar dengan gestur kembali. Web memakai _layout.web.js (lebih ringan).
export default function TataLetakAkar() {
  const siap = useHuruf();
  if (!siap) return null;
  return (
    <Akar>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: W.kertas }, animation: 'slide_from_right' }} />
    </Akar>
  );
}
