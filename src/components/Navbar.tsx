import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCartStore();
  const { user, profile, signOut } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Collections' },
  ];

  const navBg =
    scrolled || !isHome
      ? 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg'
      : 'bg-white/10 backdrop-blur-lg border-b border-white/20';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-start group">
              <span className="text-[#B68A35] font-serif text-lg sm:text-2xl tracking-[0.2em] leading-none group-hover:tracking-[0.25em] transition-all duration-300">
                LA ESPERANZA
              </span>
              <span className="text-[#374151] text-[8px] sm:text-[10px] tracking-[0.35em] uppercase">
                Luxury Perfumes
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-lg tracking-[0.2em] uppercase transition-colors duration-200 ${
                    location.pathname === link.href
                      ? 'text-[#B68A35]'
                      : 'text-[#374151] hover:text-[#B68A35]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-5">
              {/* Desktop icons only */}
              <div className="hidden md:flex items-center gap-5">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-[#374151] hover:text-[#B68A35] transition-colors duration-200"
                  aria-label="Search"
                >
                  <Search size={24} />
                </button>

                <Link
                  to="/cart"
                  className="relative text-[#374151] hover:text-[#B68A35] transition-colors duration-200"
                  aria-label="Cart"
                >
                  <ShoppingBag size={24} />
                  {itemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#B68A35] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {itemCount()}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="relative group">
                    <button className="text-[#374151] hover:text-[#B68A35] transition-colors duration-200">
                      <User size={24} />
                    </button>

                    <div className="absolute right-0 top-8 w-48 bg-white/80 backdrop-blur-xl border border-white/30 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to={profile?.is_admin ? '/admin' : '/dashboard'}
                        className="block px-4 py-3 text-xs tracking-wider text-[#374151] hover:text-[#B68A35] transition-colors"
                      >
                        {profile?.is_admin ? 'Admin Panel' : 'My Account'}
                      </Link>

                      <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-3 text-xs tracking-wider text-[#374151] hover:text-red-400 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={12} /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-[#374151] hover:text-[#B68A35] transition-colors duration-200"
                    aria-label="Login"
                  >
                    <User size={24} />
                  </Link>
                )}
              </div>

              {/* Mobile hamburger only */}
              <button
                className="flex md:hidden text-[#374151] hover:text-[#B68A35] transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden mt-4 bg-white/80 backdrop-blur-xl border border-white/30 rounded-2xl px-6 py-5 space-y-4 shadow-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm tracking-[0.2em] uppercase text-[#374151] hover:text-[#B68A35] transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link
                    to={profile?.is_admin ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block text-sm tracking-[0.2em] uppercase text-[#374151] hover:text-[#B68A35] transition-colors py-2"
                  >
                    {profile?.is_admin ? 'Admin Panel' : 'My Account'}
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="block text-sm tracking-[0.2em] uppercase text-[#374151] hover:text-red-400 transition-colors py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm tracking-[0.2em] uppercase text-[#374151] hover:text-[#B68A35] transition-colors py-2"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xl flex items-center justify-center px-6">
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-8 right-8 text-white hover:text-[#B68A35] transition-colors"
          >
            <X size={24} />
          </button>

          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <p className="text-[#B68A35] text-xs tracking-[0.3em] uppercase mb-6 text-center">
              Search Fragrances
            </p>

            <div className="relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or notes..."
                className="w-full bg-transparent border-b border-[#B68A35]/40 text-white text-xl tracking-wider py-3 pr-10 focus:outline-none focus:border-[#B68A35] placeholder-white/50 text-center"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#B68A35]"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}