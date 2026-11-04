export type Lang = 'mn' | 'en';
export interface Bi { mn: string; en: string }
export interface Category { id: string; slug: string; group: Group; parent: string | null; name: Bi; garment: string; sortOrder: number }
export type Group = 'baby' | 'girls' | 'boys' | 'unisex' | 'accessories';
export interface ColorDef { id: string; name: Bi; hex: string }
export interface Variant { sku: string; color: string; size: string; stock: number }
export interface Product {
  id: string; sku: string; slug: string; name: Bi; description: Bi; categoryId: string; group: Group;
  price: number; salePrice: number | null; garment: string; images: string[]; video: string | null;
  colors: string[]; sizes: string[]; variants: Variant[];
  fabric: Bi; material: Bi; care: Bi;
  isNew: boolean; isBestseller: boolean; isFeatured: boolean; status: 'active' | 'draft';
  collections: string[]; tags: string[]; demo: boolean; createdAt: string; lowStockThreshold: number;
}
export interface Collection { id: string; slug: string; name: Bi; description: Bi; theme: string; cover: string; demo: boolean; season: boolean }
export interface Address { id: string; label: string; recipient: string; phone: string; district: string; address: string; notes: string }
export interface Child { id: string; name: string; birthYear: number; birthMonth: number; heightCm: number | null; weightKg: number | null }
export interface Notification { id: string; at: string; text: Bi; read: boolean; orderId?: string }
export interface User {
  id: string; email: string; passHash: string; name: string; phone: string; role: 'customer' | 'admin'; createdAt: string; demo: boolean;
  addresses: Address[]; children: Child[]; wishlist: string[]; notifications: Notification[]; lang: Lang;
}
export type OrderStatus = 'new' | 'payment_pending' | 'payment_confirmed' | 'preparing' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'return_requested';
export type PayMethod = 'qpay' | 'socialpay' | 'bank' | 'cod';
export interface OrderItem { productId: string; sku: string; name: Bi; color: string; colorName: Bi; size: string; qty: number; unitPrice: number; listPrice: number }
export interface Order {
  id: string; number: string; userId: string | null; accessToken: string; customer: { name: string; phone: string; email: string };
  items: OrderItem[]; subtotal: number; discount: number; deliveryFee: number; giftWrap: number; total: number;
  discountCode: string | null; delivery: { type: 'delivery' | 'pickup'; district: string; address: string; notes: string; zoneId: string | null; eta: string };
  payment: { method: PayMethod; status: 'pending' | 'customer_reported' | 'confirmed' | 'cod_due' | 'cod_collected' | 'refunded'; demo: boolean; reference: string; confirmedAt?: string };
  status: OrderStatus; timeline: { at: string; status: OrderStatus | 'note'; text: string }[]; adminNotes: { at: string; by: string; text: string }[];
  giftWrapOn: boolean; stockDeducted: boolean; returnRequest?: { at: string; reason: string; status: 'requested' | 'approved' | 'rejected' | 'received' } | null;
  createdAt: string; demo: boolean;
}
export interface Review { id: string; productId: string; userId: string; authorName: string; rating: number; title: string; body: string; photos: string[]; verified: boolean; status: 'pending' | 'approved' | 'hidden'; createdAt: string; editedAt?: string; demo: boolean }
export interface DiscountCode {
  id: string; code: string; kind: 'percent' | 'fixed' | 'free_delivery' | 'b2g1' | 'new_customer'; value: number; minSubtotal: number;
  active: boolean; expiresAt: string | null; usageLimit: number | null; used: number; description: Bi; demo: boolean;
}
export interface Bundle { id: string; name: Bi; productIds: string[]; price: number; active: boolean }
export interface Banner { id: string; title: Bi; subtitle: Bi; cta: Bi; href: string; theme: string; active: boolean; placement: 'hero' | 'strip' | 'offer' }
export interface DeliveryZone { id: string; name: Bi; districts: string[]; fee: number; eta: Bi; active: boolean }
export interface StockMove { id: string; at: string; sku: string; productId: string; delta: number; reason: 'order_confirmed' | 'order_cancelled' | 'manual_adjust' | 'initial' | 'return_restock'; ref: string; by: string; note: string }
export interface AbandonedCart { id: string; email: string; items: { productId: string; color: string; size: string; qty: number }[]; at: string; value: number; recovered: boolean }
export interface Settings {
  storeName: string; freeDeliveryThreshold: number; giftWrapFee: number; pickup: { enabled: boolean; address: Bi; eta: Bi };
  zones: DeliveryZone[]; newCustomerCode: string; contact: { phone: string; email: string; address: Bi; hours: Bi };
  home: { heroBannerIds: string[]; showSections: Record<string, boolean>; storyTitle: Bi; storyBody: Bi };
  sizes: string[]; ageGroups: AgeGroup[]; colors: ColorDef[]; bank: { name: string; account: string; holder: string };
}
export interface AgeGroup { id: string; name: Bi; minM: number; maxM: number; sizes: string[] }
export interface Subscriber { email: string; at: string }
export interface DB {
  version: number; seededAt: string; settings: Settings; categories: Category[]; products: Product[]; collections: Collection[];
  users: User[]; orders: Order[]; reviews: Review[]; codes: DiscountCode[]; bundles: Bundle[]; banners: Banner[];
  stockMoves: StockMove[]; abandoned: AbandonedCart[]; subscribers: Subscriber[]; orderSeq: number;
}
export const ORDER_STATUSES: OrderStatus[] = ['new', 'payment_pending', 'payment_confirmed', 'preparing', 'packed', 'shipped', 'delivered', 'cancelled', 'return_requested'];
