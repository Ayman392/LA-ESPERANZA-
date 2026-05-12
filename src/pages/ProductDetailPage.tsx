import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Plus, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product, Review } from '../lib/types';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import Toast from '../components/Toast';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [toast, setToast] = useState('');

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const loadProduct = async () => {
      setLoading(true);
      const { data: prod } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (!prod) { navigate('/404'); return; }
      setProduct(prod as Product);
      setActiveImage(prod.cover_image);
      setSelectedSize(prod.sizes[0]?.size ?? '');

      const { data: revs } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', prod.id)
        .order('created_at', { ascending: false });
      setReviews((revs as Review[]) ?? []);

      const { data: rel } = await supabase
        .from('products')
        .select('*')
        .eq('category', prod.category)
        .eq('is_active', true)
        .neq('id', prod.id)
        .limit(4);
      setRelated((rel as Product[]) ?? []);

      setLoading(false);
    };
    loadProduct();
  }, [slug, navigate]);

  const effectivePrice = product?.discounted_price ?? product?.price ?? 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.cover_image,
      size: selectedSize,
      quantity,
      unit_price: effectivePrice,
    });
    setToast('Added to cart successfully');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!product) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: product.id,
      user_id: user.id,
      reviewer_name: user.email?.split('@')[0] ?? 'Guest',
      rating: reviewRating,
      comment: reviewComment,
    });
    if (!error) {
      const { data: revs } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      setReviews((revs as Review[]) ?? []);
      setReviewComment('');
      setReviewRating(5);
      setToast('Review submitted!');
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-20">
        <LoadingSpinner size="lg" text="Loading fragrance..." />
      </div>
    );
  }

  if (!product) return null;

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-luxury-black text-ivory pt-20">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Breadcrumb */}
      <div className="border-b border-white/[0.05] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-luxury-gray/50">
          <Link to="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-gold transition-colors">Collections</Link>
          <ChevronRight size={12} />
          <span className="text-gold">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

          {/* Image gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden bg-luxury-card border border-white/[0.06]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveImage(product.cover_image)}
                  className={`w-20 h-20 overflow-hidden border-2 transition-all ${
                    activeImage === product.cover_image ? 'border-gold' : 'border-white/[0.08] hover:border-gold-accent/40'
                  }`}
                >
                  <img src={product.cover_image} alt="main" className="w-full h-full object-cover" />
                </button>
                {product.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.image_url)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-all ${
                      activeImage === img.image_url ? 'border-gold' : 'border-white/[0.08] hover:border-gold-accent/40'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gold/60 text-[11px] tracking-[0.3em] uppercase">{product.category}</span>
                <span className="text-luxury-gray/50 text-[11px] tracking-[0.3em] uppercase">{product.gender}</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-ivory leading-snug">{product.name}</h1>
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={avgRating} />
                <span className="text-luxury-gray/50 text-xs">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <span className="text-gold text-3xl font-light">{formatPrice(effectivePrice)}</span>
              {product.discounted_price && (
                <span className="text-luxury-gray/40 text-xl line-through">{formatPrice(product.price)}</span>
              )}
            </div>

            <p className="text-luxury-gray text-sm leading-relaxed">{product.description}</p>

            {/* Fragrance notes */}
            <div className="space-y-3">
              <h3 className="text-ivory/60 text-[11px] tracking-[0.3em] uppercase">Fragrance Notes</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Top', notes: product.fragrance_notes.top },
                  { label: 'Heart', notes: product.fragrance_notes.middle },
                  { label: 'Base', notes: product.fragrance_notes.base },
                ].map(({ label, notes }) => (
                  <div key={label} className="p-3 bg-luxury-card border border-white/[0.06] text-center">
                    <p className="text-gold/50 text-[10px] tracking-widest uppercase mb-2">{label}</p>
                    {notes.map((n) => (
                      <p key={n} className="text-luxury-gray text-xs">{n}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <h3 className="text-ivory/60 text-[11px] tracking-[0.3em] uppercase mb-3">Size</h3>
              <div className="flex items-center gap-3">
                {product.sizes.map(({ size, stock }) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    disabled={stock === 0}
                    className={`px-4 py-2.5 text-xs tracking-wider border transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-gold text-gold bg-gold/10'
                        : stock === 0
                        ? 'border-white/[0.05] text-luxury-gray/30 cursor-not-allowed'
                        : 'border-white/[0.12] text-luxury-gray hover:border-gold-accent/40 hover:text-gold-accent'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-ivory/60 text-[11px] tracking-[0.3em] uppercase mb-3">Quantity</h3>
              <div className="inline-flex items-center border border-white/[0.12]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-luxury-gray hover:text-gold hover:bg-white/[0.04] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-ivory text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-luxury-gray hover:text-gold hover:bg-white/[0.04] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 btn-outline-gold"
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 btn-gold"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-24 border-t border-white/[0.06] pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            <div>
              <h2 className="font-serif text-2xl text-ivory mb-8">
                Customer Reviews
                {reviews.length > 0 && (
                  <span className="text-luxury-gray/40 text-base font-light ml-3">({reviews.length})</span>
                )}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-luxury-gray/50 text-sm">Be the first to review this fragrance.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-white/[0.06] pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-ivory text-sm font-medium">{rev.reviewer_name}</span>
                        <span className="text-luxury-gray/30 text-xs">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <StarRating rating={rev.rating} size={12} />
                      <p className="text-luxury-gray text-sm mt-2 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif text-2xl text-ivory mb-8">Write a Review</h2>
              {!user ? (
                <div className="border border-white/[0.08] bg-luxury-card p-6 text-center">
                  <p className="text-luxury-gray text-sm mb-4">Please sign in to leave a review.</p>
                  <Link to="/login" className="text-gold text-xs tracking-wider hover:underline">Sign In</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-5">
                  <div>
                    <label className="text-luxury-gray text-xs tracking-wider block mb-3">Your Rating</label>
                    <StarRating rating={reviewRating} interactive onChange={setReviewRating} size={22} />
                  </div>
                  <div>
                    <label className="text-luxury-gray text-xs tracking-wider block mb-2">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this fragrance..."
                      className="w-full bg-white/[0.03] border border-white/[0.1] text-ivory text-sm p-4 focus:outline-none focus:border-gold/40 placeholder-luxury-gray/30 transition-all duration-300 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-gold disabled:opacity-60"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <p className="section-label">You May Also Like</p>
              <h2 className="font-serif text-3xl text-ivory">Related Fragrances</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
