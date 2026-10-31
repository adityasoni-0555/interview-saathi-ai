# Interview Saathi AI

AI-powered mock interview practice. Pick a role, level and interview type; Claude generates realistic questions, scores each answer, and returns strengths, gaps, a model answer and tips. Sessions are saved to Supabase so you can track progress.

**Stack:** React 19, Vite, TypeScript, Supabase (Auth, Postgres, Edge Functions), Claude API (`claude-opus-5-5`).

## Architecture

```
Browser (React)  --supabase.functions.invoke-->  Edge Function `interview-ai`  -->  Claude API
      |                (user JWT attached)        (holds ANTHROPIC_API_KEY)
      +--> Supabase Postgres `interview_sessions` (row-level security, own rows only)
```

The Claude API key exists **only** as a Supabase Edge Function secret. It is never in frontend code, `.env.local`, or any `VITE_` variable.

## Setup

1. **Frontend env** - copy `.env.example` to `.env.local` and fill in your Supabase URL and publishable key.
2. **Install** - `npm install`
3. **Supabase CLI** - `npx supabase login` then `npx supabase link --project-ref YOUR-PROJECT-REF`
4. **Database** - `npx supabase db push` (or paste `supabase/migrations/*.sql` into the SQL editor).
5. **Claude key** - `npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
   Optional: `npx supabase secrets set ALLOWED_ORIGIN=https://your-domain.com` to restrict CORS.
6. **Deploy the function** - `npx supabase functions deploy interview-ai`
7. **Auth redirect** - in Supabase Dashboard > Authentication > URL Configuration, add your site URL(s) (e.g. `http://localhost:5173`) so password-reset links work.
8. **Run** - `npm run dev`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |

## Project layout

```
src/
  App.tsx                 auth gate + app shell + navigation
  components/             AuthScreen, Dashboard, Practice, FeedbackCard, History, Resources
  lib/supabase.ts         Supabase client (public keys only)
  lib/interviewApi.ts     calls the interview-ai Edge Function
  lib/sessions.ts         save/list/delete practice sessions
supabase/
  functions/interview-ai/ Claude-backed question generation and answer evaluation
  migrations/             interview_sessions table + RLS policies
_backups/                 original files from before the rebuild (safe to delete once you're happy)
```
