export const CLIP_1_END = 5;
export const CLIP_2_END = 10;
export const FALLBACK_DURATION = 15.21;

function safeEnd(duration: number) {
  return Math.max(CLIP_2_END, duration - 0.4);
}

export function progressToTime(progress: number, duration: number) {
  if (progress <= 0.12) {
    return 0;
  }

  if (progress < 0.34) {
    const local = (progress - 0.12) / 0.22;
    return local * CLIP_1_END;
  }

  if (progress < 0.42) {
    return CLIP_1_END;
  }

  if (progress < 0.62) {
    const local = (progress - 0.42) / 0.2;
    return CLIP_1_END + local * (CLIP_2_END - CLIP_1_END);
  }

  if (progress < 0.66) {
    return CLIP_2_END;
  }

  if (progress < 0.88) {
    const local = (progress - 0.66) / 0.22;
    const end = safeEnd(duration);
    return CLIP_2_END + local * (end - CLIP_2_END);
  }

  return safeEnd(duration);
}
