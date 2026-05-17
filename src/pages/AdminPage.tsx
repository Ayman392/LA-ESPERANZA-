import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard as Edit2, Trash2, Package, Users, ShoppingBag, TrendingUp, X, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { Product, Order, Profile } from '../lib/types';
import { formatPrice } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

type AdminTab = 'overview' | 'products' | 'orders' | 'customers';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  discounted_price: string;
  category: string;
  gender: string;
  cover_image: string;
  featured: boolean;
  top_notes: string;
  middle_notes: string;
  base_notes: string;
  sizes: string;
}

const emptyForm: ProductForm = {
  name: '', description: '', price: '', discounted_price: '',
  category: 'oriental', gender: 'unisex', cover_image: '',
  featured: false, top_notes: '', middle_notes: '', base_notes: '',
  sizes: '50ml:10',
};

export default function AdminPage() {
  const { profile, session, loading: authLoading, setProfile } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessError, setAccessError] = useState('');
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      if (authLoading) return;

      if (!session) {
        navigate('/login');
        return;
      }

      setCheckingAccess(true);
      setAccessError('');

      if (profile?.is_admin) {
        setCheckingAccess(false);
        await loadData();
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        setAccessError(error.message);
        setCheckingAccess(false);
        setLoading(false);
        return;
      }

      if (!data?.is_admin) {
        navigate('/dashboard');
        return;
      }

      setProfile(data as Profile);
      setCheckingAccess(false);
      await loadData();
    };

    checkAccess();

    return () => { cancelled = true; };
  }, [authLoading, session, profile?.is_admin, navigate, setProfile]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: ords }, { data: custs }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').eq('is_admin', false).order('created_at', { ascending: false }),
    ]);
    setProducts((prods as Product[]) ?? []);
    setOrders((ords as Order[]) ?? []);
    setCustomers((custs as Profile[]) ?? []);
    setLoading(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const parseSizes = (sizesStr: string) =>
    sizesStr.split(',').map((s) => {
      const [size, stock] = s.trim().split(':');
      return { size: size?.trim() ?? '', stock: parseInt(stock?.trim() ?? '10', 10) };
    });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const slugify = (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const payload = {
      name: form.name,
      slug: slugify(form.name),
      description: form.description,
      price: parseFloat(form.price),
      discounted_price: form.discounted_price ? parseFloat(form.discounted_price) : null,
      category: form.category,
      gender: form.gender,
      cover_image: form.cover_image,
      featured: form.featured,
      fragrance_notes: {
        top: form.top_notes.split(',').map((s) => s.trim()).filter(Boolean),
        middle: form.middle_notes.split(',').map((s) => s.trim()).filter(Boolean),
        base: form.base_notes.split(',').map((s) => s.trim()).filter(Boolean),
      },
      sizes: parseSizes(form.sizes),
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('products').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('products').insert(payload));
    }

    if (!error) {
      setToast(editId ? 'Product updated!' : 'Product added!');
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      await loadData();
    } else {
      setToast(error.message);
    }
    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discounted_price: String(product.discounted_price ?? ''),
      category: product.category,
      gender: product.gender,
      cover_image: product.cover_image,
      featured: product.featured,
      top_notes: product.fragrance_notes.top.join(', '),
      middle_notes: product.fragrance_notes.middle.join(', '),
      base_notes: product.fragrance_notes.base.join(', '),
      sizes: product.sizes.map((s) => `${s.size}:${s.stock}`).join(', '),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').update({ is_active: false }).eq('id', id);
    setToast('Product removed');
    await loadData();
  };

  const handleUpdateOrderStatus = async (orderId: string, field: 'payment_status' | 'delivery_status', value: string) => {
    await supabase.from('orders').update({ [field]: value }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, [field]: value } : o));
    setToast('Order updated');
  };

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((s, o) => s + o.total_amount, 0);

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
    { key: 'products', label: 'Products', icon: <Package size={14} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={14} /> },
    { key: 'customers', label: 'Customers', icon: <Users size={14} /> },
  ];

  if (authLoading || (session && !profile)) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-20">
        <LoadingSpinner size="lg" text="Checking admin access..." />
      </div>
    );
  }
  if (authLoading || (session && !profile)) {
  return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center pt-20">
      <LoadingSpinner size="lg" text="Checking admin access..." />
    </div>
  );
}
  if (!profile?.is_admin && !loading) return null;

  return (
    <div className="min-h-screen bg-luxury-black text-ivory pt-20">
      {toast && <Toast message={toast} onClose={() => setToast('')} />}

      {/* Header */}
      <div className="border-b border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold/60 text-[11px] tracking-[0.4em] uppercase mb-1">Admin Panel</p>
          <h1 className="font-serif text-3xl text-ivory">LA ESPERANZA Management</h1>

          <div className="flex items-center gap-6 mt-7 border-b border-white/[0.06]">
            {tabs.map(({ key, label, icon }) => (
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading..." /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: <TrendingUp size={20} />, color: 'text-gold' },
                  { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={20} />, color: 'text-blue-400' },
                  { label: 'Products', value: products.length, icon: <Package size={20} />, color: 'text-green-400' },
                  { label: 'Customers', value: customers.length, icon: <Users size={20} />, color: 'text-cyan-400' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="bg-luxury-card border border-white/[0.08] p-6 shadow-card hover:shadow-card-hover hover:border-gold-accent/20 transition-all duration-300">
                    <div className={`mb-3 ${color}`}>{icon}</div>
                    <p className="text-luxury-gray text-xs tracking-wider uppercase mb-1">{label}</p>
                    <p className={`text-2xl font-light ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-2xl text-ivory">Products ({products.length})</h2>
                  <button
                    onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
                    className="flex items-center gap-2 btn-gold"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>

                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 bg-luxury-card border border-white/[0.08] p-4 hover:border-gold-accent/20 transition-all duration-300 shadow-card">
                      <div className="w-14 h-14 overflow-hidden flex-shrink-0 border border-white/[0.08]">
                        <img src={product.cover_image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-ivory text-sm font-medium">{product.name}</p>
                        <p className="text-luxury-gray/50 text-xs">{product.category} — {product.gender}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold text-sm">{formatPrice(product.discounted_price ?? product.price)}</p>
                        {product.featured && (
                          <span className="text-[10px] text-gold/60 border border-gold/20 px-1.5 py-0.5">Featured</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 text-luxury-gray/40 hover:text-gold transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-luxury-gray/40 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div>
                <h2 className="font-serif text-2xl text-ivory mb-8">Orders ({orders.length})</h2>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-luxury-card border border-white/[0.08] p-5 shadow-card">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-luxury-gray/50 text-[10px] uppercase tracking-wider mb-1">Order</p>
                          <p className="text-ivory text-xs font-mono">{order.id.slice(0, 8)}</p>
                        </div>
                        <div>
                          <p className="text-luxury-gray/50 text-[10px] uppercase tracking-wider mb-1">Customer</p>
                          <p className="text-ivory text-xs">{order.customer_name}</p>
                          <p className="text-luxury-gray/50 text-xs">{order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-luxury-gray/50 text-[10px] uppercase tracking-wider mb-1">Amount</p>
                          <p className="text-gold text-sm">{formatPrice(order.total_amount)}</p>
                        </div>
                        <div>
                          <p className="text-luxury-gray/50 text-[10px] uppercase tracking-wider mb-1">Payment</p>
                          <select
                            value={order.payment_status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, 'payment_status', e.target.value)}
                            className="bg-luxury-card border border-white/[0.12] text-luxury-gray text-xs px-2 py-1.5 focus:outline-none focus:border-gold/40 cursor-pointer"
                          >
                            {['pending', 'paid', 'failed', 'cancelled'].map((s) => (
                              <option key={s} value={s} className="bg-luxury-card">{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <p className="text-luxury-gray/50 text-[10px] uppercase tracking-wider mb-1">Delivery</p>
                          <select
                            value={order.delivery_status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, 'delivery_status', e.target.value)}
                            className="bg-luxury-card border border-white/[0.12] text-luxury-gray text-xs px-2 py-1.5 focus:outline-none focus:border-gold/40 cursor-pointer"
                          >
                            {['pending', 'processing', 'shipped', 'delivered'].map((s) => (
                              <option key={s} value={s} className="bg-luxury-card">{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOMERS */}
            {tab === 'customers' && (
              <div>
                <h2 className="font-serif text-2xl text-ivory mb-8">Customers ({customers.length})</h2>
                <div className="space-y-3">
                  {customers.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-luxury-card border border-white/[0.08] p-4 shadow-card">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold text-sm">
                          {c.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <p className="text-ivory text-sm">{c.full_name || 'No name'}</p>
                          <p className="text-luxury-gray/50 text-xs">{c.phone || 'No phone'}</p>
                        </div>
                      </div>
                      <p className="text-luxury-gray/30 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 z-[150] bg-luxury-black/80 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="bg-luxury-card border border-white/[0.1] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <h3 className="font-serif text-xl text-ivory">{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="text-luxury-gray/40 hover:text-ivory transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {[
                  { name: 'name', label: 'Product Name', type: 'text' },
                  { name: 'price', label: 'Price (BDT)', type: 'number' },
                  { name: 'discounted_price', label: 'Discounted Price (optional)', type: 'number' },
                  { name: 'cover_image', label: 'Cover Image URL', type: 'url' },
                ].map(({ name, label, type }) => (
                  <div key={name} className={name === 'cover_image' ? 'col-span-2' : ''}>
                    <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">{label}</label>
                    <input
                      type={type}
                      name={name}
                      required={name !== 'discounted_price'}
                      value={form[name as keyof ProductForm] as string}
                      onChange={handleFormChange}
                      className="luxury-input"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={form.description}
                  onChange={handleFormChange}
                  className="w-full bg-white/[0.04] border border-white/[0.1] text-ivory text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-all duration-300 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full bg-luxury-card border border-white/[0.1] text-ivory text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-colors"
                  >
                    {['oriental', 'floral', 'woody', 'fresh', 'aquatic'].map((c) => (
                      <option key={c} value={c} className="bg-luxury-card">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleFormChange}
                    className="w-full bg-luxury-card border border-white/[0.1] text-ivory text-sm px-4 py-3 focus:outline-none focus:border-gold/40 transition-colors"
                  >
                    {['men', 'women', 'unisex'].map((g) => (
                      <option key={g} value={g} className="bg-luxury-card">{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {[
                { name: 'top_notes', label: 'Top Notes (comma separated)' },
                { name: 'middle_notes', label: 'Middle Notes (comma separated)' },
                { name: 'base_notes', label: 'Base Notes (comma separated)' },
                { name: 'sizes', label: 'Sizes (e.g. 30ml:25, 50ml:18, 100ml:10)' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={form[name as keyof ProductForm] as string}
                    onChange={handleFormChange}
                    className="luxury-input"
                  />
                </div>
              ))}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleFormChange}
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-luxury-gray text-xs tracking-wider uppercase">Featured on homepage</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 btn-gold disabled:opacity-60"
                >
                  {saving ? <LoadingSpinner size="sm" /> : <><Check size={14} /> Save</>}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  className="px-6 py-3 text-xs tracking-wider uppercase text-luxury-gray border border-white/[0.1] hover:border-gold/30 hover:text-ivory transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
