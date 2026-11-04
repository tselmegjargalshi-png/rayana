export function BarChart({ data, format, height = 180 }: { data: { label: string; value: number }[]; format: (n: number) => string; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value)); const w = 100 / data.length;
  return (
    <figure><svg viewBox={`0 0 100 ${height / 4}`} className="w-full" role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(', ')} preserveAspectRatio="none" style={{ height }}>
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1="0" x2="100" y1={(height / 4) * (1 - g)} y2={(height / 4) * (1 - g)} stroke="#E9E0D3" strokeWidth=".3" />)}
      {data.map((d, i) => { const h = (d.value / max) * (height / 4 - 2); return <rect key={d.label} x={i * w + w * 0.15} y={height / 4 - h} width={w * 0.7} height={h} rx=".6" fill="#C4806A"><title>{d.label}: {format(d.value)}</title></rect>; })}
    </svg>
      <figcaption className="mt-1 flex justify-between text-[10px] text-muted"><span>{data[0]?.label}</span><span>{data[Math.floor(data.length / 2)]?.label}</span><span>{data[data.length - 1]?.label}</span></figcaption></figure>
  );
}
