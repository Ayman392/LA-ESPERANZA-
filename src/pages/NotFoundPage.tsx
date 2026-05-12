import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-luxury-black text-ivory flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <p className="text-gold/20 font-serif text-[120px] md:text-[180px] leading-none select-none">
          404
        </p>
        <h1 className="font-serif text-3xl text-ivory -mt-6 mb-4">Page Not Found</h1>
        <p className="text-luxury-gray text-sm leading-relaxed mb-10">
          The page you are looking for has moved or doesn't exist. Let us guide you back to luxury.
        </p>
        <Link
          to="/"
          className="group inline-flex items-center gap-3 btn-gold"
        >
          Back to Home
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
