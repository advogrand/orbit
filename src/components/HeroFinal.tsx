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
      <div className="absolute inset-x-0 top-[13%] px-4 text-center md:top-[12%] md:px-6">
        <h2
          className="mx-auto max-w-4xl text-[34px] font-light leading-[1.02] tracking-normal drop-shadow-[0_8px_30px_rgba(0,0,0,0.42)] min-[370px]:text-[40px] md:text-7xl lg:text-[86px]"
          style={reveal(hpD, 0, 0.18, 20, 5)}
        >
          <span className="block whitespace-nowrap">Место, где видно</span>
          <span className="block font-display italic">ночь</span>
        </h2>
      </div>
    </div>
  );
}
