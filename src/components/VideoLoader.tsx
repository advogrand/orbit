type VideoLoaderProps = {
  ready: boolean;
};

export default function VideoLoader({ ready }: VideoLoaderProps) {
  return (
    <div
      className={`absolute inset-0 z-[80] flex items-center justify-center bg-[#05080D] transition-opacity duration-700 ${
        ready ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden={ready}
    >
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full border border-white/20">
          <div className="h-full w-full animate-spin rounded-full border-t border-[#D89A52]" />
        </div>
        <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-white/40">
          Загружаем сцену
        </p>
      </div>
    </div>
  );
}
