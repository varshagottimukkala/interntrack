import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { AuthLayout, Field } from './Login';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [full_name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await signup({ full_name, email, password });
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
      <h1 className="font-display text-3xl mt-6">Create your board</h1>
      <p className="text-sm text-mute mt-2">One account. Every internship, saved.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Field label="Full name" value={full_name} onChange={setName} autoComplete="name" />
        <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <p className="text-xs text-mute">At least 6 characters. Stored hashed — never in the browser as a secret key.</p>
        <button
          disabled={busy}
          className="w-full rounded-2xl bg-brand-700 text-white py-3 text-sm font-medium hover:bg-brand-800 disabled:opacity-60"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-mute mt-6">
        Already tracking?{' '}
        <Link to="/login" className="text-brand-700 font-medium">
          Sign in
        </Link>
      </p>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </AuthLayout>
  );
}
