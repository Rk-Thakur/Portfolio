# Supabase setup (Stage 2)

Everything the database needs is in this folder:

| File | What it does |
|---|---|
| `migrations/20261115000001_schema.sql` | Creates the tables (profile, stats, strengths, skills, projects, experience, education, contact messages, admins) |
| `migrations/20261115000002_security.sql` | Turns on Row Level Security, adds the access rules, and creates `get_portfolio()` |
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
   3. `seed.sql`
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

## Making yourself admin (needed in Stage 5)

After you sign in once with Supabase Auth, find your user id under **Authentication → Users**, then run:
```sql
insert into public.admins (user_id) values ('YOUR-USER-ID');
```

## Changing content before Stage 5

- Edit rows directly in **Table Editor** — the site will read them once Stage 3 is done.
- Or edit `lib/data.ts`, run `npm run db:seed-sql`, and re-run `seed.sql`.
  ⚠️ Re-running the seed **replaces** all portfolio content (messages and admins are kept).

## Fetching from the site (Stage 3 preview)

```ts
const { data } = await supabase.rpc('get_portfolio'); // same shape as lib/data.ts
await supabase.from('contact_messages').insert({ name, email, body }); // no .select() — visitors can't read back
```
