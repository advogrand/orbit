import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

export function useLenis(disabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (disabled) {
      return;
    }

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.1,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [disabled]);

  return lenisRef;
}
