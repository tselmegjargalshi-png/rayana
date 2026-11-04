import { createHash, randomBytes, scryptSync } from 'node:crypto';
import type { AgeGroup, Banner, Category, Collection, ColorDef, DB, DeliveryZone, DiscountCode, Group, Order, OrderItem, OrderStatus, PayMethod, Product, Review, Settings, StockMove, User, Variant, Bi } from './types';

export const DISTRICTS = ['Сүхбаатар', 'Чингэлтэй', 'Баянгол', 'Хан Уул', 'Баянзүрх', 'Сонгинохайрхан', 'Налайх', 'Багануур', 'Багахангай'];
export const DEMO_ADMIN = { email: 'admin@rayana.demo', password: 'Rayana2026!' };
export const DEMO_CUSTOMER_PASSWORD = 'Demo1234!';

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(pw, salt, 32).toString('hex')}`;
}
function rng(seed: number) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const bi = (mn: string, en: string): Bi => ({ mn, en });

export const AGE_GROUPS: AgeGroup[] = [
  { id: 'newborn', name: bi('Нярай (0~3 сар)', 'Newborn (0~3 months)'), minM: 0, maxM: 3, sizes: ['NB', '3M'] },
  { id: 'm3_6', name: bi('3~6 сар', '3~6 months'), minM: 3, maxM: 6, sizes: ['3M', '6M'] },
  { id: 'm6_12', name: bi('6~12 сар', '6~12 months'), minM: 6, maxM: 12, sizes: ['6M', '12M'] },
  { id: 'y1_2', name: bi('1~2 нас', '1~2 years'), minM: 12, maxM: 24, sizes: ['12M', '18M'] },
  { id: 'y2_3', name: bi('2~3 нас', '2~3 years'), minM: 24, maxM: 36, sizes: ['2Y'] },
  { id: 'y3_4', name: bi('3~4 нас', '3~4 years'), minM: 36, maxM: 48, sizes: ['3Y'] },
  { id: 'y4_5', name: bi('4~5 нас', '4~5 years'), minM: 48, maxM: 60, sizes: ['4Y'] },
  { id: 'y5_6', name: bi('5~6 нас', '5~6 years'), minM: 60, maxM: 72, sizes: ['5Y', '6Y'] },
  { id: 'y6_8', name: bi('6~8 нас', '6~8 years'), minM: 72, maxM: 96, sizes: ['6Y', '8Y'] },
  { id: 'y8_10', name: bi('8~10 нас', '8~10 years'), minM: 96, maxM: 120, sizes: ['8Y', '10Y'] },
  { id: 'y10_12', name: bi('10~12 нас', '10~12 years'), minM: 120, maxM: 144, sizes: ['10Y', '12Y'] },
  { id: 'y12_14', name: bi('12~14 нас', '12~14 years'), minM: 144, maxM: 168, sizes: ['12Y', '14Y'] },
];
export const ALL_SIZES = ['NB', '3M', '6M', '12M', '18M', '2Y', '3Y', '4Y', '5Y', '6Y', '8Y', '10Y', '12Y', '14Y'];
export const COLORS: ColorDef[] = [
  { id: 'white', name: bi('Цагаан', 'White'), hex: 'F7F3EC' }, { id: 'cream', name: bi('Цөцгийн', 'Cream'), hex: 'EBDDBF' },
  { id: 'pink', name: bi('Ягаан', 'Pink'), hex: 'F0BFC6' }, { id: 'blue', name: bi('Цэнхэр', 'Blue'), hex: 'B5D0E4' },
  { id: 'sage', name: bi('Ногоон', 'Sage'), hex: 'BCD3B3' }, { id: 'butter', name: bi('Шар', 'Butter'), hex: 'F4DB92' },
  { id: 'lilac', name: bi('Нил ягаан', 'Lilac'), hex: 'D3C6E8' }, { id: 'grey', name: bi('Саарал', 'Grey'), hex: 'C9C4BD' },
  { id: 'navy', name: bi('Хар хөх', 'Navy'), hex: '3A4A66' }, { id: 'clay', name: bi('Тоосгон', 'Terracotta'), hex: 'D3977F' },
];
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

const GROUPS: { id: Group; name: Bi }[] = [
  { id: 'baby', name: bi('Нялх хүүхэд (0~24 сар)', 'Baby (0~24 months)') }, { id: 'girls', name: bi('Охид', 'Girls') },
  { id: 'boys', name: bi('Хөвгүүд', 'Boys') }, { id: 'unisex', name: bi('Бүх хүүхэд', 'Unisex') }, { id: 'accessories', name: bi('Дагалдах хэрэгсэл', 'Accessories') },
];
type Def = { slug: string; group: Group; g: string; cn: string; ce: string; mn: string; en: string; base: number; sizes: string[]; st: number[] };
const K = ['2Y', '3Y', '4Y', '5Y', '6Y', '8Y', '10Y', '12Y'];
const B = ['NB', '3M', '6M', '12M', '18M'];
const DEFS: Def[] = [
  { slug: 'baby_newborn', group: 'baby', g: 'bodysuit', cn: 'Нярайн хувцас', ce: 'Newborn clothing', mn: 'нярайн иж хувцас', en: 'Newborn Outfit', base: 39900, sizes: ['NB', '3M', '6M'], st: [0, 1, 4] },
  { slug: 'baby_bodysuits', group: 'baby', g: 'bodysuit', cn: 'Боди', ce: 'Bodysuits', mn: 'нярайн боди', en: 'Baby Bodysuit', base: 29900, sizes: B, st: [0, 3, 7] },
  { slug: 'baby_rompers', group: 'baby', g: 'romper', cn: 'Ромпер', ce: 'Rompers', mn: 'сүлжмэл нярайн ромпер', en: 'Knit Baby Romper', base: 45900, sizes: B, st: [1, 4, 6] },
  { slug: 'baby_sleepsuits', group: 'baby', g: 'sleepsuit', cn: 'Унтлагын хослол', ce: 'Sleepsuits', mn: 'нярайн унтлагын хослол', en: 'Baby Sleepsuit', base: 42900, sizes: B, st: [0, 5, 1] },
  { slug: 'baby_sets', group: 'baby', g: 'babyset', cn: 'Нярайн иж бүрдэл', ce: 'Baby sets', mn: 'нярайн иж бүрдэл', en: 'Baby Set', base: 69900, sizes: B, st: [0, 4, 6] },
  { slug: 'baby_jackets', group: 'baby', g: 'jacket', cn: 'Нярайн хүрэм', ce: 'Baby jackets', mn: 'нярайн хүрэм', en: 'Baby Jacket', base: 89900, sizes: ['3M', '6M', '12M', '18M'], st: [5, 1, 4] },
  { slug: 'baby_accessories', group: 'baby', g: 'hat', cn: 'Нярайн дагалдах хэрэгсэл', ce: 'Baby accessories', mn: 'нярайн малгай', en: 'Baby Beanie', base: 19900, sizes: ['NB', '3M', '6M', '12M'], st: [0, 5, 1] },
  { slug: 'girls_dresses', group: 'girls', g: 'dress', cn: 'Даашинз', ce: 'Dresses', mn: 'охидын зуны даашинз', en: 'Girls Summer Dress', base: 79900, sizes: K, st: [6, 2, 4] },
  { slug: 'girls_tops', group: 'girls', g: 'tee', cn: 'Цамц', ce: 'Tops', mn: 'охидын цамц', en: 'Girls Top', base: 39900, sizes: K, st: [1, 7, 3] },
  { slug: 'girls_tshirts', group: 'girls', g: 'tee', cn: 'Футболк', ce: 'Tees', mn: 'охидын хөвөн футболк', en: 'Girls Cotton Tee', base: 34900, sizes: K, st: [0, 3, 7] },
  { slug: 'girls_skirts', group: 'girls', g: 'skirt', cn: 'Юбка', ce: 'Skirts', mn: 'охидын юбка', en: 'Girls Skirt', base: 54900, sizes: K, st: [6, 2, 7] },
  { slug: 'girls_pants', group: 'girls', g: 'pants', cn: 'Өмд', ce: 'Pants', mn: 'охидын өмд', en: 'Girls Trousers', base: 59900, sizes: K, st: [2, 3, 5] },
  { slug: 'girls_leggings', group: 'girls', g: 'leggings', cn: 'Легинс', ce: 'Leggings', mn: 'охидын легинс', en: 'Girls Leggings', base: 34900, sizes: K, st: [3, 1, 7] },
  { slug: 'girls_jackets', group: 'girls', g: 'jacket', cn: 'Хүрэм', ce: 'Jackets', mn: 'охидын хүрэм', en: 'Girls Jacket', base: 139900, sizes: K, st: [5, 2, 4] },
  { slug: 'girls_sweaters', group: 'girls', g: 'sweater', cn: 'Свитер', ce: 'Sweaters', mn: 'охидын свитер', en: 'Girls Sweater', base: 89900, sizes: K, st: [5, 4, 1] },
  { slug: 'girls_sets', group: 'girls', g: 'set', cn: 'Хослол', ce: 'Matching sets', mn: 'охидын хослол', en: 'Girls Matching Set', base: 89900, sizes: K, st: [1, 6, 3] },
  { slug: 'boys_tshirts', group: 'boys', g: 'tee', cn: 'Футболк', ce: 'Tees', mn: 'хөвгүүдийн хөвөн футболк', en: 'Boys Cotton Tee', base: 36900, sizes: K, st: [3, 0, 7] },
  { slug: 'boys_shirts', group: 'boys', g: 'shirt', cn: 'Цамц', ce: 'Shirts', mn: 'хөвгүүдийн цамц', en: 'Boys Shirt', base: 49900, sizes: K, st: [2, 7, 4] },
  { slug: 'boys_pants', group: 'boys', g: 'pants', cn: 'Өмд', ce: 'Pants', mn: 'хөвгүүдийн өмд', en: 'Boys Trousers', base: 59900, sizes: K, st: [2, 3, 5] },
  { slug: 'boys_shorts', group: 'boys', g: 'shorts', cn: 'Шорт', ce: 'Shorts', mn: 'хөвгүүдийн шорт', en: 'Boys Shorts', base: 39900, sizes: K, st: [3, 2, 7] },
  { slug: 'boys_hoodies', group: 'boys', g: 'hoodie', cn: 'Ходи', ce: 'Hoodies', mn: 'хөвгүүдийн ходи', en: 'Boys Hoodie', base: 79900, sizes: K, st: [5, 3, 0] },
  { slug: 'boys_sweaters', group: 'boys', g: 'sweater', cn: 'Свитер', ce: 'Sweaters', mn: 'хөвгүүдийн свитер', en: 'Boys Sweater', base: 84900, sizes: K, st: [5, 4, 2] },
  { slug: 'boys_jackets', group: 'boys', g: 'jacket', cn: 'Хүрэм', ce: 'Jackets', mn: 'хөвгүүдийн хүрэм', en: 'Boys Jacket', base: 149900, sizes: K, st: [5, 2, 4] },
  { slug: 'boys_sets', group: 'boys', g: 'set', cn: 'Хослол', ce: 'Matching sets', mn: 'хөвгүүдийн хослол', en: 'Boys Matching Set', base: 84900, sizes: K, st: [3, 1, 7] },
  { slug: 'unisex_essentials', group: 'unisex', g: 'tee', cn: 'Өдөр тутмын суурь хувцас', ce: 'Everyday essentials', mn: 'суурь футболк', en: 'Essential Tee', base: 29900, sizes: ['12M', '18M', ...K, '14Y'], st: [3, 0, 1] },
  { slug: 'unisex_tracksuits', group: 'unisex', g: 'tracksuit', cn: 'Спорт хослол', ce: 'Tracksuits', mn: 'хүүхдийн спорт хослол', en: 'Childrens Tracksuit Set', base: 119900, sizes: K, st: [5, 3, 0] },
  { slug: 'unisex_sweatshirts', group: 'unisex', g: 'sweater', cn: 'Свитшот', ce: 'Sweatshirts', mn: 'свитшот', en: 'Sweatshirt', base: 64900, sizes: K, st: [0, 5, 2] },
  { slug: 'unisex_basics', group: 'unisex', g: 'longsleeve', cn: 'Суурь хувцас', ce: 'Basic clothing', mn: 'урт ханцуйтай цамц', en: 'Long Sleeve Top', base: 34900, sizes: ['12M', '18M', ...K], st: [0, 3, 1] },
  { slug: 'unisex_outerwear', group: 'unisex', g: 'puffer', cn: 'Гадуур хувцас', ce: 'Outerwear', mn: 'өвлийн пуффер хүрэм', en: 'Kids Winter Puffer Jacket', base: 199000, sizes: K, st: [5, 4, 2] },
  { slug: 'acc_hats', group: 'accessories', g: 'hat', cn: 'Малгай', ce: 'Hats', mn: 'малгай', en: 'Hat', base: 24900, sizes: ['12M', '3Y', '6Y'], st: [0, 5] },
  { slug: 'acc_socks', group: 'accessories', g: 'socks', cn: 'Оймс', ce: 'Socks', mn: 'оймсны багц', en: 'Sock Set', base: 14900, sizes: ['6M', '2Y', '4Y', '8Y'], st: [0, 3] },
  { slug: 'acc_shoes', group: 'accessories', g: 'shoes', cn: 'Гутал', ce: 'Shoes', mn: 'гутал', en: 'Shoes', base: 89900, sizes: ['18M', '2Y', '4Y', '6Y', '8Y'], st: [3, 2] },
  { slug: 'acc_bags', group: 'accessories', g: 'bag', cn: 'Цүнх', ce: 'Bags', mn: 'цүнх', en: 'Bag', base: 49900, sizes: ['4Y', '8Y'], st: [2, 4] },
  { slug: 'acc_scarves', group: 'accessories', g: 'scarf', cn: 'Ороолт', ce: 'Scarves', mn: 'ороолт', en: 'Scarf', base: 29900, sizes: ['2Y', '6Y', '10Y'], st: [5, 4] },
  { slug: 'acc_gloves', group: 'accessories', g: 'gloves', cn: 'Бээлий', ce: 'Gloves', mn: 'бээлий', en: 'Gloves', base: 24900, sizes: ['2Y', '6Y', '10Y'], st: [5, 1] },
];
const STYLES = [
  { mn: 'Органик', en: 'Organic Cotton', f: 0, m: 1 }, { mn: 'Зөөлөн', en: 'Soft', f: 1, m: 0.95 }, { mn: 'Классик', en: 'Classic', f: 2, m: 1.05 },
  { mn: 'Өдөр тутмын', en: 'Everyday', f: 3, m: 0.9 }, { mn: 'Премиум', en: 'Premium', f: 4, m: 1.5 }, { mn: 'Дулаан', en: 'Cozy', f: 5, m: 1.1 },
  { mn: 'Цэцэгт', en: 'Floral', f: 2, m: 1.05 }, { mn: 'Судалтай', en: 'Striped', f: 2, m: 1 },
];
const FABRICS: { f: Bi; m: Bi }[] = [
  { f: bi('100% органик хөвөн', '100% organic cotton'), m: bi('GOTS сертификаттай органик хөвөн, арьсанд эмзэг хүүхдэд тохиромжтой', 'GOTS certified organic cotton, gentle on sensitive skin') },
  { f: bi('95% хөвөн, 5% эластан', '95% cotton, 5% elastane'), m: bi('Сунадаг зөөлөн хөвөн сүлжмэл', 'Stretch cotton jersey knit') },
  { f: bi('100% хөвөн', '100% cotton'), m: bi('Нягт нэхмэл хөвөн', 'Tightly woven cotton') },
  { f: bi('80% хөвөн, 20% полиэстер', '80% cotton, 20% polyester'), m: bi('Бат бөх, удаан хэрэглэхэд тохиромжтой хольц', 'Durable blend made for everyday wear') },
  { f: bi('70% мерино ноос, 30% хөвөн', '70% merino wool, 30% cotton'), m: bi('Нарийн мерино ноос, хатгахгүй зөөлөн', 'Fine merino wool, soft and non itchy') },
  { f: bi('Хөвөн флис, дотор нь зөөлөн хөвсгөр', 'Cotton fleece with soft brushed lining'), m: bi('Дулаан, хөвсгөр дотортой', 'Warm brushed interior') },
];
const CARE: Bi = bi('Машинд 30°C дээр эргүүлж угаана. Цайруулагч хэрэглэхгүй. Хатаагчид хийхгүй. Бага халуунаар индүүдэнэ.', 'Machine wash at 30°C inside out. Do not bleach. Do not tumble dry. Iron on low heat.');
const WOOL_CARE: Bi = bi('Гараар эсвэл ноосны горимоор 30°C дээр угаана. Тэгшилж хатаана.', 'Hand wash or wool cycle at 30°C. Dry flat.');
const PALETTES: Record<string, string[]> = { baby: ['white', 'cream', 'pink', 'blue', 'sage', 'butter'], girls: ['pink', 'lilac', 'cream', 'blue', 'butter', 'sage', 'clay'], boys: ['blue', 'navy', 'sage', 'grey', 'cream', 'clay'], unisex: ['cream', 'grey', 'sage', 'navy', 'butter', 'white', 'clay'], accessories: ['cream', 'pink', 'blue', 'grey', 'navy', 'sage'] };

const FIRST = ['Оюунаа', 'Номин', 'Сарангэрэл', 'Болормаа', 'Энхжин', 'Мөнхзул', 'Анужин', 'Цэцэгмаа', 'Урантуяа', 'Хулан', 'Тэмүүлэн', 'Билгүүн', 'Ганзориг', 'Амарбаяр', 'Болд', 'Төгөлдөр', 'Золзаяа', 'Наранцэцэг', 'Одончимэг', 'Туяа', 'Баярмаа', 'Дөлгөөн', 'Мандухай', 'Сүхээ', 'Цолмон', 'Эрдэнэ', 'Алтанцэцэг', 'Бямбаа', 'Мөнхжин', 'Нандин'];
const LAST = ['Ганбат', 'Батсайхан', 'Дорж', 'Лхагва', 'Баттулга', 'Эрдэнэбат', 'Пүрэв', 'Содном', 'Цогт', 'Намсрай'];
const REVIEW_TEXTS: [number, string, string][] = [
  [5, 'Маш зөөлөн', 'Хүүхдийн арьсанд огт хатгахгүй, угаасан ч хэлбэрээ алдсангүй. Дахин захиална.'],
  [5, 'Чанар сайн', 'Оёдол нямбай, материал нь зүгээр л гоё. Хүргэлт хурдан ирсэн.'],
  [4, 'Загвар гоё', 'Зураг дээрх шиг сайхан харагдаж байна. Размер жаахан том гарсан тул нэг размер доошоо авахыг зөвлөе.'],
  [5, 'Төрсөн өдрийн бэлэг', 'Бэлгийн сав баглаа маш гоё байсан, төрсөн өдрийн эзэн их баярласан.'],
  [4, 'Өдөр тутамд тохиромжтой', 'Өдөр бүр өмсөж байна, хэд угаасан ч өнгө нь бүдгэрсэнгүй.'],
  [3, 'Дунд зэрэг', 'Материал нь сайн ч хэмжээ нь таамаглаж байснаас жаахан жижиг байлаа. Размерын хүснэгтээ сайн хараарай.'],
  [5, 'Өвөл дулаан', 'Улаанбаатарын хүйтэнд маш дулаан, охин минь гадаа гарахдаа өөрөө сонгож өмсдөг болсон.'],
  [5, 'Баяртай байна', 'Өнгө нь зураг дээрхтэй яг адилхан, үнэ чанартаа тохирсон.'],
  [4, 'Сайн худалдан авалт', 'Дахин авна гэж бодож байна, хүргэлтийн ажилтан эелдэг байсан.'],
  [5, 'Нярайд яг тохирно', 'Нярай хүүдээ авсан, цахилгаан товч нь эвгүй биш, солихдоо амар.'],
];

export function buildSeed(): DB {
  const r = rng(20261104); const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const now = Date.now(); const day = 86400000; const iso = (t: number) => new Date(t).toISOString();

  const categories: Category[] = GROUPS.map((g, i) => ({ id: g.id, slug: g.id, group: g.id, parent: null, name: g.name, garment: 'tee', sortOrder: i }));
  DEFS.forEach((d, i) => categories.push({ id: d.slug, slug: d.slug, group: d.group, parent: d.group, name: bi(d.cn, d.ce), garment: d.g, sortOrder: 10 + i }));

  const products: Product[] = []; let n = 0;
  const mk = (d: Def, styleIdx: number, over?: Partial<{ mn: string; en: string; price: number; fabric: number }>) => {
    n++; const s = STYLES[styleIdx]; const fab = FABRICS[over?.fabric ?? s.f];
    const mn = over?.mn ?? `${s.mn} ${d.mn}`; const en = over?.en ?? `${s.en} ${d.en}`;
    const pal = PALETTES[d.group]; const nc = d.group === 'accessories' ? 2 : 2 + Math.floor(r() * 3);
    const colors: string[] = []; while (colors.length < nc) { const c = pick(pal); if (!colors.includes(c)) colors.push(c); }
    let price = over?.price ?? Math.round((d.base * s.m) / 1000) * 1000 - 100;
    let sale: number | null = r() < 0.25 ? Math.round((price * (r() < 0.5 ? 0.8 : 0.85)) / 1000) * 1000 - 100 : null; if (sale && sale >= price) sale = null;
    const sku = `RY${d.group.slice(0, 2).toUpperCase()}${String(n).padStart(4, '0')}`;
    const variants: Variant[] = [];
    for (const c of colors) for (const sz of d.sizes) {
      const q = r(); const stock = q < 0.1 ? 0 : q < 0.25 ? 1 + Math.floor(r() * 4) : 6 + Math.floor(r() * 22);
      variants.push({ sku: `${sku}${c.slice(0, 2).toUpperCase()}${sz}`, color: c, size: sz, stock });
    }
    const looks = ['0', '1', '2'].map((v) => `art:${d.g}:${v}`);
    const wool = (over?.fabric ?? s.f) === 4;
    const desc = bi(
      `${mn[0].toUpperCase()}${mn.slice(1)}. ${fab.f.mn} материалаар хийгдсэн, ${r() < 0.5 ? 'арьсанд зөөлөн, өдөржин эвтэйхэн өмсөгдөнө' : 'хөдөлгөөнд чөлөөтэй, угаахад хэлбэрээ алдахгүй'}. Rayana загварын баг хүүхдийн өсөлт, тоглоомын хөдөлгөөнийг бодож зохиосон.`,
      `${en}. Made from ${fab.f.en.toLowerCase()}, ${r() < 0.5 ? 'soft on skin and comfortable all day' : 'free to move in and made to keep its shape wash after wash'}. Designed by the Rayana studio around how children really grow and play.`);
    const p: Product = {
      id: `prd_${String(n).padStart(3, '0')}`, sku, slug: `${slugify(en)}_${n}`, name: bi(mn[0].toUpperCase() + mn.slice(1), en), description: desc, categoryId: d.slug, group: d.group,
      price, salePrice: sale, garment: d.g, images: looks, video: null, colors, sizes: d.sizes, variants, fabric: fab.f, material: fab.m, care: wool ? WOOL_CARE : CARE,
      isNew: r() < 0.22, isBestseller: r() < 0.2, isFeatured: r() < 0.18, status: 'active', collections: [], tags: [], demo: true, createdAt: iso(now - Math.floor(r() * 120) * day), lowStockThreshold: 5,
    };
    products.push(p); return p;
  };
  for (const d of DEFS) for (const si of d.st) mk(d, si);
  const sw = DEFS.find((d) => d.slug === 'girls_sweaters')!;
  mk(sw, 4, { mn: 'Премиум ноосон кардиган', en: 'Premium Wool Cardigan', price: 159900, fabric: 4 });

  // collections
  const collections: Collection[] = [
    { id: 'spring', slug: 'spring', name: bi('Хаврын цуглуулга', 'Spring Collection'), description: bi('Цэцэглэж буй хаврын өнгө, хөнгөн хөвөн, салхинд зохицсон давхар хувцас.', 'Blooming spring tones, light cotton and layers for breezy days.'), theme: 'spring', cover: 'art:cover:spring', demo: true, season: true },
    { id: 'summer', slug: 'summer', name: bi('Зуны цуглуулга', 'Summer Collection'), description: bi('Нарлаг өдрүүдэд зориулсан сэтгэл сэргээм өнгө, амьсгалдаг даавуу.', 'Sunny colours and breathable fabrics for long bright days.'), theme: 'summer', cover: 'art:cover:summer', demo: true, season: true },
    { id: 'autumn', slug: 'autumn', name: bi('Намрын цуглуулга', 'Autumn Collection'), description: bi('Шарласан навчны өнгө, дулаан сүлжмэл, сургуулийн өдрүүдийн хослол.', 'Golden leaf tones, warm knits and back to school layers.'), theme: 'autumn', cover: 'art:cover:autumn', demo: true, season: true },
    { id: 'winter', slug: 'winter', name: bi('Өвлийн цуглуулга', 'Winter Collection'), description: bi('Монголын хүйтэнд зориулсан дулаан пуффер, ноос, флис.', 'Puffers, wool and fleece made for a Mongolian winter.'), theme: 'winter', cover: 'art:cover:winter', demo: true, season: true },
    { id: 'newborn_essentials', slug: 'newborn_essentials', name: bi('Нярайн суурь цуглуулга', 'Newborn Essentials'), description: bi('Нярайд хэрэгтэй бүх зүйл: боди, ромпер, малгай, унтлагын хослол.', 'Everything a newborn needs: bodysuits, rompers, beanies and sleepsuits.'), theme: 'newborn', cover: 'art:cover:newborn', demo: true, season: false },
    { id: 'everyday_comfort', slug: 'everyday_comfort', name: bi('Өдөр тутмын тав тух', 'Everyday Comfort'), description: bi('Өдөр бүр өмсөхөд зориулсан зөөлөн, бат бөх суурь хувцас.', 'Soft, durable basics designed to be worn every single day.'), theme: 'everyday', cover: 'art:cover:everyday', demo: true, season: false },
    { id: 'little_explorer', slug: 'little_explorer', name: bi('Бяцхан аялагч', 'Little Explorer'), description: bi('Гадаа тоглох, уул нуруугаар аялах жижигхэн судлаачдад.', 'For small adventurers who play outside and love the hills.'), theme: 'explorer', cover: 'art:cover:explorer', demo: true, season: false },
    { id: 'party_occasion', slug: 'party_occasion', name: bi('Баяр ёслол', 'Party and Occasion'), description: bi('Төрсөн өдөр, цагаан сар, гэр бүлийн баярт зориулсан нэгэн өнгө.', 'Birthdays, Tsagaan Sar and family celebrations.'), theme: 'party', cover: 'art:cover:party', demo: true, season: false },
    { id: 'school', slug: 'school', name: bi('Сургуулийн цуглуулга', 'School Collection'), description: bi('Өдөржин сууж, тоглож, гүйхэд эвтэйхэн сургуулийн хувцас.', 'School day outfits that sit, run and play comfortably.'), theme: 'school', cover: 'art:cover:school', demo: true, season: false },
    { id: 'cozy_winter', slug: 'cozy_winter', name: bi('Дулаан өвөл', 'Cozy Winter'), description: bi('Свитер, малгай, бээлий, ороолт: бүгд хоорондоо зохицно.', 'Sweaters, hats, gloves and scarves that all match.'), theme: 'cozy', cover: 'art:cover:cozy', demo: true, season: false },
    { id: 'matching_family', slug: 'matching_family', name: bi('Гэр бүлийн нэг загвар', 'Matching Family Outfits'), description: bi('Ах дүү, ээж аавтайгаа нэг өнгөөр хослох иж бүрдлүүд.', 'Sets for siblings that match with the whole family.'), theme: 'family', cover: 'art:cover:family', demo: true, season: false },
  ];
  const warm = ['jacket', 'puffer', 'sweater', 'hoodie', 'tracksuit', 'scarf', 'gloves'];
  const rules: Record<string, (p: Product) => boolean> = {
    spring: (p) => ['dress', 'tee', 'shirt', 'skirt', 'leggings', 'longsleeve', 'jacket'].includes(p.garment) && !p.name.en.startsWith('Cozy'),
    summer: (p) => ['dress', 'tee', 'shorts', 'skirt', 'romper', 'bodysuit', 'hat', 'socks'].includes(p.garment),
    autumn: (p) => ['sweater', 'hoodie', 'pants', 'jacket', 'shirt', 'longsleeve', 'bag', 'shoes'].includes(p.garment),
    winter: (p) => warm.includes(p.garment) || p.fabric.en.includes('wool'),
    newborn_essentials: (p) => p.group === 'baby',
    everyday_comfort: (p) => p.name.en.startsWith('Everyday') || p.name.en.startsWith('Soft') || p.categoryId.startsWith('unisex_'),
    little_explorer: (p) => ['jacket', 'puffer', 'pants', 'shoes', 'bag', 'hoodie', 'shorts'].includes(p.garment) && p.group !== 'girls',
    party_occasion: (p) => ['dress', 'shirt', 'skirt', 'babyset'].includes(p.garment) || p.name.en.startsWith('Premium'),
    school: (p) => ['shirt', 'pants', 'sweater', 'bag', 'shoes', 'socks', 'tee'].includes(p.garment) && p.group !== 'baby',
    cozy_winter: (p) => ['sweater', 'hat', 'gloves', 'scarf', 'hoodie', 'puffer'].includes(p.garment),
    matching_family: (p) => ['set', 'tracksuit', 'babyset'].includes(p.garment) || p.name.en.includes('Striped'),
  };
  for (const c of collections) {
    const ps = products.filter(rules[c.id]); ps.forEach((p) => p.collections.push(c.id));
  }
  products.forEach((p, i) => { if (!p.collections.length) p.collections.push('everyday_comfort'); if (i % 9 === 0) p.tags.push('offer'); });

  // customers
  const users: User[] = [];
  const pwHash = hashPassword(DEMO_CUSTOMER_PASSWORD);
  users.push({ id: 'usr_admin', email: DEMO_ADMIN.email, passHash: hashPassword(DEMO_ADMIN.password), name: 'Rayana Админ', phone: '99001122', role: 'admin', createdAt: iso(now - 200 * day), demo: true, addresses: [], children: [], wishlist: [], notifications: [], lang: 'mn' });
  const latin = ['oyunaa', 'nomin', 'sarangerel', 'bolormaa', 'enkhjin', 'munkhzul', 'anujin', 'tsetsegmaa', 'urantuya', 'khulan', 'temuulen', 'bilguun', 'ganzorig', 'amarbayar', 'bold', 'tuguldur', 'zolzaya', 'narantsetseg', 'odonchimeg', 'tuya', 'bayarmaa', 'dulguun', 'mandukhai', 'sukhee', 'tsolmon', 'erdene', 'altantsetseg', 'byambaa', 'munkhjin', 'nandin'];
  for (let i = 0; i < 30; i++) {
    const d = pick(DISTRICTS); const phone = `${pick(['99', '95', '88', '91', '94'])}${String(Math.floor(r() * 1e6)).padStart(6, '0')}`;
    users.push({
      id: `usr_${String(i + 1).padStart(3, '0')}`, email: `${latin[i]}${i + 1}@rayana.demo`, passHash: pwHash, name: `${FIRST[i]} ${pick(LAST)}`, phone, role: 'customer', createdAt: iso(now - Math.floor(30 + r() * 150) * day), demo: true,
      addresses: [{ id: `adr_${i + 1}`, label: 'Гэр', recipient: FIRST[i], phone, district: d, address: `${d} дүүрэг, ${1 + Math.floor(r() * 30)}р хороо, ${1 + Math.floor(r() * 90)} байр, ${1 + Math.floor(r() * 120)} тоот`, notes: '' }],
      children: r() < 0.5 ? [{ id: `chd_${i + 1}`, name: pick(['Аруул', 'Тэмүүжин', 'Мишээл', 'Сүүдэр', 'Саруул', 'Хонгор']), birthYear: 2026 - 1 - Math.floor(r() * 8), birthMonth: 1 + Math.floor(r() * 12), heightCm: 80 + Math.floor(r() * 50), weightKg: null }] : [],
      wishlist: [pick(products).id, pick(products).id], notifications: [], lang: 'mn',
    });
  }

  // discount codes
  const code = (id: string, c: string, kind: DiscountCode['kind'], value: number, min: number, mn: string, en: string, extra?: Partial<DiscountCode>): DiscountCode => ({ id, code: c, kind, value, minSubtotal: min, active: true, expiresAt: null, usageLimit: null, used: 0, description: bi(mn, en), demo: true, ...extra });
  const codes: DiscountCode[] = [
    code('c1', 'RAYANA10', 'percent', 10, 50000, '50,000₮ ба түүнээс дээш худалдан авалтад 10% хөнгөлөлт', '10% off orders over 50,000₮'),
    code('c2', 'WELCOME15', 'new_customer', 15, 0, 'Шинэ хэрэглэгчийн эхний захиалгад 15% хөнгөлөлт', '15% off your first order'),
    code('c3', 'SPRING20', 'percent', 20, 100000, 'Хаврын хямдрал: 100,000₮ дээш 20%', 'Spring sale: 20% off over 100,000₮'),
    code('c4', 'FREESHIP', 'free_delivery', 0, 0, 'Үнэгүй хүргэлт', 'Free delivery'),
    code('c5', 'BUY2GET1', 'b2g1', 0, 0, '3 ширхэг авбал хамгийн хямд нь үнэгүй', 'Buy 2 get the 3rd (cheapest) free'),
    code('c6', 'MINUS10K', 'fixed', 10000, 80000, '80,000₮ дээш захиалгад 10,000₮ хөнгөлөлт', '10,000₮ off orders over 80,000₮'),
    code('c7', 'KIDS25', 'percent', 25, 150000, '150,000₮ дээш захиалгад 25% хөнгөлөлт', '25% off orders over 150,000₮', { usageLimit: 50 }),
    code('c8', 'WINTER30', 'percent', 30, 250000, 'Өвлийн урамшуулал: 250,000₮ дээш 30%', 'Winter offer: 30% off over 250,000₮', { usageLimit: 20 }),
    code('c9', 'GIFT5K', 'fixed', 5000, 30000, '30,000₮ дээш захиалгад 5,000₮ хөнгөлөлт', '5,000₮ off orders over 30,000₮'),
    code('c10', 'OLD2025', 'percent', 40, 0, 'Хугацаа дууссан код (жишээ)', 'Expired sample code', { expiresAt: iso(now - 200 * day) }),
  ] as DiscountCode[];

  const settings: Settings = {
    storeName: 'Rayana', freeDeliveryThreshold: 150000, giftWrapFee: 5000,
    pickup: { enabled: true, address: bi('Улаанбаатар, Сүхбаатар дүүрэг, 1р хороо, Rayana шоурум (жишээ хаяг)', 'Ulaanbaatar, Sukhbaatar District, Rayana showroom (sample address)'), eta: bi('Өнөөдөр буюу маргааш авах боломжтой', 'Ready for pickup same or next day') },
    zones: [
      { id: 'zA', name: bi('Төв бүс', 'Central zone'), districts: ['Сүхбаатар', 'Чингэлтэй', 'Баянгол'], fee: 5000, eta: bi('Захиалснаас хойш 1 өдөр', '1 day after ordering'), active: true },
      { id: 'zB', name: bi('Дундад бүс', 'Middle zone'), districts: ['Хан Уул', 'Баянзүрх'], fee: 7000, eta: bi('1 өдөр', '1 day'), active: true },
      { id: 'zC', name: bi('Баруун бүс', 'West zone'), districts: ['Сонгинохайрхан'], fee: 8000, eta: bi('1 ~ 2 өдөр', '1 to 2 days'), active: true },
      { id: 'zD', name: bi('Алслагдсан бүс', 'Outer zone'), districts: ['Налайх', 'Багануур', 'Багахангай'], fee: 15000, eta: bi('2 ~ 3 өдөр', '2 to 3 days'), active: true },
    ] as DeliveryZone[],
    newCustomerCode: 'WELCOME15',
    contact: { phone: '7700 0000', email: 'hello@rayana.demo', address: bi('Улаанбаатар хот (жишээ хаяг)', 'Ulaanbaatar (sample address)'), hours: bi('Даваа Бямба 10:00 ~ 20:00', 'Mon to Sat 10:00 to 20:00') },
    home: { heroBannerIds: ['b1', 'b2', 'b3'], showSections: { newArrivals: true, bestSellers: true, byAge: true, byCategory: true, collections: true, essentials: true, premium: true, offers: true, lookbook: true, reviews: true, gallery: true, newsletter: true, story: true }, storyTitle: bi('Rayana: өсөж буй бяцхан хүмүүст', 'Rayana: for small people who are growing'), storyBody: bi('Rayana бол Монголын хүүхдүүдэд зориулсан хувцасны брэнд. Бид зөөлөн, аюулгүй материалыг сонгож, хөдөлгөөнд чөлөөтэй загвар зохиодог. Өвөл хүйтэн, зун нарлаг Монголын улирлыг бодож, эцэг эхчүүдэд итгэл төрүүлэх чанартай хувцсыг л санал болгоно.', 'Rayana is a children’s clothing label made with Mongolian families in mind. We choose soft, safe materials and design for free movement, always thinking of long cold winters and short bright summers.') },
    sizes: ALL_SIZES, ageGroups: AGE_GROUPS, colors: COLORS, bank: { name: 'Жишээ банк (DEMO)', account: '0000 0000 00', holder: 'Rayana DEMO' },
  };
  const banners: Banner[] = [
    { id: 'b1', title: bi('Намрын шинэ цуглуулга', 'New Autumn Collection'), subtitle: bi('Дулаан сүлжмэл, зөөлөн хөвөн, сургуулийн өдрүүдэд зориулав', 'Warm knits and soft cotton for school days'), cta: bi('Цуглуулгыг үзэх', 'Shop the collection'), href: '/collections/autumn', theme: 'autumn', active: true, placement: 'hero' },
    { id: 'b2', title: bi('Нярайн суурь цуглуулга', 'Newborn Essentials'), subtitle: bi('Анхны өдрүүдэд хамгийн зөөлөн хувцас', 'The softest clothes for the very first days'), cta: bi('Нярайн хувцас', 'Shop newborn'), href: '/collections/newborn_essentials', theme: 'newborn', active: true, placement: 'hero' },
    { id: 'b3', title: bi('Өвөл ойртлоо', 'Winter is coming'), subtitle: bi('Пуффер, ноос, флис: хүйтнээс хамгаалах бүрэн иж бүрдэл', 'Puffers, wool and fleece for the whole cold season'), cta: bi('Өвлийн цуглуулга', 'Shop winter'), href: '/collections/winter', theme: 'winter', active: true, placement: 'hero' },
    { id: 'b4', title: bi('150,000₮ дээш захиалгад хүргэлт үнэгүй', 'Free delivery over 150,000₮'), subtitle: bi('', ''), cta: bi('', ''), href: '/shop', theme: 'strip', active: true, placement: 'strip' },
    { id: 'b5', title: bi('3 ширхэг авбал 1 нь үнэгүй', 'Buy 2 get 1 free'), subtitle: bi('BUY2GET1 кодыг сагсандаа оруулна уу', 'Use code BUY2GET1 at checkout'), cta: bi('Үзэх', 'Shop now'), href: '/shop?sale=1', theme: 'offer1', active: true, placement: 'offer' },
    { id: 'b6', title: bi('Шинэ хэрэглэгчид 15%', '15% for new customers'), subtitle: bi('WELCOME15 код', 'Code WELCOME15'), cta: bi('Бүртгүүлэх', 'Join now'), href: '/register', theme: 'offer2', active: true, placement: 'offer' },
  ];
  const bundles = [
    { id: 'bn1', name: bi('Нярайн анхны иж бүрдэл', 'Newborn starter bundle'), productIds: products.filter((p) => p.categoryId === 'baby_bodysuits').slice(0, 1).concat(products.filter((p) => p.categoryId === 'baby_accessories').slice(0, 1), products.filter((p) => p.categoryId === 'baby_sleepsuits').slice(0, 1)).map((p) => p.id), price: 0, active: true },
  ];
  const bsum = bundles[0].productIds.reduce((s, id) => { const p = products.find((x) => x.id === id)!; return s + (p.salePrice ?? p.price); }, 0);
  bundles[0].price = Math.round((bsum * 0.85) / 1000) * 1000 - 100;

  // orders
  const orders: Order[] = []; const stockMoves: StockMove[] = []; let seq = 1000;
  const statuses: OrderStatus[] = ['delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'packed', 'preparing', 'preparing', 'payment_confirmed', 'payment_confirmed', 'payment_pending', 'payment_pending', 'new', 'new', 'cancelled', 'return_requested'];
  const methods: PayMethod[] = ['qpay', 'socialpay', 'bank', 'cod'];
  const zones = settings.zones;
  for (let i = 0; i < 40; i++) {
    const u = users[1 + Math.floor(r() * 30)]; const items: OrderItem[] = []; const k = 1 + Math.floor(r() * 3);
    const status = statuses[i % statuses.length] as OrderStatus; const needStock = ['payment_confirmed', 'preparing', 'packed', 'shipped', 'delivered', 'return_requested'].includes(status);
    for (let j = 0; j < k; j++) {
      const p = pick(products); const vs = p.variants.filter((v) => v.stock >= 3); if (!vs.length) continue; const v = pick(vs); const qty = 1 + Math.floor(r() * 2);
      const cd = COLORS.find((c) => c.id === v.color)!;
      items.push({ productId: p.id, sku: v.sku, name: p.name, color: v.color, colorName: cd.name, size: v.size, qty, unitPrice: p.salePrice ?? p.price, listPrice: p.price });
      if (needStock) v.stock = Math.max(0, v.stock - qty);
    }
    if (!items.length) continue;
    const subtotal = items.reduce((s, x) => s + x.unitPrice * x.qty, 0); const a = u.addresses[0]; const zone = zones.find((z) => z.districts.includes(a.district))!;
    const fee = subtotal >= settings.freeDeliveryThreshold ? 0 : zone.fee; const method = pick(methods);
    const created = now - Math.floor(r() * 75) * day - Math.floor(r() * day); seq++;
    const confirmed = needStock; const pay: Order['payment'] = { method, status: confirmed ? (method === 'cod' ? 'cod_collected' : 'confirmed') : method === 'cod' ? 'cod_due' : status === 'payment_pending' ? 'customer_reported' : 'pending', demo: true, reference: `DEMO${seq}` };
    const tl: Order['timeline'] = [{ at: iso(created), status: 'new', text: 'Захиалга үүсгэсэн (DEMO)' }];
    if (confirmed) tl.push({ at: iso(created + 3600000), status: 'payment_confirmed', text: 'Төлбөр баталгаажсан (DEMO)' });
    const o: Order = {
      id: `ord_${String(seq)}`, number: `RY${seq}`, userId: u.id, accessToken: randomBytes(12).toString('hex'), customer: { name: u.name, phone: u.phone, email: u.email }, items, subtotal, discount: 0, deliveryFee: fee, giftWrap: 0, total: subtotal + fee,
      discountCode: null, delivery: { type: 'delivery', district: a.district, address: a.address, notes: '', zoneId: zone.id, eta: zone.eta.mn }, payment: pay, status, timeline: tl, adminNotes: [], giftWrapOn: false, stockDeducted: needStock,
      returnRequest: status === 'return_requested' ? { at: iso(created + 5 * day), reason: 'Размер таарсангүй', status: 'requested' } : null, createdAt: iso(created), demo: true,
    };
    if (status === 'cancelled') { o.timeline.push({ at: iso(created + 7200000), status: 'cancelled', text: 'Захиалга цуцлагдсан' }); }
    else { const flow: OrderStatus[] = ['preparing', 'packed', 'shipped', 'delivered']; const upto = status === 'return_requested' ? 3 : flow.indexOf(status); flow.forEach((st, k) => { if (k <= upto) o.timeline.push({ at: iso(created + (k + 2) * 6 * 3600000), status: st, text: '' }); }); if (status === 'return_requested') o.timeline.push({ at: iso(created + 5 * day), status: 'return_requested', text: '' }); }
    if (needStock) for (const it of items) stockMoves.push({ id: `mv_${stockMoves.length + 1}`, at: iso(created + 3600000), sku: it.sku, productId: it.productId, delta: -it.qty, reason: 'order_confirmed', ref: o.number, by: 'demo', note: 'DEMO' });
    orders.push(o);
  }
  // reviews from delivered orders
  const reviews: Review[] = []; const delivered = orders.filter((o) => o.status === 'delivered');
  for (let i = 0; i < 20; i++) {
    const o = delivered[i % delivered.length]; const it = o.items[0]; const t = REVIEW_TEXTS[i % REVIEW_TEXTS.length];
    reviews.push({ id: `rev_${i + 1}`, productId: it.productId, userId: o.userId!, authorName: o.customer.name.split(' ')[0], rating: t[0], title: t[1], body: t[2], photos: [], verified: true, status: i === 19 ? 'pending' : 'approved', createdAt: iso(now - Math.floor(r() * 50) * day), demo: true });
  }
  // initial stock record
  const used: Record<string, number> = {}; for (const m of stockMoves) used[m.sku] = (used[m.sku] ?? 0) - m.delta;
  for (const p of products) for (const v of p.variants) stockMoves.unshift({ id: `mv_init_${v.sku}`, at: iso(now - 90 * day), sku: v.sku, productId: p.id, delta: v.stock + (used[v.sku] ?? 0), reason: 'initial', ref: 'seed', by: 'demo', note: 'DEMO' });

  return { version: 1, seededAt: iso(now), settings, categories, products, collections, users, orders, reviews, codes, bundles, banners, stockMoves, abandoned: [], subscribers: [], orderSeq: seq };
}
void createHash;
