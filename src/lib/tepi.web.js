// Jarak aman (notch / bilah gestur). Di web memakai env() supaya HTML statis dan hidrasi sama persis.
export function useTepi() {
  return {
    atas: (tambah = 0) => `calc(env(safe-area-inset-top, 0px) + ${tambah}px)`,
    bawah: (tambah = 0) => `calc(env(safe-area-inset-bottom, 0px) + ${tambah}px)`,
  };
}
