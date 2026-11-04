export function imgOf(cover: string, wide = false): string {
  if (cover.startsWith('art:cover:')) return `/api/art?cover=${cover.slice(10)}${wide ? '&wide=1' : ''}`;
  return cover;
}
