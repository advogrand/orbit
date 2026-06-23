import type { CSSProperties } from 'react';

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function reveal(
  localProgress: number,
  start: number,
  span = 0.18,
  dy = 24,
  blur = 8,
): CSSProperties {
  const eased = easeOut(clamp01((localProgress - start) / span));
  const offset = (1 - eased) * dy;

  return {
    opacity: eased,
    transform: `translate3d(0, ${offset}px, 0)`,
    filter: `blur(${(1 - eased) * blur}px)`,
  };
}

export function fadeOut(
  progress: number,
  start: number,
  end: number,
  dy = -32,
  blur = 8,
): CSSProperties {
  const local = clamp01((progress - start) / (end - start));

  return {
    opacity: 1 - local,
    transform: `translate3d(0, ${local * dy}px, 0)`,
    filter: `blur(${local * blur}px)`,
  };
}
