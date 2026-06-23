import { clamp01, reveal } from '../lib/animation';

type HeroFinalProps = {
  progress: number;
};

export default function HeroFinal({ progress }: HeroFinalProps) {
  const hpD = clamp01((progress - 0.78) / 0.1);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 text-white"
      style={{ opacity: hpD }}
    >
      <div className="absolute inset-x-0 top-[13%] px-6 text-center md:top-[12%]">
        <h2
          className="mx-auto max-w-4xl text-5xl font-light leading-[0.98] tracking-[-0.045em] drop-shadow-[0_8px_30px_rgba(0,0,0,0.42)] md:text-7xl lg:text-[86px]"
          style={reveal(hpD, 0, 0.18, 20, 5)}
        >
          Место, где видно
          <span className="block font-display italic">ночь</span>
        </h2>
      </div>
    </div>
  );
}
