'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setMsg(''); setLoading(true);
    const supabase = createClient();

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else { setMsg('Check your email to confirm your account, then log in.'); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); }
      else { router.push('/today'); router.refresh(); }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#f7f7f5]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">Discipline Tracker</h1>
          <p className="text-sm text-neutral-400 mt-1">Track your daily habits</p>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e5e3' }}>
          <div className="flex rounded-xl p-0.5 gap-0.5 bg-neutral-100 mb-5">
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMsg(''); }}
                className="flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                style={mode === m
                  ? { background: '#fff', color: '#1a1a1a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                  : { background: 'transparent', color: '#a3a3a3' }}>
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-500">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-500">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            {msg && <p className="text-xs text-green-600 font-medium">{msg}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all active:scale-95"
              style={{ background: '#1a1a1a', color: '#fff', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
