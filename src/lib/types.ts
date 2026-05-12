// Core domain types for LA ESPERANZA

export interface FragranceNotes {
  top: string[];
  middle: string[];
  base: string[];
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discounted_price: number | null;
  category: string;
  gender: string;
  fragrance_notes: FragranceNotes;
  sizes: ProductSize[];
  featured: boolean;
  is_active: boolean;
  cover_image: string;
  images?: ProductImage[];
  reviews?: Review[];
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  delivery_note: string;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  delivery_status: 'pending' | 'processing' | 'shipped' | 'delivered';
  transaction_id: string;
  val_id: string;
  payment_method: string;
  items?: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  is_admin: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

export interface CheckoutForm {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  delivery_note: string;
}
