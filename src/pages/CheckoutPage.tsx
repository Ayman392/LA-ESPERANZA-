import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { formatPrice, generateTransactionId, DELIVERY_CHARGE } from '../lib/utils';
import type { CheckoutForm } from '../lib/types';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

export default function CheckoutPage() {
  const { items, subtotal, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState<CheckoutForm>({
    full_name: '', phone: '', email: user?.email ?? '',
    address: '', city: '', postal_code: '', delivery_note: '',
  });
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState('');

  if (items.length === 0) { navigate('/cart'); return null; }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const transactionId = generateTransactionId();

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id ?? null,
        customer_name: form.full_name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        city: form.city,
        postal_code: form.postal_code,
        delivery_note: form.delivery_note,
        subtotal: subtotal(),
        delivery_charge: DELIVERY_CHARGE,
        total_amount: total(),
        transaction_id: transactionId,
        payment_status: 'pending',
        delivery_status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      setToast('Failed to create order. Please try again.');
      setProcessing(false);
      return;
    }

    await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }))
    );

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sslcommerz-init`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            order_id: order.id,
            transaction_id: transactionId,
            total_amount: total(),
            customer_name: form.full_name,
            customer_email: form.email,
            customer_phone: form.phone,
            customer_address: form.address,
            customer_city: form.city,
          }),
        }
      );
      const result = await resp.json();

      if (result.status === 'SUCCESS' && result.GatewayPageURL) {
        clearCart();
        window.location.href = result.GatewayPageURL;
      } else {
        setToast('Payment gateway error. Please try again.');
        setProcessing(false);
      }
    } catch {
      setToast('Network error. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-black text-ivory pt-20">
      {toast && <Toast message={toast} type="error" onClose={() => setToast('')} />}

      <div className="border-b border-white/[0.06] py-12 text-center">
        <h1 className="font-serif text-4xl text-ivory">Checkout</h1>
        <div className="section-divider" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">

            {/* Customer form */}
            <div className="space-y-6">
              <h2 className="font-serif text-2xl text-ivory mb-6">Delivery Information</h2>

              {[
                { name: 'full_name', label: 'Full Name', type: 'text', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
                { name: 'email', label: 'Email Address', type: 'email', required: true },
                { name: 'address', label: 'Delivery Address', type: 'text', required: true },
                { name: 'city', label: 'City', type: 'text', required: true },
                { name: 'postal_code', label: 'Postal Code', type: 'text', required: false },
              ].map(({ name, label, type, required }) => (
                <div key={name}>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">
                    {label} {required && <span className="text-gold">*</span>}
                  </label>
                  <input
                    type={type}
                    name={name}
                    required={required}
                    value={form[name as keyof CheckoutForm]}
                    onChange={handleChange}
                    className="luxury-input"
                  />
                </div>
              ))}

              <div>
                <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Delivery Note</label>
                <textarea
                  name="delivery_note"
                  rows={3}
                  value={form.delivery_note}
                  onChange={handleChange}
                  placeholder="Special instructions for delivery..."
                  className="w-full bg-white/[0.03] border border-white/[0.1] text-ivory text-sm px-4 py-3.5 focus:outline-none focus:border-gold/40 placeholder-luxury-gray/30 transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Order summary */}
            <div>
              <h2 className="font-serif text-2xl text-ivory mb-6">Order Summary</h2>

              <div className="bg-luxury-card border border-white/[0.08] p-6 space-y-5 shadow-card">
                <div className="space-y-4 pb-4 border-b border-white/[0.06]">
                  {items.map((item) => (
                    <div key={`${item.product_id}-${item.size}`} className="flex items-center gap-4">
                      <div className="w-14 h-14 overflow-hidden border border-white/[0.08] flex-shrink-0 bg-luxury-card">
                        <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory text-sm truncate">{item.product_name}</p>
                        <p className="text-luxury-gray/50 text-xs">{item.size} &times; {item.quantity}</p>
                      </div>
                      <span className="text-gold text-sm flex-shrink-0">{formatPrice(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-luxury-gray">Subtotal</span>
                    <span className="text-ivory">{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-luxury-gray">Delivery Charge</span>
                    <span className="text-ivory">{formatPrice(DELIVERY_CHARGE)}</span>
                  </div>
                  <div className="border-t border-white/[0.08] pt-3 flex justify-between font-medium">
                    <span className="text-ivory">Grand Total</span>
                    <span className="text-gold text-lg">{formatPrice(total())}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-3 btn-gold disabled:opacity-60"
                >
                  {processing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Shield size={16} />
                      Pay with SSLCommerz
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-luxury-gray/30 text-xs">
                  <Shield size={12} />
                  Secured by SSLCommerz — Bangladesh's trusted payment gateway
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link to="/cart" className="text-luxury-gray/40 hover:text-gold text-xs tracking-wider transition-colors">
                  &larr; Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
