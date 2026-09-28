# InternTrack

A calm, production-ready full-stack app for students to discover and manage internship applications in one place.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Supabase (Postgres)
- **AI:** Google Gemini (backend only)

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
- `CLIENT_URL` — frontend origin (comma-separated if needed)
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### client (build-time)

- `VITE_API_BASE_URL` — public backend URL (no trailing slash)

## Auth

Email + password. Passwords hashed with bcrypt. JWT sessions last 7 days and work across devices.
