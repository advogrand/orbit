import { useEffect, useState } from 'react';

export function useTouchOptimized() {
  const [touchOptimized, setTouchOptimized] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(
      '(hover: none), (pointer: coarse), (max-width: 900px)',
    ).matches;
  });

  useEffect(() => {
    const query = window.matchMedia(
      '(hover: none), (pointer: coarse), (max-width: 900px)',
    );
    const update = () => setTouchOptimized(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return touchOptimized;
}
