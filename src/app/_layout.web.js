import { Slot } from 'expo-router';
import Akar from '../components/Akar';

// Web: tanpa navigator tumpukan; riwayat peramban menangani tombol kembali.
export default function TataLetakAkar() {
  return (
    <Akar>
      <Slot />
    </Akar>
  );
}
