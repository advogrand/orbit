import { ChevronDown } from 'lucide-react';
import { fadeOut } from '../lib/animation';

type HeroDayProps = {
  progress: number;
  mobile?: boolean;
};

export default function HeroDay({ progress, mobile = false }: HeroDayProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 text-[#101214]"
      style={fadeOut(progress, 0.09, 0.24, -34, 8)}
    >
      <div className="absolute inset-x-0 top-[11.5%] px-6 text-center sm:top-[10%] md:top-[11%] lg:top-[8%]">
        <p className="text-[10px] uppercase tracking-[0.28em] text-black/55 md:text-xs">
          Частная резиденция с обсерваторией
        </p>
        <h1 className="mx-auto mt-5 max-w-5xl text-[46px] font-light leading-[0.95] tracking-[-0.045em] sm:text-6xl md:text-7xl lg:text-[88px]">
          Резиденция, созданная
          <span className="block font-display italic">вокруг неба</span>
        </h1>
      </div>

      <div className="absolute bottom-[8%] left-[6%] hidden text-[10px] uppercase tracking-[0.2em] text-black/50 sm:block">
        <p>Плато Альта</p>
        <p className="mt-2">2 480 м над уровнем моря</p>
      </div>

      <div className="absolute bottom-[8%] right-[6%] hidden text-right text-[10px] uppercase tracking-[0.2em] text-black/50 sm:block">
        <p>Частная обсерватория</p>
        <p className="mt-2">Открыта после заката</p>
      </div>

      <div className="absolute bottom-[7%] left-1/2 flex w-[260px] -translate-x-1/2 flex-col items-center gap-1 rounded-full border border-white/40 bg-white/70 px-3 py-1.5 text-center text-[10px] uppercase tracking-[0.22em] text-black/75 shadow-[0_18px_45px_-24px_rgba(16,18,20,0.65)] backdrop-blur-md">
        <span className="whitespace-nowrap">{mobile ? 'Нажмите стрелку справа' : 'Листайте к ночи'}</span>
        <ChevronDown className="animate-bounce-slow" size={14} />
      </div>
    </div>
  );
}
