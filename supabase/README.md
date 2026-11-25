# Supabase setup (Stage 2)

Everything the database needs is in this folder:

| File | What it does |
|---|---|
| `migrations/20261115000001_schema.sql` | Creates the tables (profile, stats, strengths, skills, projects, experience, education, contact messages, admins) |
| `migrations/20261115000002_security.sql` | Turns on Row Level Security, adds the access rules, and creates `get_portfolio()` |
| `migrations/20261116000003_harden_privileges.sql` | Removes table permissions visitors don't need (second lock behind RLS) |
| `migrations/20261120000005_store_links.sql` | Adds App Store / Google Play links to projects |
| `migrations/20261125000006_blog_posts.sql` | Creates the `posts` table for the blog (drafts hidden from visitors) |
| `seed.sql` | Fills the tables with the content currently on the site (generated — see below) |

## Access rules

| Who | Can do |
|---|---|
| Visitor (not logged in) | Read portfolio content (published projects only) and **send** a contact message |
| Logged-in user who is **not** an admin | Same as a visitor |
| Admin (you, listed in `admins`) | Read and edit everything, read and manage messages, see draft projects |

These were tested on a local Postgres: visitors cannot edit content or read messages,
non-admins change 0 rows, drafts are hidden from visitors, and invalid emails are rejected.

## Option A — Supabase dashboard (no tools needed)

1. Create a free project at supabase.com (pick a region near your visitors, e.g. US East).
2. Open **SQL Editor → New query**, paste the contents of each file **in this order**, and click **Run**:
   1. `migrations/20261115000001_schema.sql`
   2. `migrations/20261115000002_security.sql`
   3. `migrations/20261116000003_harden_privileges.sql`
   4. `migrations/20261120000005_store_links.sql`
   5. `migrations/20261125000006_blog_posts.sql`
   6. `seed.sql`
3. Check it worked — run:
   ```sql
   select public.get_portfolio();
   ```
   You should see your whole portfolio as JSON.
4. Copy the keys: **Project Settings → API**. Put the Project URL and the anon/publishable key in
   `.env.local` (copy `.env.example`). Keep the service-role key secret.

## Option B — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref YOUR-PROJECT-REF
npx supabase db push
```
Then run `seed.sql` once in the SQL Editor (or `psql "$DATABASE_URL" -f supabase/seed.sql`).

## Admin page (Stage 5) — one-time setup

1. **Create your login:** Supabase → **Authentication → Users → Add user → Create new user**.
   Enter your email and a strong password, and tick **Auto Confirm User**.
2. **Turn off public sign-ups** (only you should have an account):
   **Authentication → Sign In / Providers** → turn off **Allow new users to sign up**.
3. **Sign in** at `/admin/login/` (locally: http://localhost:3000/admin/login/).
   The first time, you'll see **"Not an admin yet"** with a ready-made SQL line containing your user id.
4. Run that line in **SQL Editor**, e.g.
   ```sql
   insert into public.admins (user_id) values ('YOUR-USER-ID');
   ```
5. Reload `/admin/` — you can now edit everything. Saving updates the live site immediately.

## Other ways to change content

- Use the admin page at `/admin/` (recommended), or edit rows directly in **Table Editor**.
- Or edit `lib/data.ts`, run `npm run db:seed-sql`, and re-run `seed.sql`.
  ⚠️ Re-running the seed **replaces** all portfolio content (messages and admins are kept).

## Fetching from the site (Stage 3 preview)

```ts
const { data } = await supabase.rpc('get_portfolio'); // same shape as lib/data.ts
await supabase.from('contact_messages').insert({ name, email, body }); // no .select() — visitors can't read back
```

