import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { formatPrice, DELIVERY_CHARGE } from '../lib/utils';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-black text-ivory pt-20 flex flex-col items-center justify-center px-6">
        <ShoppingBag size={48} className="text-luxury-gray/20 mb-6" />
        <h2 className="font-serif text-3xl text-ivory mb-3">Your Cart is Empty</h2>
        <p className="text-luxury-gray text-sm mb-8">Discover our exquisite fragrance collection</p>
        <Link
          to="/products"
          className="group flex items-center gap-3 btn-gold"
        >
          Explore Collections <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black text-ivory pt-20">
      <div className="border-b border-white/[0.06] py-12 text-center">
        <h1 className="font-serif text-4xl text-ivory">Your Cart</h1>
        <div className="section-divider" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Cart items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="hidden sm:grid grid-cols-12 text-[10px] tracking-[0.25em] uppercase text-luxury-gray/50 border-b border-white/[0.06] pb-4">
              <span className="col-span-6">Product</span>
              <span className="col-span-2 text-center">Size</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            {items.map((item) => (
              <div
                key={`${item.product_id}-${item.size}`}
                className="grid grid-cols-12 gap-4 items-center border-b border-white/[0.06] pb-6"
              >
                <div className="col-span-12 sm:col-span-6 flex items-center gap-4">
                  <div className="w-20 h-20 flex-shrink-0 overflow-hidden border border-white/[0.08] bg-luxury-card">
                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-ivory text-sm font-medium leading-snug">{item.product_name}</p>
                    <p className="text-gold text-sm mt-1">{formatPrice(item.unit_price)}</p>
                    <p className="sm:hidden text-luxury-gray/50 text-xs mt-1">{item.size}</p>
                  </div>
                </div>

                <div className="hidden sm:flex col-span-2 justify-center">
                  <span className="text-luxury-gray/50 text-xs border border-white/[0.08] px-2 py-1">{item.size}</span>
                </div>

                <div className="col-span-8 sm:col-span-2 flex items-center justify-start sm:justify-center">
                  <div className="inline-flex items-center border border-white/[0.1]">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                      className="p-2 text-luxury-gray/50 hover:text-gold transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-ivory text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                      className="p-2 text-luxury-gray/50 hover:text-gold transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-3">
                  <span className="text-gold text-sm">{formatPrice(item.unit_price * item.quantity)}</span>
                  <button
                    onClick={() => removeItem(item.product_id, item.size)}
                    className="text-luxury-gray/30 hover:text-red-400 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-luxury-gray/50 hover:text-gold text-xs tracking-wider transition-colors mt-4"
            >
              &larr; Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-luxury-card border border-white/[0.08] p-7 sticky top-28 shadow-card">
              <h2 className="font-serif text-xl text-ivory mb-7">Order Summary</h2>

              <div className="space-y-4 mb-7">
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-gray">Subtotal</span>
                  <span className="text-ivory">{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-luxury-gray">Delivery</span>
                  <span className="text-ivory">{formatPrice(DELIVERY_CHARGE)}</span>
                </div>
                <div className="border-t border-white/[0.08] pt-4 flex justify-between">
                  <span className="text-ivory font-medium">Grand Total</span>
                  <span className="text-gold text-lg">{formatPrice(total())}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-3 btn-gold"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
