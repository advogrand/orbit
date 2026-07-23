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
import { CLIP_1_END, FALLBACK_DURATION } from '../lib/videoTimeline';

type ScrollytellingHeroProps = {
  reducedMotion: boolean;
  onProgressChange: (progress: number) => void;
};

const MOBILE_SLIDE_PROGRESS = [0, 0.42, 0.88];
const MOBILE_SNAP_DELAY = 180;

function scrollToRequest() {
  document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
}

function useMobileSlideProgress(
  wrapperRef: RefObject<HTMLElement | null>,
  disabled: boolean,
) {
  const snapTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSnappingRef = useRef(false);
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

    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    const rect = wrapper.getBoundingClientRect();
    const pageTop = window.scrollY + rect.top;
    const startScroll = window.scrollY;
    const targetScroll = pageTop + window.innerHeight * targetIndex;
    const startSlidePosition = Math.min(2, Math.max(0, -rect.top / window.innerHeight));
    const startTime = window.performance.now();
    const durationMs = 700;

    const easeInOutCubic = (value: number) =>
      value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

    if (snapTimerRef.current) {
      window.clearTimeout(snapTimerRef.current);
    }

    isSnappingRef.current = true;

    const animate = (now: number) => {
      const elapsed = Math.min(1, (now - startTime) / durationMs);
      const eased = easeInOutCubic(elapsed);
      const nextScroll = startScroll + (targetScroll - startScroll) * eased;
      const slidePosition =
        startSlidePosition + (targetIndex - startSlidePosition) * eased;

      window.scrollTo(0, nextScroll);
      setSlideIndex(Math.round(slidePosition));

      if (elapsed < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      window.scrollTo(0, targetScroll);
      setSlideIndex(targetIndex);
      animationFrameRef.current = null;
      window.setTimeout(() => {
        isSnappingRef.current = false;
      }, 80);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);
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

    const update = () => {
      frameId = 0;
      const wrapper = wrapperRef.current;

      if (wrapper && !isSnappingRef.current) {
        const rect = wrapper.getBoundingClientRect();
        const slidePosition = Math.min(2, Math.max(0, -rect.top / window.innerHeight));
        setSlideIndex(Math.round(slidePosition));
      }
    };

    const handleScroll = () => {
      if (isSnappingRef.current) {
        return;
      }

      if (!frameId) {
        frameId = window.requestAnimationFrame(update);
      }

      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
      }

      snapTimerRef.current = window.setTimeout(snapToNearest, MOBILE_SNAP_DELAY);
    };

    frameId = window.requestAnimationFrame(update);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener('scroll', handleScroll);

      if (snapTimerRef.current) {
        window.clearTimeout(snapTimerRef.current);
      }

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [disabled, snapToNearest, wrapperRef]);

  return { slideIndex, scrollToSlide };
}

