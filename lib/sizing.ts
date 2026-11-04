export interface SizeRow { size: string; label: string; ageMin: number; ageMax: number; hMin: number; hMax: number; wMin: number; wMax: number; chest: string; waist: string; hip: string }
// ageMin/ageMax in months. Approximate guidance only; brands differ.
export const SIZE_GUIDE: SizeRow[] = [
  { size: 'NB', label: '0~3 сар', ageMin: 0, ageMax: 3, hMin: 50, hMax: 58, wMin: 3, wMax: 5, chest: '36~40', waist: '36~40', hip: '38~42' },
  { size: '3M', label: '3~6 сар', ageMin: 3, ageMax: 6, hMin: 58, hMax: 65, wMin: 5, wMax: 7, chest: '40~43', waist: '40~43', hip: '42~45' },
  { size: '6M', label: '6~9 сар', ageMin: 6, ageMax: 9, hMin: 65, hMax: 71, wMin: 7, wMax: 8.5, chest: '43~45', waist: '42~44', hip: '45~47' },
  { size: '12M', label: '9~15 сар', ageMin: 9, ageMax: 15, hMin: 71, hMax: 80, wMin: 8.5, wMax: 10.5, chest: '45~47', waist: '44~46', hip: '47~49' },
  { size: '18M', label: '15~21 сар', ageMin: 15, ageMax: 21, hMin: 80, hMax: 86, wMin: 10.5, wMax: 12, chest: '47~49', waist: '46~48', hip: '49~51' },
  { size: '2Y', label: '2 нас', ageMin: 21, ageMax: 30, hMin: 86, hMax: 93, wMin: 12, wMax: 14, chest: '49~51', waist: '48~50', hip: '51~53' },
  { size: '3Y', label: '3 нас', ageMin: 30, ageMax: 42, hMin: 93, hMax: 99, wMin: 14, wMax: 16, chest: '51~53', waist: '49~51', hip: '53~55' },
  { size: '4Y', label: '4 нас', ageMin: 42, ageMax: 54, hMin: 99, hMax: 105, wMin: 16, wMax: 18, chest: '53~55', waist: '50~52', hip: '55~57' },
  { size: '5Y', label: '5 нас', ageMin: 54, ageMax: 66, hMin: 105, hMax: 112, wMin: 18, wMax: 20.5, chest: '55~57', waist: '51~53', hip: '57~60' },
  { size: '6Y', label: '6~7 нас', ageMin: 66, ageMax: 84, hMin: 112, hMax: 122, wMin: 20.5, wMax: 25, chest: '57~62', waist: '52~55', hip: '60~65' },
  { size: '8Y', label: '8~9 нас', ageMin: 84, ageMax: 108, hMin: 122, hMax: 134, wMin: 25, wMax: 31, chest: '62~68', waist: '55~59', hip: '65~71' },
  { size: '10Y', label: '10~11 нас', ageMin: 108, ageMax: 132, hMin: 134, hMax: 146, wMin: 31, wMax: 38, chest: '68~74', waist: '59~63', hip: '71~77' },
  { size: '12Y', label: '12~13 нас', ageMin: 132, ageMax: 156, hMin: 146, hMax: 158, wMin: 38, wMax: 46, chest: '74~80', waist: '63~67', hip: '77~83' },
  { size: '14Y', label: '14 нас', ageMin: 156, ageMax: 180, hMin: 158, hMax: 170, wMin: 46, wMax: 56, chest: '80~86', waist: '67~71', hip: '83~89' },
];
export interface Recommendation { size: string; alt: string | null; basis: 'height' | 'age'; weightNote: boolean }
export function recommendSize(ageMonths: number | null, heightCm: number | null, weightKg: number | null): Recommendation | null {
  const idx = (n: number) => Math.max(0, Math.min(SIZE_GUIDE.length - 1, n));
  let i: number; let basis: 'height' | 'age';
  if (heightCm && heightCm > 0) {
    basis = 'height';
    const f = SIZE_GUIDE.findIndex((r) => heightCm >= r.hMin && heightCm < r.hMax);
    i = f >= 0 ? f : heightCm < SIZE_GUIDE[0].hMin ? 0 : SIZE_GUIDE.length - 1;
  } else if (ageMonths !== null && ageMonths >= 0) {
    basis = 'age';
    const f = SIZE_GUIDE.findIndex((r) => ageMonths >= r.ageMin && ageMonths < r.ageMax);
    i = f >= 0 ? f : SIZE_GUIDE.length - 1;
  } else return null;
  let weightNote = false;
  if (weightKg && weightKg > SIZE_GUIDE[i].wMax) { i = idx(i + 1); weightNote = true; }
  // Near the upper height edge, suggest sizing up as the alternative.
  let alt: string | null = null;
  const r = SIZE_GUIDE[i];
  if (basis === 'height' && heightCm && r.hMax - heightCm <= 2 && i < SIZE_GUIDE.length - 1) alt = SIZE_GUIDE[i + 1].size;
  else if (basis === 'height' && heightCm && heightCm - r.hMin <= 1 && i > 0 && !weightNote) alt = SIZE_GUIDE[i - 1].size;
  return { size: r.size, alt, basis, weightNote };
}
export const sizeLabel = (s: string, lang: 'mn' | 'en') => {
  if (lang === 'en') return s === 'NB' ? 'Newborn' : s.replace('M', ' mo').replace('Y', ' yrs');
  return s === 'NB' ? 'Нярай' : s.replace('M', ' сар').replace('Y', ' нас');
};
