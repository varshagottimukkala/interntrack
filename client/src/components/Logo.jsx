import { Link } from 'react-router-dom';

export default function Logo({ to = '/', dark = false }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand-700 text-white shadow-card">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden>
          <path d="M6 21V11l10-6 10 6v10l-10 6-10-6z" stroke="white" strokeWidth="2.2" />
          <path d="M16 12v9" stroke="#99F6E4" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <span className={`font-display text-lg tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
        Intern<span className="text-brand-700">Track</span>
      </span>
    </Link>
  );
}
