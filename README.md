# InternTrack

A calm, production-ready full-stack app for students to discover and manage internship applications in one place.

## Live

- **Frontend:** https://interntrack-liard.vercel.app
- **Backend:** https://interntrack-api-m6ia.onrender.com
- **Health:** https://interntrack-api-m6ia.onrender.com/api/health
- **GitHub:** https://github.com/varshagottimukkala/interntrack

Create an account on the live site, add internships, and use Gemini assist (summarize, cover letter, interview prep, next steps). Your session works on phone and laptop.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Supabase (Postgres)
- **AI:** Google Gemini (backend only — the browser never talks to Google)

## Folders

- `client/` — what users see
- `server/` — API, auth, database, Gemini

Secrets live only in `server/.env`. They are never shipped to the browser.

## Local development

```bash
# server
cd server
cp .env.example .env
# fill SUPABASE_*, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL
npm install
npm start

# client
cd client
npm install
npm run dev
```

Frontend defaults to same-origin `/api` (Vite proxy) unless `VITE_API_BASE_URL` is set.

## Environment

### server/.env

- `PORT`
- `CLIENT_URL` — frontend origin
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### client (build-time)

- `VITE_API_BASE_URL` — public backend URL (no trailing slash)

## Auth

Email + password. Passwords hashed with bcrypt. JWT sessions last 7 days and work across devices.

Row Level Security is on: users only see their own profile and internships.
