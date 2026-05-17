import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import type { Product } from '../lib/types';
import { formatPrice, getDiscountPercent } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import Toast from './Toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const [toastMsg, setToastMsg] = useState('');
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCartStore();

  const effectivePrice = product.discounted_price ?? product.price;
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const topNotes = Array.isArray(product.fragrance_notes?.top) ? product.fragrance_notes.top : [];
  const defaultSize = sizes[0]?.size ?? '50ml';
  const inspiredBy = (product as any).inspired_by ?? (product as any).inspiredBy ?? '';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.cover_image,
      size: defaultSize,
      quantity: 1,
      unit_price: effectivePrice,
    });
    setToastMsg('Added to cart');
  };

  return (
    <>
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}
      <Link
        to={`/products/${product.slug}`}
        className="group relative bg-luxury-card border border-[#E7E5E4] shadow-sm h-[580px] p-4 border-white/[0.06] hover:border-gold-accent/30 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
      >
        {product.discounted_price && (
          <div className="absolute top-8 left-8 z-10 bg-gold text-luxury-black text-[15px] rounded-xl font-bold tracking-wider px-2 py-1">
            -{getDiscountPercent(product.price, product.discounted_price)}%
          </div>
        )}

        <div className="relative overflow-hidden aspect-[3/4] bg-luxury-card h-[320px] w-full rounded-2xl">
          {product.cover_image && !imageError ? (
            <img
              src={product.cover_image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-luxury-black via-luxury-card to-luxury-black border border-gold/20 text-center px-6">
              <span className="text-gold/70 text-[10px] tracking-[0.4em] uppercase mb-3">LA ESPERANZA</span>
              <span className="font-serif text-3xl text-ivory">{product.name}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-luxury-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={handleAddToCart}
              className="bg-gold text-luxury-black p-4 rounded-full hover:bg-gold-hover transition-all duration-200 transform translate-y-4 group-hover:translate-y-0 shadow-gold"
              aria-label="Add to cart"
            >
              <ShoppingBag size={20} />
            </button>

            <Link
              to={`/products/${product.slug}`}
              className="bg-white/10 backdrop-blur-sm text-ivory p-4 rounded-full hover:bg-white/20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200 delay-75"
              aria-label="Quick view"
            >
              <Eye size={20} />
            </Link>
          </div>
        </div>

        <div className="p-4">
          <p className="text-luxury-black text-[16px] tracking-[0.35em] uppercase mb-1.5">
            {product.category}
          </p>

          <h3 className="text-ivory font-serif text-lg mb-1 leading-snug group-hover:text-gold-accent transition-colors duration-200">
            {product.name}
          </h3>

          {inspiredBy && (
            <p className="text-black text-md italic font-semibold mb-3">
              Inspired by {inspiredBy}
            </p>
          )}

          <p className="text-black text-lg mb-3 line-clamp-1">
            {topNotes.join(', ')}
          </p>

          <div className="flex items-center gap-1.5 mb-3">
            {sizes.map((s) => (
              <span
                key={s.size}
                className="text-[15px] text-luxury-black border border-black/[0.08] px-2.5 py-0.5 rounded-xl"
              >
                {s.size}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gold font-medium text-base">
              {formatPrice(effectivePrice)}
            </span>

            {product.discounted_price && (
              <span className="text-luxury-black/50 text-sm line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}