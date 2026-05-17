import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/types';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { CATEGORIES, GENDER_FILTERS } from '../lib/utils';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [gender, setGender] = useState('all');
  const [sort, setSort] = useState<SortOption>('default');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase.from('products').select('*').eq('is_active', true);

      if (category !== 'all') query = query.ilike('category', category);
      if (gender !== 'all') query = query.ilike('gender', gender);
      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`);

      if (sort === 'price-asc') query = query.order('price', { ascending: true });
      else if (sort === 'price-desc') query = query.order('price', { ascending: false });
      else if (sort === 'name-asc') query = query.order('name', { ascending: true });
      else query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setProducts((data as Product[]) ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not load products.';
      setError(message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, gender, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setCategory(searchParams.get('category') ?? 'all');
  }, [searchParams]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (category !== 'all') params.category = category;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setGender('all');
    setSort('default');
    setSearchParams({});
  };

  const hasFilters = search || category !== 'all' || gender !== 'all' || sort !== 'default';

  return (
    <div className="min-h-screen bg-luxury-black text-ivory pt-20">
      <div className="border-b border-white/[0.06] py-16 text-center">
        <p className="section-label">Our Selection</p>
        <h1 className="font-serif text-4xl md:text-5xl text-ivory">Fragrance Collections</h1>
        <div className="section-divider" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <form onSubmit={applySearch} className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-gray/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fragrances..."
              className="w-full bg-white rounded-xl border border-gold/[0.08] text-ivory text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:border-gold/40 placeholder-luxury-gray/40 transition-all duration-300"
            />
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="sm:hidden flex items-center gap-2 border border-white/[0.1] px-4 py-2.5 text-xs tracking-wider text-luxury-gray hover:border-gold/30 hover:text-gold transition-colors"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-luxury-card border rounded-xl border-white/[0.08] text-luxury-gray text-sm px-3 py-2.5 focus:outline-none focus:border-gold/40 transition-colors cursor-pointer"
            >
              <option value="default" className="bg-luxury-card">Default</option>
              <option value="price-asc" className="bg-luxury-card">Price: Low to High</option>
              <option value="price-desc" className="bg-luxury-card">Price: High to Low</option>
              <option value="name-asc" className="bg-luxury-card">Name: A-Z</option>
            </select>

            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-luxury-gray hover:text-gold transition-colors">
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <aside className={`w-56 flex-shrink-0 space-y-8 ${filtersOpen ? 'block' : 'hidden sm:block'}`}>
            <div>
              <h3 className="text-ivory/60 text-[14px] tracking-[0.3em] uppercase mb-4">Category</h3>
              <div className="space-y-2">
                {CATEGORIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`block w-full text-left text-sm py-1.5 px-3 rounded-sm transition-colors duration-150 ${
                      category === value
                        ? 'text-gold bg-gold/10'
                        : 'text-luxury-gray hover:text-gold-accent hover:bg-white/[0.03]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-ivory/60 text-[14px] tracking-[0.3em] uppercase mb-4">For</h3>
              <div className="space-y-2">
                {GENDER_FILTERS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setGender(value)}
                    className={`block w-full text-left text-sm py-1.5 px-3 rounded-sm transition-colors duration-150 ${
                      gender === value
                        ? 'text-gold bg-gold/10'
                        : 'text-luxury-gray hover:text-gold-accent hover:bg-white/[0.03]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {!loading && (
              <p className="text-luxury-gray/60 text-sm tracking-wider mb-6">
                {products.length} fragrance{products.length !== 1 ? 's' : ''} found
              </p>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-24">
                <p className="text-red-300 text-xl font-serif">Products could not load</p>
                <p className="text-luxury-gray/50 text-sm mt-3">{error}</p>
                <button onClick={fetchProducts} className="mt-6 text-gold text-lg tracking-wider hover:underline">
                  Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-luxury-gray/50 text-xl font-serif">No fragrances found</p>
                <p className="text-luxury-gray/30 text-lg mt-2">Try adjusting your filters</p>
                <button onClick={clearFilters} className="mt-6 text-gold text-lg tracking-wider hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}