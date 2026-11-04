import { imgOf } from '@/lib/cover';
export function Cover({ cover, wide }: { cover: string; wide?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={imgOf(cover, wide)} alt="" className="h-full w-full object-cover" loading="lazy" />;
}
