import { useEffect, useState } from 'react';

export function useTouchOptimized() {
  const [touchOptimized, setTouchOptimized] = useState(false);

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
