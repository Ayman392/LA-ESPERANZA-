import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface Props {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'success', onClose, duration = 3000 }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed bottom-20 right-6 z-[200] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-sm shadow-card backdrop-blur-md border ${
        type === 'success'
          ? 'bg-luxury-card/95 border-gold/30 text-ivory'
          : 'bg-luxury-card/95 border-red-500/30 text-ivory'
      }`}>
        {type === 'success' ? (
          <CheckCircle size={16} className="text-gold flex-shrink-0" />
        ) : (
          <XCircle size={16} className="text-red-400 flex-shrink-0" />
        )}
        <span className="text-sm tracking-wide text-ivory">{message}</span>
        <button onClick={onClose} className="text-luxury-gray hover:text-ivory transition-colors ml-2">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
