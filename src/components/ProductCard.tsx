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
  const { addItem } = useCartStore();

  const effectivePrice = product.discounted_price ?? product.price;
  const defaultSize = product.sizes[0]?.size ?? '50ml';

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
        className="group relative bg-luxury-card border border-[#E7E5E4] shadow-sm h-[550px] p-4 border-white/[0.06] hover:border-gold-accent/30 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
      >
        {/* Discount badge */}
        {product.discounted_price && (
          <div className="absolute top-8 left-8 z-10 bg-gold text-luxury-black text-[15px] rounded-xl font-bold tracking-wider px-2 py-1">
            -{getDiscountPercent(product.price, product.discounted_price)}%
          </div>
        )}

        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-luxury-card h-[320px] w-full rounded-2xl">
          <img
            src={product.cover_image}
            alt={product.name}
            loading="lazy"
            className="w-full h-96 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Overlay on hover */}
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

        {/* Info */}
        <div className="p-4">
          <p className="text-luxury-black text-[25px] tracking-[0.5em] uppercase mb-1.5">
            {product.category}
          </p>
          <h3 className="text-ivory font-serif text-base mb-2 leading-snug group-hover:text-gold-accent transition-colors duration-200">
            {product.name}
          </h3>

          {/* Fragrance notes preview */}
          <p className="text-luxury-gray/60 text-xs mb-3 line-clamp-1">
            {product.fragrance_notes.top.join(', ')}
          </p>

          {/* Sizes */}
          <div className="flex items-center gap-1.5 mb-3">
            {product.sizes.map((s) => (
              <span
                key={s.size}
                className="text-[15px] text-luxury-black border border-black/[0.08] px-2.5 py-0.5 rounded-xl"
              >
                {s.size}
              </span>
            ))}
          </div>

          {/* Price */}
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
