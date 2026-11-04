export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#F3CFC8" />
      <path d="M6 34 A18 18 0 0 1 42 34" fill="none" stroke="#C4806A" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12 34 A12 12 0 0 1 36 34" fill="none" stroke="#F6E6B8" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M18 34 A6 6 0 0 1 30 34" fill="none" stroke="#D3E0CE" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M24 9 L25.6 13.4 L30 15 L25.6 16.6 L24 21 L22.4 16.6 L18 15 L22.4 13.4 Z" fill="#2B2622" />
    </svg>
  );
}
export function Logo({ tag, size = 36 }: { tag?: string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="leading-none">
        <span className="block font-display text-2xl font-semibold tracking-tight text-ink">Rayana</span>
        {tag && <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-muted">{tag}</span>}
      </span>
    </span>
  );
}
