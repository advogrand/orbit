import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import HeroDay from './HeroDay';
import HeroDusk from './HeroDusk';
import HeroFinal from './HeroFinal';
import VideoLoader from './VideoLoader';
import { asset } from '../lib/assets';
import { useLenis } from '../hooks/useLenis';
import { useVideoScrub } from '../hooks/useVideoScrub';

type ScrollytellingHeroProps = {
  reducedMotion: boolean;
  onProgressChange: (progress: number) => void;
};

function scrollToRequest() {
  document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
}

export default function ScrollytellingHero({
  reducedMotion,
  onProgressChange,
}: ScrollytellingHeroProps) {
  const wrapperRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
