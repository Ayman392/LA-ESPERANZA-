import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setSession, fetchProfile } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        is_admin: false,
      });

      if (data.session) {
        setSession(data.session);
        await fetchProfile(data.user.id);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-luxury-black text-ivory flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.pexels.com/photos/3059609/pexels-photo-3059609.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Luxury perfume"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-luxury-black/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12">
          <h1 className="font-serif text-5xl text-ivory mb-3">LA ESPERANZA</h1>
          <p className="text-gold/70 text-sm tracking-[0.3em] uppercase">Luxury in Every Drop</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <h1 className="font-serif text-3xl text-gold">LA ESPERANZA</h1>
          </div>

          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl text-ivory mb-2">Create Account</h2>
            <p className="text-luxury-gray text-sm">Join the LA ESPERANZA inner circle</p>
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-500/10 text-red-400 text-xs tracking-wide px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { value: fullName, setter: setFullName, label: 'Full Name', type: 'text', placeholder: 'Your full name' },
              { value: email, setter: setEmail, label: 'Email', type: 'email', placeholder: 'your@email.com' },
              { value: phone, setter: setPhone, label: 'Phone Number', type: 'tel', placeholder: '+880 1xxx-xxxxxx' },
            ].map(({ value, setter, label, type, placeholder }) => (
              <div key={label}>
                <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">{label}</label>
                <input
                  type={type}
                  required
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="luxury-input"
                />
              </div>
            ))}

            <div>
              <label className="text-luxury-gray text-xs tracking-wider block mb-2 uppercase">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="luxury-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-gray/40 hover:text-ivory/60 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gold disabled:opacity-60 mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-luxury-gray text-sm mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
