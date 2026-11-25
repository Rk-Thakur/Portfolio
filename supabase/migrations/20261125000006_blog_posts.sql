-- =====================================================================
-- Blog posts
--   Visitors: read published posts only (drafts stay hidden)
--   Admin   : read + write everything
-- The body is Markdown, rendered on the site (raw HTML is not allowed).
-- Safe to run more than once.
-- =====================================================================

create table if not exists public.posts (
  id            bigint generated always as identity primary key,
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text not null check (char_length(title) between 1 and 200),
  excerpt       text not null default '' check (char_length(excerpt) <= 400),
  cover         text not null default '✍️',          -- emoji shown on cards
  tags          text[] not null default '{}',
  body          text not null default '' check (char_length(body) <= 200000),
  published     boolean not null default false,
  published_on  date not null default current_date,  -- date shown on the site; newest first
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_published_on_idx on public.posts (published_on desc, id desc);

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Public can read published posts" on public.posts;
drop policy if exists "Admin can insert posts" on public.posts;
drop policy if exists "Admin can update posts" on public.posts;
drop policy if exists "Admin can delete posts" on public.posts;

create policy "Public can read published posts" on public.posts
  for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admin can insert posts" on public.posts
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin can update posts" on public.posts
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin can delete posts" on public.posts
  for delete to authenticated using ((select public.is_admin()));

-- Privileges: visitors read-only; logged-in users write (RLS limits it to the admin)
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
