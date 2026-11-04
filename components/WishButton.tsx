'use client';
import { useApp } from './Providers';
export function WishButton({ id, large }: { id: string; large?: boolean }) {
  const { wish, toggleWish, t } = useApp(); const on = wish.includes(id);
  return (
    <button onClick={() => toggleWish(id)} aria-pressed={on} aria-label={on ? t('remove_fav') : t('save_fav')} className={`flex items-center justify-center rounded-full bg-white/90 shadow-soft transition hover:scale-105 ${large ? 'h-12 w-12' : 'h-9 w-9'}`} data-testid="wish-btn">
      <svg width={large ? 22 : 18} height={large ? 22 : 18} viewBox="0 0 24 24" fill={on ? '#C4806A' : 'none'} stroke={on ? '#C4806A' : '#2B2622'} strokeWidth="1.8"><path d="M12 20s-7-4.4-9-9.2C1.8 7 4 4 7 4c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3 0 5.2 3 4 6.8C19 15.6 12 20 12 20z" /></svg>
    </button>
  );
}
