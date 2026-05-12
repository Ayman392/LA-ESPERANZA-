import { Link } from 'react-router-dom';
import { Ban, ShoppingBag } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-luxury-black text-ivory flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-luxury-gray/20 bg-luxury-gray/5 mb-8">
          <Ban size={44} className="text-luxury-gray/40" />
        </div>

        <p className="text-luxury-gray/50 text-[11px] tracking-[0.5em] uppercase mb-3">Payment Cancelled</p>
        <h1 className="font-serif text-5xl text-ivory mb-6 leading-snug">
          Order Cancelled
        </h1>
        <p className="text-luxury-gray text-base leading-relaxed mb-10">
          You cancelled the payment process. Your cart is still intact — you can return and complete your purchase whenever you're ready.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/cart"
            className="flex items-center gap-3 btn-gold"
          >
            <ShoppingBag size={14} /> Return to Cart
          </Link>
          <Link
            to="/products"
            className="text-luxury-gray hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors"
          >
            Browse Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
