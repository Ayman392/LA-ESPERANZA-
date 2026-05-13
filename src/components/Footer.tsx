import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-luxury-black border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-6">
              <h3 className="font-serif text-gold text-2xl tracking-[0.2em]">LA ESPERANZA</h3>
              <p className="text-luxury-gray text-[10px] tracking-[0.35em] uppercase mt-1">Luxury Perfumes</p>
            </div>
            <p className="text-luxury-gray text-sm leading-relaxed mb-6">
              Crafting extraordinary fragrances that tell stories of luxury, heritage, and timeless elegance.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-luxury-gray hover:text-gold transition-colors duration-200">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-luxury-gray hover:text-gold transition-colors duration-200">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-luxury-gray hover:text-gold transition-colors duration-200">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-ivory text-xs tracking-[0.25em] uppercase mb-6">Navigation</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Collections' },
                { to: '/cart', label: 'Cart' },
                { to: '/dashboard', label: 'My Account' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-luxury-gray hover:text-gold text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-ivory text-xs tracking-[0.25em] uppercase mb-6">Fragrances</h4>
            <ul className="space-y-3">
              {['Oriental', 'Floral', 'Woody', 'Fresh', 'Aquatic', 'Unisex'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/products?category=${cat.toLowerCase()}`}
                    className="text-luxury-gray hover:text-gold text-sm transition-colors duration-200"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-ivory text-xs tracking-[0.25em] uppercase mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <span className="text-luxury-gray text-sm">Mirpur, Dhaka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-gold flex-shrink-0" />
                <a href="tel:+8801700000000" className="text-luxury-gray hover:text-gold text-sm transition-colors">
                  +880 1760-977865
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-gold flex-shrink-0" />
                <a href="mailto:hello@laesperanza.com" className="text-luxury-gray hover:text-gold text-sm transition-colors">
                  laesperanza@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-luxury-gray/60 text-md tracking-wider">
            &copy; {new Date().getFullYear()} LA ESPERANZA. All rights reserved.
          </p>
          <p className="text-[#A67C2E] text-md tracking-wider italic">
            "Timeless Elegance in Every Drop"
          </p>
        </div>
      </div>
    </footer>
  );
}
