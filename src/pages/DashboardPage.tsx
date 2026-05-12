import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Order, OrderItem, Address } from '../lib/types';
import { formatPrice } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

type Tab = 'orders' | 'profile' | 'addresses';

export default function DashboardPage() {
  const { user, profile, fetchProfile, session } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!session) { navigate('/login'); return; }
    loadData();
  }, [session]);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: ords }, { data: addrs }] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }),
    ]);
    setOrders((ords as Order[]) ?? []);
    setAddresses((addrs as Address[]) ?? []);
    setLoading(false);
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    setOrderItems((prev) => ({ ...prev, [orderId]: (data as OrderItem[]) ?? [] }));
  };

  const toggleOrder = async (orderId: string) => {
    if (expandedOrder === orderId) { setExpandedOrder(null); }
    else { await loadOrderItems(orderId); setExpandedOrder(orderId); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    if (!error) { await fetchProfile(user.id); setToast('Profile updated!'); }
    setSavingProfile(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    paid: 'text-green-400 bg-green-400/10',
    failed: 'text-red-400 bg-red-400/10',
    cancelled: 'text-luxury-gray/50 bg-white/5',
    processing: 'text-blue-400 bg-blue-400/10',
    shipped: 'text-cyan-400 bg-cyan-400/10',
    delivered: 'text-green-400 bg-green-400/10',
  };

  return (
    <div className="min-h-screen bg-luxury-black text-ivory pt-20">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      <div className="border-b border-white/[0.06] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gold/60 text-[11px] tracking-[0.4em] uppercase mb-1">My Account</p>
              <h1 className="font-serif text-3xl text-ivory">{profile?.full_name || user?.email?.split('@')[0]}</h1>
            </div>
            <p className="text-luxury-gray/50 text-xs">{user?.email}</p>
          </div>

          <div className="flex items-center gap-8 mt-8 border-b border-white/[0.06]">
            {([
              { key: 'orders', label: 'Orders', icon: <Package size={14} /> },
              { key: 'profile', label: 'Profile', icon: <User size={14} /> },
              { key: 'addresses', label: 'Addresses', icon: <MapPin size={14} /> },
            ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 pb-4 text-xs tracking-wider uppercase border-b-2 transition-all duration-200 ${
                  tab === key ? 'text-gold border-gold' : 'text-luxury-gray/50 border-transparent hover:text-ivory/70'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading..." /></div>
        ) : (
          <>
            {tab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20">
                    <Package size={40} className="text-luxury-gray/20 mx-auto mb-4" />
                    <p className="text-luxury-gray/50">No orders yet</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="bg-luxury-card border border-white/[0.08] overflow-hidden shadow-card">
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-6 text-left">
                          <div>
                            <p className="text-luxury-gray/50 text-[10px] tracking-wider uppercase mb-1">Order ID</p>
                            <p className="text-ivory text-xs font-mono">{order.id.slice(0, 8)}...</p>
                          </div>
                          <div>
                            <p className="text-luxury-gray/50 text-[10px] tracking-wider uppercase mb-1">Date</p>
                            <p className="text-ivory text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-luxury-gray/50 text-[10px] tracking-wider uppercase mb-1">Total</p>
                            <p className="text-gold text-sm">{formatPrice(order.total_amount)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm ${statusColors[order.payment_status]}`}>
                            {order.payment_status}
                          </span>
                          <span className={`text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm ${statusColors[order.delivery_status]}`}>
                            {order.delivery_status}
                          </span>
                          {expandedOrder === order.id ? <ChevronUp size={14} className="text-luxury-gray/40" /> : <ChevronDown size={14} className="text-luxury-gray/40" />}
                        </div>
                      </button>

                      {expandedOrder === order.id && (
                        <div className="border-t border-white/[0.06] p-5 bg-white/[0.01]">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5 text-xs">
                            <div>
                              <p className="text-luxury-gray/50 mb-1">Delivery to</p>
                              <p className="text-ivory">{order.customer_name}</p>
                              <p className="text-luxury-gray/50">{order.shipping_address}, {order.city}</p>
                            </div>
                            <div>
                              <p className="text-luxury-gray/50 mb-1">Transaction ID</p>
                              <p className="text-ivory/60 font-mono">{order.transaction_id || 'N/A'}</p>
                            </div>
                          </div>

                          {orderItems[order.id] && (
                            <div className="space-y-3">
                              {orderItems[order.id].map((item) => (
                                <div key={item.id} className="flex items-center gap-3 border-b border-white/[0.04] pb-3">
                                  <div className="w-12 h-12 overflow-hidden flex-shrink-0 border border-white/[0.08] bg-luxury-card">
                                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-ivory text-sm">{item.product_name}</p>
                                    <p className="text-luxury-gray/50 text-xs">{item.size} &times; {item.quantity}</p>
                                  </div>
                                  <span className="text-gold text-sm">{formatPrice(item.total_price)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="max-w-md space-y-5">
                <div>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Email</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email ?? ''}
                    className="w-full bg-white/[0.02] border border-white/[0.06] text-luxury-gray/50 text-sm px-4 py-3.5 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="luxury-input" />
                </div>
                <div>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="luxury-input" />
                </div>
                <button type="submit" disabled={savingProfile} className="btn-gold disabled:opacity-60">
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}

            {tab === 'addresses' && (
              <div>
                {addresses.length === 0 ? (
                  <div className="text-center py-20">
                    <MapPin size={40} className="text-luxury-gray/20 mx-auto mb-4" />
                    <p className="text-luxury-gray/50">No saved addresses</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="bg-luxury-card border border-white/[0.08] p-5 relative shadow-card">
                        {addr.is_default && (
                          <span className="absolute top-3 right-3 text-[10px] text-gold border border-gold/30 px-2 py-0.5 tracking-wider">Default</span>
                        )}
                        <p className="text-gold/60 text-[10px] tracking-widest uppercase mb-2">{addr.label}</p>
                        <p className="text-ivory font-medium text-sm">{addr.full_name}</p>
                        <p className="text-luxury-gray/50 text-sm">{addr.phone}</p>
                        <p className="text-luxury-gray/50 text-sm mt-1">{addr.address}</p>
                        <p className="text-luxury-gray/50 text-sm">{addr.city} {addr.postal_code}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
