import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { STATUSES, daysUntil, statusMeta } from '../lib/status';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const data = await api('/api/items', { token });
        if (live) setItems(data.items || []);
      } catch (err) {
        if (live) setToast({ type: 'error', message: err.message });
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [token]);

  const counts = useMemo(() => {
    const c = { all: items.length };
    STATUSES.forEach((s) => {
      c[s.id] = items.filter((i) => i.status === s.id).length;
    });
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((i) => {
      if (filter !== 'all' && i.status !== filter) return false;
      if (!query) return true;
      return [i.title, i.company, i.location, i.description].some((v) =>
        String(v || '').toLowerCase().includes(query)
      );
    });
  }, [items, q, filter]);

  const first = user?.full_name?.split(' ')[0] || 'there';

  return (
    <AppShell
      title={
        <div>
          <p className="text-sm text-mute">Hello, {first}</p>
          <h1 className="font-display text-3xl mt-1">Your internship board</h1>
        </div>
      }
      action={
        <Link
          to="/app/new"
          className="inline-flex justify-center rounded-2xl bg-brand-700 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-800"
        >
          Add internship
        </Link>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Stat label="Total" value={counts.all} />
        {STATUSES.map((s) => (
          <Stat key={s.id} label={s.label} value={counts[s.id] || 0} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search role, company, city…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            All
          </Chip>
          {STATUSES.map((s) => (
            <Chip key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 rounded-3xl bg-white/70 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState hasItems={items.length > 0} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </AppShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-card px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-mute">{label}</p>
      <p className="font-display text-2xl mt-1">{value}</p>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border ${
        active ? 'bg-brand-700 text-white border-brand-700' : 'bg-white text-mute border-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function Card({ item }) {
  const meta = statusMeta(item.status);
  const days = daysUntil(item.deadline);
  return (
    <Link
      to={`/app/${item.id}`}
      className="block rounded-3xl bg-white border border-slate-100 shadow-card p-5 hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-mute">{item.company}</p>
          <h3 className="font-medium mt-0.5 leading-snug">{item.title}</h3>
        </div>
        <span className={`text-[11px] px-2 py-1 rounded-full ${meta.tone}`}>{meta.label}</span>
      </div>
      <p className="text-sm text-mute mt-3 line-clamp-2 min-h-[40px]">
        {item.description || 'No notes yet — add a posting summary when you are ready.'}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-mute">
        <span>{item.location || 'Location TBD'}</span>
        <span>
          {days == null
            ? 'No deadline'
            : days < 0
              ? 'Deadline passed'
              : days === 0
                ? 'Due today'
                : `${days}d left`}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ hasItems }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
      <p className="font-display text-2xl">{hasItems ? 'Nothing matches' : 'Your board is empty'}</p>
      <p className="text-sm text-mute mt-2 max-w-md mx-auto">
        {hasItems
          ? 'Try another filter or search term.'
          : 'Add the first internship you are eyeing. InternTrack will keep the rest of the journey in order.'}
      </p>
      {!hasItems && (
        <Link
          to="/app/new"
          className="inline-flex mt-5 rounded-2xl bg-brand-700 text-white px-4 py-2.5 text-sm"
        >
          Add your first internship
        </Link>
      )}
    </div>
  );
}
