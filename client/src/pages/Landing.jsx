import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'One board for every application',
    body: 'Capture roles, companies, deadlines, and notes before they scatter across tabs and spreadsheets.',
  },
  {
    title: 'See progress at a glance',
    body: 'Move internships from wishlist to applied, interview, and offer — without losing the thread.',
  },
  {
    title: 'AI that actually helps',
    body: 'Summarize a posting, draft a cover letter, or prep interview questions. Gemini runs only on the server.',
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-fade pointer-events-none" />
      <header className="relative z-10 max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/app"
              className="rounded-full bg-brand-700 text-white text-sm px-4 py-2 hover:bg-brand-800"
            >
              Open board
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-mute hover:text-ink px-3 py-2">
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brand-700 text-white text-sm px-4 py-2 hover:bg-brand-800"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-16 sm:pt-16 sm:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1 mb-5">
              For students who juggle too many tabs
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[56px] leading-[1.05] text-ink">
              Internships, finally in one calm place.
            </h1>
            <p className="mt-5 text-mute text-base sm:text-lg max-w-xl leading-relaxed">
              InternTrack helps you discover and manage internship opportunities — organize applications,
              track progress, and stay on top of deadlines without the spreadsheet chaos.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to={user ? '/app' : '/signup'}
                className="inline-flex justify-center rounded-2xl bg-brand-700 text-white px-5 py-3 text-sm font-medium hover:bg-brand-800 shadow-card"
              >
                Start tracking free
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-medium hover:border-slate-300"
              >
                I already have an account
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              {[
                ['5', 'pipeline stages'],
                ['AI', 'cover letters'],
                ['∞', 'applications'],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-display text-2xl text-ink">{k}</dt>
                  <dd className="text-xs text-mute mt-0.5">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <PreviewCard />
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-4">
          {features.map((f) => (
            <article key={f.title} className="rounded-3xl bg-white shadow-card border border-slate-100 p-6">
              <div className="h-10 w-10 rounded-2xl bg-brand-50 text-brand-700 grid place-items-center mb-4">
                <span className="text-lg">✦</span>
              </div>
              <h2 className="font-medium text-ink">{f.title}</h2>
              <p className="text-sm text-mute mt-2 leading-relaxed">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200/80 py-8 text-center text-xs text-mute">
        InternTrack · built for students who want a clearer internship journey
      </footer>
    </div>
  );
}

function PreviewCard() {
  const rows = [
    { company: 'Northwind Labs', role: 'Product intern', status: 'Interview', tone: 'text-violet-700 bg-violet-50' },
    { company: 'Harbor Health', role: 'Data intern', status: 'Applied', tone: 'text-sky-700 bg-sky-50' },
    { company: 'Lumen Studio', role: 'Design intern', status: 'Wishlist', tone: 'text-slate-700 bg-slate-100' },
  ];
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-brand-100/40 blur-3xl rounded-full" />
      <div className="relative glass rounded-3xl shadow-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium">Your board</p>
          <span className="text-xs text-mute">Spring 2026</span>
        </div>
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.company} className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{r.role}</p>
                <p className="text-xs text-mute mt-0.5">{r.company}</p>
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full ${r.tone}`}>{r.status}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-brand-700 text-white p-4">
          <p className="text-xs uppercase tracking-wide text-brand-100">Gemini assist</p>
          <p className="text-sm mt-1 leading-relaxed">
            “Harbor Health’s posting emphasizes SQL and curiosity. Lead with your campus analytics project, then ask about mentorship.”
          </p>
        </div>
      </div>
    </div>
  );
}
