import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const transactionId = params.get('tran_id') ?? params.get('transaction_id') ?? '';

  return (
    <div className="min-h-screen bg-luxury-black text-ivory flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border border-gold/30 bg-gold/10 mb-8 animate-glow-pulse">
          <CheckCircle size={44} className="text-gold" />
        </div>

        <p className="text-gold/60 text-[11px] tracking-[0.5em] uppercase mb-3">Payment Confirmed</p>
        <h1 className="font-serif text-5xl text-ivory mb-6 leading-snug">
          Your Order is Placed
        </h1>
        <p className="text-luxury-gray text-base leading-relaxed mb-8">
          Thank you for choosing LA ESPERANZA. Your exquisite fragrances are being prepared with the utmost care and will be dispatched shortly.
        </p>

        {transactionId && (
          <div className="border border-gold/20 bg-gold/5 px-6 py-4 mb-10 inline-block">
            <p className="text-luxury-gray/50 text-xs tracking-wider uppercase mb-1">Transaction ID</p>
            <p className="text-gold font-mono text-sm">{transactionId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="group flex items-center gap-3 btn-gold"
          >
            View Orders <ArrowRight size={14} />
          </Link>
          <Link
            to="/products"
            className="text-luxury-gray hover:text-gold text-xs tracking-[0.2em] uppercase transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
