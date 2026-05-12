// Utility helpers

export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString('en-BD')}`;
}

export function getDiscountPercent(price: number, discounted: number): number {
  return Math.round(((price - discounted) / price) * 100);
}

export function generateTransactionId(): string {
  return `LAES-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export const DELIVERY_CHARGE = 120; // BDT

export const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'oriental', label: 'Oriental' },
  { value: 'floral', label: 'Floral' },
  { value: 'woody', label: 'Woody' },
  { value: 'fresh', label: 'Fresh' },
  { value: 'aquatic', label: 'Aquatic' },
];

export const GENDER_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
];
