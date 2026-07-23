import { clamp01, reveal } from '../lib/animation';

type HeroDuskProps = {
  progress: number;
  linger?: boolean;
};

const stats = [
  ['08', 'Приватных люксов'],
  ['320', 'Ясных ночей в году'],
  ['00', 'Источников городской засветки'],
];

export default function HeroDusk({ progress, linger = false }: HeroDuskProps) {
  const hpB = clamp01((progress - 0.34) / 0.08);
  const fadeStart = linger ? 0.7 : 0.46;
  const fadeB = progress < fadeStart ? 1 : 1 - clamp01((progress - fadeStart) / 0.08);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 text-white"
      style={{
        opacity: fadeB,
        transform: `translate3d(${(1 - fadeB) * -24}px, 0, 0)`,
        filter: `blur(${(1 - fadeB) * 8}px)`,
      }}
    >
      <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black/78 via-black/24 to-transparent lg:hidden" />

      <div className="absolute left-6 right-6 top-[32%] max-w-[430px] sm:top-[30%] md:left-10 md:right-10 md:top-[27%] md:max-w-[520px] lg:bottom-auto lg:left-[6%] lg:right-auto lg:top-[28%] lg:max-w-[420px]">
        <p
          className="text-[10px] uppercase tracking-[0.25em] text-white/45"
          style={reveal(hpB, 0)}
        >
          После заката
        </p>
        <h2
          className="mt-3 text-[32px] font-light leading-[1.02] tracking-[-0.035em] sm:text-4xl md:text-5xl lg:mt-4 lg:text-6xl"
          style={reveal(hpB, 0.08)}
        >
          Когда <span className="font-display italic">гаснет день</span>,
          <span className="block">начинается главное</span>
        </h2>
        <p
          className="mt-5 max-w-[390px] text-sm leading-relaxed text-white/68 md:mt-6 md:max-w-[440px] md:text-base lg:max-w-[390px]"
          style={reveal(hpB, 0.16)}
        >
          Архитектура остаётся тихой, чтобы главным стало небо. Панорамные
          комнаты обращены к горизонту.
        </p>
      </div>

      <div className="absolute bottom-[5.5%] left-6 right-6 grid grid-cols-3 gap-5 md:left-10 md:right-10 md:gap-8 lg:left-auto lg:right-[6%] lg:top-[27%] lg:block lg:w-[250px]">
        {stats.map(([value, label], index) => (
          <div key={label} style={reveal(hpB, 0.18 + index * 0.08)}>
            <p className="font-display text-3xl italic leading-none text-white md:text-4xl">
              {value}
            </p>
            <p className="mt-2 text-[9px] uppercase leading-snug tracking-[0.14em] text-white/48 md:text-[10px] md:tracking-[0.17em]">
              {label}
            </p>
            {index < stats.length - 1 && (
              <div className="mt-6 hidden h-px w-full bg-white/15 lg:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
