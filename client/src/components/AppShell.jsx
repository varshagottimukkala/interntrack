import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function AppShell({ children, title, action }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const initial = (user?.full_name || user?.email || 'U').slice(0, 1).toUpperCase();

  function signOut() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40">
        <div className="glass border-b border-slate-200/70">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
            <Logo to="/app" />
            <nav className="hidden sm:flex items-center gap-1 text-sm">
              <NavLink
                to="/app"
                end
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full ${isActive ? 'bg-brand-50 text-brand-800' : 'text-mute hover:text-ink'}`
                }
              >
                Board
              </NavLink>
              <NavLink
                to="/app/new"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full ${isActive ? 'bg-brand-50 text-brand-800' : 'text-mute hover:text-ink'}`
                }
              >
                Add internship
              </NavLink>
            </nav>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-slate-200 pl-1 pr-3 py-1">
                <span className="h-8 w-8 grid place-items-center rounded-full bg-brand-700 text-white text-sm font-medium">
                  {initial}
                </span>
                <span className="text-sm max-w-[140px] truncate">{user?.full_name}</span>
              </div>
              <button
                onClick={signOut}
                className="hidden sm:inline-flex text-sm text-mute hover:text-ink px-2"
              >
                Sign out
              </button>
              <button
                className="sm:hidden h-10 w-10 grid place-items-center rounded-xl bg-white border border-slate-200"
                onClick={() => setOpen((v) => !v)}
                aria-label="Menu"
              >
                <span className="text-lg">☰</span>
              </button>
            </div>
          </div>
          {open && (
            <div className="sm:hidden border-t border-slate-200 px-4 py-3 space-y-2">
              <Link to="/app" className="block text-sm py-1" onClick={() => setOpen(false)}>
                Board
              </Link>
              <Link to="/app/new" className="block text-sm py-1" onClick={() => setOpen(false)}>
                Add internship
              </Link>
              <p className="text-xs text-mute pt-1">{user?.email}</p>
              <button onClick={signOut} className="text-sm text-rose-600">
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {(title || action) && (
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>{title}</div>
            {action}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
