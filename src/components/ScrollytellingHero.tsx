import { type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, ChevronDown } from 'lucide-react';
import HeroDay from './HeroDay';
import HeroDusk from './HeroDusk';
import HeroFinal from './HeroFinal';
import VideoLoader from './VideoLoader';
import { asset } from '../lib/assets';
import { useLenis } from '../hooks/useLenis';
import { useTouchOptimized } from '../hooks/useTouchOptimized';
import { useVideoScrub } from '../hooks/useVideoScrub';
import { FALLBACK_DURATION, progressToTime } from '../lib/videoTimeline';

type ScrollytellingHeroProps = {
  reducedMotion: boolean;
  onProgressChange: (progress: number) => void;
};

const MOBILE_SLIDE_PROGRESS = [0, 0.42, 0.88];
const MOBILE_SNAP_DELAY = 140;

function scrollToRequest() {
  document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
}

function interpolateMobileProgress(slidePosition: number) {
  const clamped = Math.min(2, Math.max(0, slidePosition));
  const index = Math.min(1, Math.floor(clamped));
  const local = clamped - index;
  const from = MOBILE_SLIDE_PROGRESS[index];
  const to = MOBILE_SLIDE_PROGRESS[index + 1];

  return from + (to - from) * local;
}

function useMobileSlideProgress(
  wrapperRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  disabled: boolean,
  onProgressChange: (progress: number) => void,
) {
  const progressRef = useRef(0);
  const lastSeekRef = useRef(0);
  const snapTimerRef = useRef<number | null>(null);
  const isSnappingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const scrollToSlide = useCallback((targetIndex: number) => {
    const wrapper = wrapperRef.current;

    if (!wrapper) {
      return;
    }

    if (targetIndex >= MOBILE_SLIDE_PROGRESS.length) {
      document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const pageTop = window.scrollY + wrapper.getBoundingClientRect().top;

    isSnappingRef.current = true;
    window.scrollTo({
      top: pageTop + window.innerHeight * targetIndex,
      behavior: 'smooth',
    });

    window.setTimeout(() => {
      isSnappingRef.current = false;
    }, 520);
  }, [wrapperRef]);

  const snapToNearest = useCallback(() => {
    const wrapper = wrapperRef.current;

    if (!wrapper || isSnappingRef.current) {
      return;
    }

    const rect = wrapper.getBoundingClientRect();

    if (rect.top > 0 || rect.bottom < window.innerHeight) {
      return;
    }

    const slidePosition = Math.min(2, Math.max(0, -rect.top / window.innerHeight));
    scrollToSlide(Math.round(slidePosition));
  }, [scrollToSlide, wrapperRef]);

  useEffect(() => {
    if (disabled) {
      return;
    }

    let frameId = 0;

    const tick = () => {
      const wrapper = wrapperRef.current;

      if (wrapper) {
        const video = videoRef.current;
        const rect = wrapper.getBoundingClientRect();
        const slidePosition = Math.min(2, Math.max(0, -rect.top / window.innerHeight));
        const nextProgress = interpolateMobileProgress(slidePosition);
        const rounded = Math.round(nextProgress * 1000) / 1000;
        const now = window.performance.now();

        if (rounded !== progressRef.current) {
          progressRef.current = rounded;
          setProgress(rounded);
          setSlideIndex(Math.round(slidePosition));
          onProgressChange(rounded);
        }

        if (video && now - lastSeekRef.current > 45) {
          const duration =
            Number.isFinite(video.duration) && video.duration > 0
              ? video.duration
              : FALLBACK_DURATION;
          const target = progressToTime(nextProgress, duration);

          if (Math.abs(video.currentTime - target) > 0.045) {
            lastSeekRef.current = now;
            video.currentTime = target;
          }
        }
      }

      frameId = window.requestAnimationFrame(tick);
    };

    const queueSnap = () => {
      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
      }

      snapTimerRef.current = window.setTimeout(snapToNearest, MOBILE_SNAP_DELAY);
    };

    frameId = window.requestAnimationFrame(tick);
    window.addEventListener('scroll', queueSnap, { passive: true });
    window.addEventListener('touchend', snapToNearest, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', queueSnap);
      window.removeEventListener('touchend', snapToNearest);

      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
      }
    };
  }, [disabled, onProgressChange, snapToNearest, videoRef, wrapperRef]);

  return { progress, slideIndex, scrollToSlide };
}

