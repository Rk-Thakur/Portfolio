-- =====================================================================
-- Access rules (Row Level Security)
--
--   Visitors (anon)      : read portfolio content, send contact messages
--   Admin (you, logged in): read + write everything, read messages
--   Everyone else         : nothing
--
-- RLS is ON for every table, so anything not allowed below is denied.
-- =====================================================================

-- True when the logged-in user is listed in public.admins
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Turn RLS on everywhere
alter table public.profile             enable row level security;
alter table public.stats               enable row level security;
alter table public.strengths           enable row level security;
alter table public.skill_groups        enable row level security;
alter table public.skills              enable row level security;
alter table public.projects            enable row level security;
alter table public.experiences         enable row level security;
alter table public.experience_projects enable row level security;
alter table public.education           enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.admins              enable row level security;

-- ---------------------------------------------------------------------
-- Portfolio content: public read, admin write
-- ---------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['profile','stats','strengths','skill_groups','skills',
                           'experiences','experience_projects','education']
  loop
    execute format('create policy "Public can read %1$s" on public.%1$I for select to anon, authenticated using (true);', t);
    execute format('create policy "Admin can insert %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()));', t);
    execute format('create policy "Admin can update %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));', t);
    execute format('create policy "Admin can delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()));', t);
  end loop;
end $$;

-- Projects: visitors only see published ones; the admin sees drafts too
create policy "Public can read published projects" on public.projects
  for select to anon, authenticated
  using (published or (select public.is_admin()));
create policy "Admin can insert projects" on public.projects
  for insert to authenticated with check ((select public.is_admin()));
create policy "Admin can update projects" on public.projects
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin can delete projects" on public.projects
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Contact messages: anyone can send, only the admin can read/manage.
-- Note: visitors cannot read rows back, so insert WITHOUT .select().
-- ---------------------------------------------------------------------
create policy "Anyone can send a message" on public.contact_messages
  for insert to anon, authenticated
  with check (is_read = false);
create policy "Admin can read messages" on public.contact_messages
  for select to authenticated using ((select public.is_admin()));
create policy "Admin can update messages" on public.contact_messages
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admin can delete messages" on public.contact_messages
  for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- Admins: a user may only see their own row. Rows are added via SQL only.
-- ---------------------------------------------------------------------
create policy "Users can see their own admin row" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Table privileges (RLS above decides which rows)
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profile, public.stats, public.strengths, public.skill_groups, public.skills,
                public.projects, public.experiences, public.experience_projects, public.education
  to anon, authenticated;
grant insert, update, delete on public.profile, public.stats, public.strengths, public.skill_groups, public.skills,
                public.projects, public.experiences, public.experience_projects, public.education
  to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select on public.admins to authenticated;

-- =====================================================================
-- get_portfolio(): the whole site in ONE call, shaped like lib/data.ts
-- SECURITY INVOKER, so the rules above still apply (drafts stay hidden).
--   Frontend:  supabase.rpc('get_portfolio')
-- =====================================================================
create or replace function public.get_portfolio()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', (
      select jsonb_build_object(
        'name', p.name, 'short', p.short_name, 'initials', p.initials, 'title', p.title,
        'email', p.email, 'phone', p.phone, 'phoneHref', p.phone_href, 'location', p.location,
        'github', p.github_url, 'githubHandle', p.github_handle,
        'linkedin', p.linkedin_url, 'linkedinHandle', p.linkedin_handle,
        'availability', p.availability, 'heroHeadline', p.hero_headline, 'heroTagline', p.hero_tagline,
        'heroIntro', p.hero_intro, 'aboutHeading', p.about_heading, 'aboutIntro', p.about_intro,
        'roles', to_jsonb(p.roles), 'aboutTags', to_jsonb(p.about_tags)
      )
      from public.profile p where p.id = 1
    ),
    'marquee', coalesce((select to_jsonb(p.marquee) from public.profile p where p.id = 1), '[]'::jsonb),
    'stats', coalesce((
      select jsonb_agg(jsonb_build_object(
               'value', s.value, 'suffix', s.suffix, 'label', s.label, 'decimals', s.decimals)
             order by s.position, s.id)
      from public.stats s
    ), '[]'::jsonb),
    'strengths', coalesce((
      select jsonb_agg(jsonb_build_object('area', s.area, 'text', s.body) order by s.position, s.id)
      from public.strengths s
    ), '[]'::jsonb),
    'skills', coalesce((
      select jsonb_agg(jsonb_build_object(
               'title', g.title, 'icon', g.icon,
               'items', coalesce((select jsonb_agg(sk.name order by sk.position, sk.id)
                                  from public.skills sk where sk.group_id = g.id), '[]'::jsonb))
             order by g.position, g.id)
      from public.skill_groups g
    ), '[]'::jsonb),
    'experience', coalesce((
      select jsonb_agg(jsonb_build_object(
               'role', e.role, 'company', e.company, 'sub', e.subtitle,
               'date', to_char(e.start_date, 'Mon YYYY') || ' — ' ||
                       coalesce(to_char(e.end_date, 'Mon YYYY'), 'Present'),
               'startDate', e.start_date, 'endDate', e.end_date,
               'location', e.location, 'points', to_jsonb(e.points), 'tags', to_jsonb(e.tags),
               'independent', e.independent,
               'projects', coalesce((
                 select jsonb_agg(pr.slug order by ep.position)
                 from public.experience_projects ep
                 join public.projects pr on pr.id = ep.project_id
                 where ep.experience_id = e.id
               ), '[]'::jsonb))
             order by e.position, e.start_date desc)
      from public.experiences e
    ), '[]'::jsonb),
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object(
               'slug', pr.slug, 'title', pr.title, 'badge', pr.badge, 'icon', pr.icon,
               'cat', pr.category, 'summary', pr.summary,
               'highlights', to_jsonb(pr.highlights), 'tags', to_jsonb(pr.tags))
             order by pr.position, pr.id)
      from public.projects pr
    ), '[]'::jsonb),
    'education', coalesce((
      select jsonb_agg(jsonb_build_object(
               'date', ed.date_label, 'degree', ed.degree, 'school', ed.school, 'loc', ed.location)
             order by ed.position, ed.id)
      from public.education ed
    ), '[]'::jsonb)
  );
$$;
revoke all on function public.get_portfolio() from public;
grant execute on function public.get_portfolio() to anon, authenticated;
