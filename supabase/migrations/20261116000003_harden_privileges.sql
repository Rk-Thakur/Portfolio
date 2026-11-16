-- =====================================================================
-- Defense in depth: Supabase grants broad table privileges to `anon` by
-- default. RLS already blocks visitors from writing, but this removes the
-- privileges themselves, so a future policy mistake can't expose a write.
-- Safe to run more than once.
-- =====================================================================

-- Visitors: read-only on portfolio content
revoke insert, update, delete, truncate, references, trigger
  on public.profile, public.stats, public.strengths, public.skill_groups, public.skills,
     public.projects, public.experiences, public.experience_projects, public.education
  from anon;

-- Visitors: may only INSERT contact messages (never read, edit or delete them)
revoke select, update, delete, truncate, references, trigger on public.contact_messages from anon;
grant insert on public.contact_messages to anon;

-- Visitors: no access at all to the admin list
revoke all on public.admins from anon;

-- Logged-in users: nothing destructive at the table level beyond what RLS allows
revoke truncate, references, trigger
  on public.profile, public.stats, public.strengths, public.skill_groups, public.skills,
     public.projects, public.experiences, public.experience_projects, public.education,
     public.contact_messages, public.admins
  from authenticated;
revoke insert, update, delete on public.admins from authenticated;

-- Functions: only what the site calls
revoke all on function public.get_portfolio() from public;
grant execute on function public.get_portfolio() to anon, authenticated;
