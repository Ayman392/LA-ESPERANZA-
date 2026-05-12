import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phone = '8801700000000';
  const message = encodeURIComponent('Hello! I am interested in LA ESPERANZA perfumes.');

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg shadow-black/30 transition-all duration-300 hover:scale-105 group"
      aria-label="Chat on WhatsApp"
    >
      <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 text-sm font-medium whitespace-nowrap pl-0 group-hover:pl-4">
        Chat with us
      </span>
      <div className="p-4">
        <MessageCircle size={22} fill="white" />
      </div>
    </a>
  );
}