function MobileScrollytellingHero({
  reducedMotion,
  onProgressChange,
}: ScrollytellingHeroProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const visualTimeRef = useRef(0);
  const [videoReady, setVideoReady] = useState(false);
  const [reverseActive, setReverseActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const { slideIndex, scrollToSlide } = useMobileSlideProgress(wrapperRef, reducedMotion);

  const markReady = useCallback(() => setVideoReady(true), []);

  useEffect(() => {
    const video = videoRef.current;
    const reverseVideo = reverseVideoRef.current;

    if (!video || !reverseVideo || !videoReady) {
      return;
    }

    const duration =
      Number.isFinite(video.duration) && video.duration > 0 ? video.duration : FALLBACK_DURATION;
    const endTime = Math.max(CLIP_1_END, duration - 0.4);
    const targetTime = [0, CLIP_1_END, endTime][slideIndex];
    const targetProgress = MOBILE_SLIDE_PROGRESS[slideIndex];
    let frameId = 0;
    let cancelled = false;

    const applyProgress = (nextProgress: number) => {
      const rounded = Math.round(nextProgress * 200) / 200;
      setProgress(rounded);
      onProgressChange(rounded);
    };

    const progressAtTime = (time: number) =>
      time <= CLIP_1_END
        ? (time / CLIP_1_END) * MOBILE_SLIDE_PROGRESS[1]
        : MOBILE_SLIDE_PROGRESS[1] +
          ((time - CLIP_1_END) / (endTime - CLIP_1_END)) *
            (MOBILE_SLIDE_PROGRESS[2] - MOBILE_SLIDE_PROGRESS[1]);

    const startTime = visualTimeRef.current;
    const movingBackward = targetTime < startTime - 0.05;

    video.pause();
    reverseVideo.pause();

    if (Math.abs(targetTime - startTime) <= 0.05) {
      video.pause();
      video.currentTime = targetTime;
      visualTimeRef.current = targetTime;
      setReverseActive(false);
      applyProgress(targetProgress);
      return;
    }

    const finish = () => {
      video.pause();
      reverseVideo.pause();
      video.currentTime = targetTime;
      visualTimeRef.current = targetTime;
      setReverseActive(false);
      applyProgress(targetProgress);
    };

    if (movingBackward) {
      const reverseStart = Math.max(0, duration - startTime);
      const reverseTarget = Math.min(duration, duration - targetTime);

      reverseVideo.playbackRate = 2;

      const updateReverse = () => {
        const currentTime = Math.max(targetTime, duration - reverseVideo.currentTime);
        visualTimeRef.current = currentTime;
        applyProgress(Math.max(targetProgress, progressAtTime(currentTime)));

        if (reverseVideo.currentTime >= reverseTarget - 0.04) {
          finish();
          return;
        }

        frameId = window.requestAnimationFrame(updateReverse);
      };

      const playReverse = () => {
        if (cancelled) {
          return;
        }

        video.currentTime = targetTime;
        setReverseActive(true);
        reverseVideo.play().then(() => {
          frameId = window.requestAnimationFrame(updateReverse);
        }).catch(finish);
      };

      if (Math.abs(reverseVideo.currentTime - reverseStart) < 0.04 && reverseVideo.readyState >= 2) {
        playReverse();
      } else {
        reverseVideo.addEventListener('seeked', playReverse, { once: true });
        reverseVideo.currentTime = reverseStart;
      }

      return () => {
        cancelled = true;
        reverseVideo.removeEventListener('seeked', playReverse);
        window.cancelAnimationFrame(frameId);
        reverseVideo.pause();
      };
    }

    setReverseActive(false);
    video.currentTime = startTime;
    video.playbackRate = 2;

    const updateForward = () => {
      const currentTime = Math.min(targetTime, video.currentTime);
      visualTimeRef.current = currentTime;
      applyProgress(Math.min(targetProgress, progressAtTime(currentTime)));

      if (video.currentTime >= targetTime - 0.04) {
        finish();
        return;
      }

      frameId = window.requestAnimationFrame(updateForward);
    };

    video.play().then(() => {
      frameId = window.requestAnimationFrame(updateForward);
    }).catch(finish);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      video.pause();
    };
  }, [onProgressChange, slideIndex, videoReady]);

  return (
    <section
      ref={wrapperRef}
      data-testid="hero-scene"
      className="relative h-[300dvh] touch-none bg-[#05080D]"
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
          className={`absolute inset-0 h-full w-full object-cover ${reverseActive ? 'opacity-0' : 'opacity-100'}`}
          style={{ objectPosition: `50% ${50 + Math.max(0, progress - 0.45) * 4}%` }}
          onLoadedMetadata={(event) => {
            event.currentTarget.pause();
            event.currentTarget.currentTime = 0;
            markReady();
          }}
          onLoadedData={markReady}
          onCanPlay={markReady}
        />
        <video
          ref={reverseVideoRef}
          src={asset('orbit-scrub-reverse.mp4')}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover ${reverseActive ? 'opacity-100' : 'opacity-0'}`}
          style={{ objectPosition: `50% ${50 + Math.max(0, progress - 0.45) * 4}%` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,transparent_0,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.38)_100%)]" />
        <HeroDay progress={progress} mobile />
        <HeroDusk progress={progress} linger />
        <HeroFinal progress={progress} />
        <VideoLoader ready={videoReady} />

        <div className="pointer-events-auto absolute bottom-[19%] right-3 z-[70] flex flex-col gap-2">
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
  const lenisRef = useLenis(reducedMotion || touchOptimized);
  const [videoReady, setVideoReady] = useState(false);

  const progress = useVideoScrub({
    wrapperRef,
    videoRef,
    lenisRef,
    disabled: reducedMotion || touchOptimized,
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
