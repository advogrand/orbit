import { RefObject, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { FALLBACK_DURATION, progressToTime } from '../lib/videoTimeline';

type UseVideoScrubOptions = {
  wrapperRef: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  lenisRef: RefObject<Lenis | null>;
  disabled: boolean;
  touchOptimized: boolean;
  onProgressChange: (progress: number) => void;
};

export function useVideoScrub({
  wrapperRef,
  videoRef,
  lenisRef,
  disabled,
  touchOptimized,
  onProgressChange,
}: UseVideoScrubOptions) {
  const currentTimeRef = useRef(0);
  const lastSeekRef = useRef(0);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (disabled) {
      return;
    }

    let frameId = 0;

    const tick = (time: number) => {
      lenisRef.current?.raf(time);

      const wrapper = wrapperRef.current;
      const video = videoRef.current;

      if (wrapper && video) {
        const rect = wrapper.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const rawProgress = scrollable > 0 ? -rect.top / scrollable : 0;
        const nextProgress = Math.min(1, Math.max(0, rawProgress));
        const rounded = Math.round(nextProgress * 1000) / 1000;

        if (rounded !== progressRef.current) {
          progressRef.current = rounded;
          setProgress(rounded);
          onProgressChange(rounded);
        }

        const duration =
          Number.isFinite(video.duration) && video.duration > 0
            ? video.duration
            : FALLBACK_DURATION;

        if (nextProgress === 0) {
          if (video.currentTime !== 0 && !video.seeking) {
            video.currentTime = 0;
          }
          currentTimeRef.current = 0;
        } else {
          const target = progressToTime(nextProgress, duration);
          const current = currentTimeRef.current;
          const now = window.performance.now();

          if (touchOptimized) {
            const canSeek = now - lastSeekRef.current > 95 && !video.seeking;

            if (canSeek && Math.abs(target - current) > 0.08) {
              lastSeekRef.current = now;
              currentTimeRef.current = target;
              video.currentTime = target;
            }
          } else {
            const next = current + (target - current) * 0.1;

            if (Math.abs(target - current) > 0.0005) {
              currentTimeRef.current = next;
              video.currentTime = next;
            } else if (current !== target) {
              currentTimeRef.current = target;
              video.currentTime = target;
            }
          }
        }
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [
    disabled,
    lenisRef,
    onProgressChange,
    touchOptimized,
    videoRef,
    wrapperRef,
  ]);

  return progress;
}
