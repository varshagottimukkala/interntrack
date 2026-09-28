import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { STATUSES } from '../lib/status';

const empty = {
  title: '',
  company: '',
  location: '',
  deadline: '',
  status: 'wishlist',
  description: '',
};

export default function InternshipForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!editing) return;
    let live = true;
    (async () => {
      try {
        const data = await api(`/api/items/${id}`, { token });
        if (!live) return;
        const it = data.item;
        setForm({
          title: it.title || '',
          company: it.company || '',
          location: it.location || '',
          deadline: it.deadline || '',
          status: it.status || 'wishlist',
          description: it.description || '',
        });
      } catch (err) {
        setToast({ type: 'error', message: err.message });
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [editing, id, token]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await api(`/api/items/${id}`, { method: 'PUT', token, body: form });
        navigate(`/app/${id}`);
      } else {
        const data = await api('/api/items', { method: 'POST', token, body: form });
        navigate(`/app/${data.item.id}`);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title={
        <div>
          <Link to="/app" className="text-sm text-brand-700">
            ← Board
          </Link>
          <h1 className="font-display text-3xl mt-1">{editing ? 'Edit internship' : 'Add internship'}</h1>
        </div>
      }
    >
      {loading ? (
        <div className="h-64 rounded-3xl bg-white animate-pulse" />
      ) : (
        <form onSubmit={onSubmit} className="max-w-2xl rounded-3xl bg-white shadow-card border border-slate-100 p-5 sm:p-7 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Role / title" value={form.title} onChange={(v) => set('title', v)} required />
            <Input label="Company" value={form.company} onChange={(v) => set('company', v)} required />
            <Input label="Location" value={form.location} onChange={(v) => set('location', v)} placeholder="Remote, Bengaluru…" />
            <Input label="Deadline" type="date" value={form.deadline} onChange={(v) => set('deadline', v)} />
          </div>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Status</span>
            <select
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Notes / job description</span>
            <textarea
              className="mt-1.5 w-full min-h-[140px] rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Paste the posting, requirements, or anything you want Gemini to use later."
            />
          </label>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              disabled={busy}
              className="rounded-2xl bg-brand-700 text-white px-5 py-3 text-sm font-medium hover:bg-brand-800 disabled:opacity-60"
            >
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Save internship'}
            </button>
            <Link to={editing ? `/app/${id}` : '/app'} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm text-center">
              Cancel
            </Link>
          </div>
        </form>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </AppShell>
  );
}

function Input({ label, value, onChange, type = 'text', required, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm"
      />
    </label>
  );
}
