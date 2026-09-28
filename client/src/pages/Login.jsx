import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login({ email, password });
      navigate('/app');
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <Logo />
      <h1 className="font-display text-3xl mt-6">Welcome back</h1>
      <p className="text-sm text-mute mt-2">Sign in to pick up your internship board on any device.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
        <button
          disabled={busy}
          className="w-full rounded-2xl bg-brand-700 text-white py-3 text-sm font-medium hover:bg-brand-800 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-mute mt-6">
        New here?{' '}
        <Link to="/signup" className="text-brand-700 font-medium">
          Create an account
        </Link>
      </p>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </AuthLayout>
  );
}

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 bg-brand-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 grid-fade" />
        <p className="relative font-display text-2xl">InternTrack</p>
        <blockquote className="relative max-w-md">
          <p className="font-display text-3xl leading-snug">Keep every application moving — without losing a deadline.</p>
          <p className="text-brand-100 mt-4 text-sm">A quieter way to run your internship search.</p>
        </blockquote>
        <p className="relative text-xs text-brand-100">Your session works across laptop and phone.</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, type = 'text', value, onChange, autoComplete, textarea }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  const cls =
    'w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm placeholder:text-slate-400';
  return (
    <label className="block" htmlFor={id}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {textarea ? (
        <textarea
          id={id}
          className={`${cls} mt-1.5 min-h-[120px] resize-y`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={`${cls} mt-1.5`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={type !== 'date'}
        />
      )}
    </label>
  );
}
