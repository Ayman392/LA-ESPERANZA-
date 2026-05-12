import { Link } from 'react-router-dom';
import { XCircle, RefreshCcw, ArrowLeft } from 'lucide-react';

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-luxury-black text-ivory flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-900/10 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-red-500/30 bg-red-500/10 mb-8">
          <XCircle size={44} className="text-red-400" />
        </div>

        <p className="text-red-400/60 text-[11px] tracking-[0.5em] uppercase mb-3">Payment Failed</p>
        <h1 className="font-serif text-5xl text-ivory mb-6 leading-snug">
          Transaction Unsuccessful
        </h1>
        <p className="text-luxury-gray text-base leading-relaxed mb-10">
          We were unable to process your payment. Your order has not been placed. Please try again or use a different payment method.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/checkout"
            className="flex items-center gap-3 btn-gold"
          >
            <RefreshCcw size={14} /> Try Again
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-2 text-luxury-gray hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors"
          >
            <ArrowLeft size={14} /> Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
