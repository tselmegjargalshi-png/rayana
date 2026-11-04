'use client';
export function PrintButton({ label }: { label: string }) { return <button onClick={() => window.print()} className="btn btn-ghost w-full no-print">{label}</button>; }
