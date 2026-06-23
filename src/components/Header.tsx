type HeaderProps = {
  progress: number;
  reducedMotion: boolean;
};

function scrollToRequest() {
  document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Header({ progress, reducedMotion }: HeaderProps) {
  const night = reducedMotion || progress > 0.24;
  const ctaClass = night
    ? 'bg-[#D89A52] text-black hover:bg-[#C8873E]'
    : 'bg-[#101214] text-white hover:bg-black';
  const logoClass = night ? 'text-white' : 'text-[#101214]';

  return (
    <header className="fixed inset-x-0 top-0 z-100 flex items-center justify-between px-4 py-5 transition-colors duration-700 sm:px-6 md:px-10">
      <a
        href="#"
        className={`flex min-h-11 items-center gap-2 rounded-full border px-3 py-1.5 text-xs outline-none backdrop-blur-md transition-colors duration-700 focus-visible:ring-2 focus-visible:ring-[#D89A52] sm:gap-3 sm:text-sm ${
          night
            ? 'border-white/12 bg-black/30 shadow-[0_12px_35px_-22px_rgba(0,0,0,0.8)]'
            : 'border-black/10 bg-white/35 shadow-[0_12px_35px_-24px_rgba(16,18,20,0.45)]'
        } ${logoClass}`}
        aria-label="ORBIT House наверх"
      >
        <span className="relative h-5 w-5 shrink-0 rounded-full border border-current/40">
          <span className="absolute left-1/2 top-1/2 h-[5px] w-[22px] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border border-current/60" />
          <span className="absolute right-0 top-1 h-1.5 w-1.5 rounded-full bg-[#D89A52]" />
        </span>
        <span className="tracking-[0.18em]">
          ORBIT{' '}
          <span className="font-display italic tracking-normal">House</span>
        </span>
      </a>

      <button
        type="button"
        className={`min-h-11 rounded-full px-4 text-xs font-semibold outline-none transition-colors duration-700 focus-visible:ring-2 focus-visible:ring-white sm:px-5 sm:text-sm ${ctaClass}`}
        onClick={scrollToRequest}
      >
        Оставить заявку
      </button>
    </header>
  );
}
