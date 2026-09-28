import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { daysUntil, statusMeta } from '../lib/status';

const AI_ACTIONS = [
  { mode: 'summarize', label: 'Summarize posting', hint: 'Saved onto this card' },
  { mode: 'cover_letter', label: 'Draft cover letter', hint: 'Short and specific' },
  { mode: 'interview', label: 'Interview prep', hint: 'Questions + tips' },
  { mode: 'next_steps', label: 'Next steps', hint: 'What to do this week' },
];

export default function InternshipDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [aiMode, setAiMode] = useState(null);
  const [aiText, setAiText] = useState('');
  const [extra, setExtra] = useState('');

  async function load() {
    const data = await api(`/api/items/${id}`, { token });
    setItem(data.item);
  }

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (live) setToast({ type: 'error', message: err.message });
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [id, token]);

  async function remove() {
    if (!confirm('Delete this internship from your board?')) return;
    try {
      await api(`/api/items/${id}`, { method: 'DELETE', token });
      navigate('/app');
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }

  async function runAi(mode) {
    setAiMode(mode);
    setAiText('');
    try {
      const data = await api('/api/ai/generate', {
        method: 'POST',
        token,
        body: { mode, itemId: id, prompt: extra },
      });
      setAiText(data.text);
      if (mode === 'summarize') await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setAiMode(null);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="h-72 rounded-3xl bg-white animate-pulse" />
      </AppShell>
    );
  }

  if (!item) {
    return (
      <AppShell>
        <p className="text-mute">Internship not found.</p>
        <Link to="/app" className="text-brand-700 text-sm">
          Back to board
        </Link>
      </AppShell>
    );
  }

  const meta = statusMeta(item.status);
  const days = daysUntil(item.deadline);

  return (
    <AppShell
      title={
        <div>
          <Link to="/app" className="text-sm text-brand-700">
            ← Board
          </Link>
          <h1 className="font-display text-3xl mt-1">{item.title}</h1>
          <p className="text-mute mt-1">{item.company}</p>
        </div>
      }
      action={
        <div className="flex gap-2">
          <Link to={`/app/${id}/edit`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm">
            Edit
          </Link>
          <button onClick={remove} className="rounded-2xl border border-rose-200 text-rose-700 bg-white px-4 py-2.5 text-sm">
            Delete
          </button>
        </div>
      }
    >
      <div className="grid lg:grid-cols-5 gap-5">
        <section className="lg:col-span-3 rounded-3xl bg-white shadow-card border border-slate-100 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full ${meta.tone}`}>{meta.label}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {item.location || 'Location TBD'}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800">
              {days == null
                ? 'No deadline'
                : days < 0
                  ? 'Deadline passed'
                  : days === 0
                    ? 'Due today'
                    : `${days} days left`}
            </span>
          </div>
          <h2 className="mt-6 text-sm font-medium">Notes</h2>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {item.description || 'No notes yet. Edit this card to paste the job posting.'}
          </p>
          {item.ai_summary && (
            <>
              <h2 className="mt-6 text-sm font-medium">Saved AI summary</h2>
              <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-brand-50/70 rounded-2xl p-4">
                {item.ai_summary}
              </p>
            </>
          )}
        </section>

        <aside className="lg:col-span-2 rounded-3xl bg-white shadow-card border border-slate-100 p-5 sm:p-6">
          <p className="font-display text-xl">Gemini assist</p>
          <p className="text-xs text-mute mt-1">Runs on the server. Your API key never leaves the backend.</p>
          <textarea
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Optional extra context (skills, year, why you care)…"
            className="mt-4 w-full min-h-[80px] rounded-2xl border border-slate-200 px-3 py-2.5 text-sm"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {AI_ACTIONS.map((a) => (
              <button
                key={a.mode}
                disabled={Boolean(aiMode)}
                onClick={() => runAi(a.mode)}
                className="text-left rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-brand-50/50 p-3 disabled:opacity-50"
              >
                <span className="block text-sm font-medium">{a.label}</span>
                <span className="block text-[11px] text-mute mt-0.5">{a.hint}</span>
              </button>
            ))}
          </div>
          {aiMode && <p className="text-sm text-brand-700 mt-4">Thinking…</p>}
          {aiText && (
            <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm whitespace-pre-wrap leading-relaxed max-h-80 overflow-auto scrollbar-thin">
              {aiText}
            </div>
          )}
        </aside>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </AppShell>
  );
}
