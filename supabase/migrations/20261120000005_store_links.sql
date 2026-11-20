-- =====================================================================
-- Store links on projects (App Store / Google Play)
-- Adds two optional https:// URL columns and returns them from
-- get_portfolio() as `appStore` and `playStore`. Safe to run more than once.
-- =====================================================================

alter table public.projects
  add column if not exists app_store_url  text,
  add column if not exists play_store_url text;

alter table public.projects drop constraint if exists projects_app_store_url_check;
alter table public.projects drop constraint if exists projects_play_store_url_check;
alter table public.projects
  add constraint projects_app_store_url_check  check (app_store_url  is null or app_store_url  ~ '^https://[^\s]+$'),
  add constraint projects_play_store_url_check check (play_store_url is null or play_store_url ~ '^https://[^\s]+$');

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
               'highlights', to_jsonb(pr.highlights), 'tags', to_jsonb(pr.tags),
               'appStore', pr.app_store_url, 'playStore', pr.play_store_url)
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
