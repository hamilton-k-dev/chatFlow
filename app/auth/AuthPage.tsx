'use client';
import { useState } from 'react';

interface Props {
  onAuth: (user: { name: string; avatar: string; email: string }) => void;
}

type Mode = 'login' | 'register';

const avatars = [
  'https://readdy.ai/api/search-image?query=professional%20headshot%20young%20man%20smiling%20casual%20clean%20white%20background%20portrait%20photography&width=80&height=80&seq=cu1&orientation=squarish',
  'https://readdy.ai/api/search-image?query=professional%20headshot%20young%20woman%20smiling%20brown%20hair%20clean%20white%20background%20portrait%20photography&width=80&height=80&seq=u1&orientation=squarish',
  'https://readdy.ai/api/search-image?query=professional%20headshot%20young%20man%20dark%20hair%20confident%20smile%20clean%20white%20background%20portrait%20photography&width=80&height=80&seq=u2&orientation=squarish',
  'https://readdy.ai/api/search-image?query=professional%20headshot%20young%20latina%20woman%20friendly%20smile%20clean%20white%20background%20portrait%20photography&width=80&height=80&seq=u3&orientation=squarish',
];

export default function AuthPage({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'register') {
      if (!username.trim()) { setError('Username is required.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
      onAuth({
        name: mode === 'register' ? username : email.split('@')[0],
        email,
        avatar: randomAvatar,
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #ddd6fe 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="absolute top-16 left-16 w-64 h-64 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="absolute bottom-16 right-16 w-80 h-80 rounded-full bg-purple-400/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-violet-500 shadow-lg shadow-violet-200">
              <i className="ri-chat-3-fill text-2xl text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 font-['Pacifico']">ChatFlow</span>
          </div>
          <p className="text-gray-500 text-sm">Connect, chat, and collaborate in real time</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100/50 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-4 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  mode === m
                    ? 'text-violet-600 border-b-2 border-violet-500 bg-violet-50/50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Username</label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${username ? 'border-violet-300 bg-violet-50/30' : 'border-gray-200 bg-gray-50'} focus-within:border-violet-400`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-user-line text-gray-400 text-lg" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your display name"
                    className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${email ? 'border-violet-300 bg-violet-50/30' : 'border-gray-200 bg-gray-50'} focus-within:border-violet-400`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-gray-400 text-lg" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${password ? 'border-violet-300 bg-violet-50/30' : 'border-gray-200 bg-gray-50'} focus-within:border-violet-400`}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-gray-400 text-lg" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} />
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors ${confirmPassword ? 'border-violet-300 bg-violet-50/30' : 'border-gray-200 bg-gray-50'} focus-within:border-violet-400`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-lock-2-line text-gray-400 text-lg" />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="w-5 h-5 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={showConfirm ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'} />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-error-warning-line text-red-500 text-base" />
                </div>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-violet-500 hover:underline cursor-pointer">Forgot password?</button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold text-sm transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-violet-200 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="ri-loader-4-line animate-spin text-lg" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>

            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'ri-google-fill', label: 'Google', color: 'text-red-500' },
                { icon: 'ri-github-fill', label: 'GitHub', color: 'text-gray-800' },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50/30 transition-colors cursor-pointer whitespace-nowrap text-sm font-medium text-gray-600"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${p.icon} text-lg ${p.color}`} />
                  </div>
                  {p.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <span className="text-violet-500 cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-violet-500 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
