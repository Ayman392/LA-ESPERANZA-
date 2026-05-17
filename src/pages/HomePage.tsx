import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Star, Shield, Truck, RotateCcw, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Toast from '../components/Toast';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [toast, setToast] = useState('');
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

useEffect(() => {
  const fetchFeatured = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('is_active', true)
        .limit(6);

      if (error) {
        setToast(error.message);
        setFeatured([]);
      } else {
        setFeatured((data as Product[]) ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchFeatured();
}, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim() });
    if (error && error.code === '23505') {
      setToast('You are already subscribed!');
    } else if (error) {
      setToast('Something went wrong. Please try again.');
    } else {
      setSubscribed(true);
    }
    setEmail('');
  };

  const testimonials = [
    {
      name: 'Nadia Rahman',
      role: 'Fashion Designer',
      rating: 5,
      comment: 'Oud Noir Intense is absolutely divine. The longevity is incredible — I still get compliments 12 hours later.',
    },
    {
      name: 'Arif Hossain',
      role: 'Entrepreneur',
      rating: 5,
      comment: 'Black Amber Elite has become my signature scent. Nothing comes close to the sophistication of LA ESPERANZA.',
    },
    {
      name: 'Priya Sharma',
      role: 'Lifestyle Blogger',
      rating: 5,
      comment: 'The packaging alone is art. Rose de Minuit is ethereal — floral but not overwhelming. Pure luxury.',
    },
  ];

  return (
    <div className="bg-luxury-black text-ivory overflow-x-hidden">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* HERO */}
      <section className="relative h-screen min-h-screen overflow-hidden">
       <div ref={heroRef} className="absolute inset-0 scale-110">
          <img
            src="/assets/hero/background.jpg"
            alt="Luxury perfume hero"
            className="w-full h-full object-cover object-[40%_center] md:object-center"
          />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/70 via-luxury-black/50 to-luxury-black" />
      </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-[#A67C2E] text-[18px] tracking-[0.5em] uppercase mb-6 animate-fade-in">
            Timeless Elegance in Every Drop
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#111827] mb-6 leading-tight animate-fade-in-up">
            LA <span className="text-[#A67C2E]">ESPERANZA</span>
          </h1>
          <p className="text-[#4B5563] text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
            Where rare ingredients meet masterful artistry. Discover fragrances that transcend time — crafted for those who demand nothing less than extraordinary.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-200">
            <Link
              to="/products"
              className="group flex items-center gap-3 btn-gold rounded-xl"
            >
              Shop Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-2 text-luxury-gray hover:text-gold-accent text-xs tracking-[0.2em] uppercase transition-colors duration-200"
            >
              Explore Collection <ChevronRight size={20} />
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 sm:bottom-8 flex flex-col items-center gap-2 animate-bounce z-20">
            <span className="text-luxury-black text-[14px] sm:text-[16px] tracking-[0.3em] uppercase">
              Scroll
            </span>
        <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-gold/30 to-transparent" />
</div>
      </section>

      {/* MARQUEE STRIP */}
      <div className="bg-[#A67C2E] border-y border-gold/15 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-6 mx-8 text-white text-[11px] tracking-[0.3em] uppercase">
              <span>Luxury Fragrances</span>
              <span className="text-white">&#9670;</span>
              <span>Crafted With Rare Ingredients</span>
              <span className="text-white">&#9670;</span>
              <span>Shipped Across Bangladesh</span>
              <span className="text-white">&#9670;</span>
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label">Signature Collection</p>
          <h2 className="font-serif text-2xl md:text-5xl text-ivory">Featured Fragrances</h2>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="text-center mt-14">
          <Link
            to="/products"
            className="group inline-flex items-center gap-3 btn-outline-gold rounded-xl"
          >
            View Full Collection
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Brand story"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-luxury-black/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="section-label">Our Story</p>
          <h2 className="font-serif text-4xl md:text-5xl text-ivory mb-8 leading-snug">
            Born from the Soul of Luxury
          </h2>
          <p className="text-luxury-gray text-base leading-relaxed max-w-2xl mx-auto mb-6">
            LA ESPERANZA was founded on a singular vision: to bring the world's most extraordinary fragrances to discerning souls. Each bottle is a journey — through ancient spice routes, blooming gardens, and sacred forests.
          </p>
          <p className="text-luxury-gray/70 text-base leading-relaxed max-w-2xl mx-auto mb-10">
            We source only the rarest natural ingredients — Haitian vetiver, Mysore sandalwood, Bulgarian rose absolute — and entrust them to master perfumers who transform them into liquid poetry.
          </p>
          <div className="w-16 h-px bg-gold/50 mx-auto" />
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="section-label">Our Promise</p>
          <h2 className="font-serif text-4xl text-ivory">Why LA ESPERANZA</h2>
          <div className="section-divider" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 rounded-xl">
          {[
            {
              icon: <Package size={28} />,
              title: 'Premium Packaging',
              desc: 'Each fragrance is housed in hand-crafted crystal flacons, presented in silk-lined boxes worthy of the luxury within.',
            },
            {
              icon: <Shield size={28} />,
              title: '100% Authentic',
              desc: 'Every bottle carries a certificate of authenticity. We guarantee genuine, high-concentration Extrait de Parfum.',
            },
            {
              icon: <Truck size={28} />,
              title: 'Nationwide Delivery',
              desc: 'Secure, insured shipping to every corner of Bangladesh. Your fragrance arrives as pristine as it was packed.',
            },
            {
              icon: <RotateCcw size={28} />,
              title: 'Satisfaction Guarantee',
              desc: 'Not in love with your fragrance? We offer hassle-free exchanges within 7 days of delivery.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="group text-center p-8 bg-luxury-card border border-white/[0.06] hover:border-gold-accent/30 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1 rounded-2xl"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-gold/20 text-gold mb-6 group-hover:bg-gold/10 group-hover:shadow-gold transition-all duration-300">
                {icon}
              </div>
              <h3 className="text-ivory font-medium text-sm tracking-wider mb-3 uppercase">{title}</h3>
              <p className="text-luxury-gray text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py12- md:py-24 bg-luxury-card/30 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 mt-10">
            <p className="section-label">Voices</p>
            <h2 className="font-serif text-4xl text-ivory">What Our Clients Say</h2>
            <div className="section-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, rating, comment }) => (
              <div
                key={name}
                className="p-8 bg-luxury-card border border-white/[0.06] rounded-2xl hover:border-gold-accent/20 transition-all duration-500 relative hover:shadow-card-hover hover:-translate-y-1"
              >
                <span className="absolute top-6 right-8 text-gold/10 font-serif text-6xl leading-none">"</span>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={12} className="text-gold fill-gold" />
                  ))}
                </div>
                <p className="text-luxury-gray text-sm leading-relaxed mb-6 italic">"{comment}"</p>
                <div>
                  <p className="text-ivory text-sm font-medium">{name}</p>
                  <p className="text-gold/50 text-xs tracking-wider mt-0.5">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-12 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="section-label">Stay Connected</p>
          <h2 className="font-serif text-4xl text-ivory mb-4">Join the Inner Circle</h2>
          <p className="text-luxury-gray text-sm leading-relaxed mb-10">
            Subscribe for exclusive launches, private offers, and fragrance stories delivered directly to your inbox.
          </p>

          {subscribed ? (
            <div className="border border-gold/30 bg-gold/5 text-gold px-8 py-5 text-sm tracking-wider">
              Thank you for subscribing. Welcome to the circle.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-white/[0.04] border border-black/[0.1] text-ivory text-sm px-5 py-3.5 focus:outline-none focus:border-gold/40 placeholder-luxury-gray/50 transition-all duration-300 rounded-2xl"
              />
              <button
                type="submit"
                className="btn-gold flex-shrink-0 rounded-2xl"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