function MobileScrollytellingHero({
  reducedMotion,
  onProgressChange,
}: ScrollytellingHeroProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { progress, slideIndex, scrollToSlide } = useMobileSlideProgress(
    wrapperRef,
    videoRef,
    reducedMotion,
    onProgressChange,
  );

  const markReady = useCallback(() => setVideoReady(true), []);

  return (
    <section
      ref={wrapperRef}
      data-testid="hero-scene"
      className="relative h-[300dvh] bg-[#05080D]"
      aria-label="Сцена ORBIT House"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={asset('orbit-scrub-mobile.mp4')}
          poster={asset('poster-day.jpg')}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `50% ${50 + Math.max(0, progress - 0.45) * 4}%` }}
          onLoadedMetadata={(event) => {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
            markReady();
          }}
          onLoadedData={markReady}
          onCanPlay={markReady}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,transparent_0,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.38)_100%)]" />
        <div className="film-grain" aria-hidden="true" />

        <HeroDay progress={progress} />
        <HeroDusk progress={progress} />
        <HeroFinal progress={progress} />
        <VideoLoader ready={videoReady} />

        <div className="pointer-events-auto absolute right-5 top-1/2 z-[70] flex -translate-y-1/2 flex-col gap-2">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-[0_18px_45px_-24px_rgba(0,0,0,0.85)] backdrop-blur-md transition-colors active:bg-white/15"
            aria-label="Предыдущий экран"
            onClick={() => scrollToSlide(Math.max(0, slideIndex - 1))}
          >
            <ArrowUp size={18} />
          </button>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D89A52] text-black shadow-[0_18px_45px_-24px_rgba(0,0,0,0.85)] transition-colors active:bg-[#C8873E]"
            aria-label={
              slideIndex >= MOBILE_SLIDE_PROGRESS.length - 1
                ? 'Перейти к форме заявки'
                : 'Следующий экран'
            }
            onClick={() => scrollToSlide(slideIndex + 1)}
          >
            <ChevronDown size={21} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ScrollytellingHero({
  reducedMotion,
  onProgressChange,
}: ScrollytellingHeroProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchOptimized = useTouchOptimized();
  const lenisRef = useLenis(reducedMotion);
  const [videoReady, setVideoReady] = useState(false);

  const progress = useVideoScrub({
    wrapperRef,
    videoRef,
    lenisRef,
    disabled: reducedMotion,
    onProgressChange,
  });

  const markReady = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState >= 3) {
      setVideoReady(true);
    }
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      onProgressChange(1);
      return;
    }

    const timer = window.setTimeout(() => setVideoReady(true), 8000);
    return () => window.clearTimeout(timer);
  }, [onProgressChange, reducedMotion]);

  const objectY = 50 + Math.max(0, progress - 0.45) * 4;

  if (touchOptimized && !reducedMotion) {
    return (
      <MobileScrollytellingHero
        reducedMotion={reducedMotion}
        onProgressChange={onProgressChange}
      />
    );
  }

  if (reducedMotion) {
    return (
      <section
        className="relative min-h-[100dvh] overflow-hidden bg-[#05080D] text-white"
        aria-label="ORBIT House"
      >
        <img
          src={asset('poster-lit.jpg')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[50%_52%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/25" />
        <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pb-[calc(9vh+env(safe-area-inset-bottom))] pt-28 md:px-10">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">
            ORBIT House
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-light leading-[0.98] tracking-[-0.04em] md:text-7xl">
            Место, где видно
            <span className="block font-display italic">ночь</span>
          </h1>
          <button
            type="button"
            className="mt-8 flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#D89A52] py-2 pl-7 pr-2 text-sm font-semibold text-black outline-none transition-colors hover:bg-[#C8873E] focus-visible:ring-2 focus-visible:ring-white"
            onClick={scrollToRequest}
          >
            Оставить заявку
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/85 text-white">
              <ArrowUpRight size={18} />
            </span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      data-testid="hero-scene"
      className="relative h-[560vh] bg-[#05080D]"
      aria-label="Сцена ORBIT House"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={asset('orbit-scrub.mp4')}
          poster={asset('poster-day.jpg')}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `50% ${objectY}%` }}
          onLoadedMetadata={(event) => {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
            markReady();
          }}
          onLoadedData={markReady}
          onCanPlayThrough={markReady}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,transparent_0,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.38)_100%)]" />
        <div className="film-grain" aria-hidden="true" />

        <HeroDay progress={progress} />
        <HeroDusk progress={progress} />
        <HeroFinal progress={progress} />
        <VideoLoader ready={videoReady} />
      </div>
    </section>
  );
}
