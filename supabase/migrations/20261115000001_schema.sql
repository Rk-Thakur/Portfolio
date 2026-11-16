-- =====================================================================
-- Portfolio schema
-- Mirrors lib/data.ts. Every list has a `position` column so order is
-- controlled explicitly (lowest first).
-- =====================================================================

-- Keeps updated_at current on every UPDATE
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Profile: exactly one row (id is always 1)
-- Text fields may use **bold** markers, rendered by the site.
-- ---------------------------------------------------------------------
create table public.profile (
  id               smallint primary key default 1 check (id = 1),
  name             text not null,
  short_name       text not null,
  initials         text not null check (char_length(initials) <= 4),
  title            text not null,
  email            text not null,
  phone            text,
  phone_href       text,
  location         text,
  github_url       text,
  github_handle    text,
  linkedin_url     text,
  linkedin_handle  text,
  availability     text,                       -- hero line above the headline
  hero_headline    text not null,              -- "Mobile & Software Engineer."
  hero_tagline     text not null,              -- gradient line
  hero_intro       text not null,              -- hero paragraph
  about_heading    text not null,
  about_intro      text not null,
  roles            text[] not null default '{}',   -- typing rotator
  about_tags       text[] not null default '{}',
  marquee          text[] not null default '{}',   -- tech ticker
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Hero stats ("40% faster delivery")
-- ---------------------------------------------------------------------
create table public.stats (
  id          bigint generated always as identity primary key,
  value       numeric(10, 2) not null,
  suffix      text not null default '',
  label       text not null,
  decimals    smallint not null default 0 check (decimals between 0 and 3),
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- "What I bring" list in About
-- ---------------------------------------------------------------------
create table public.strengths (
  id          bigint generated always as identity primary key,
  area        text not null,
  body        text not null,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Skills: groups (cards) and the skills inside them
-- ---------------------------------------------------------------------
create table public.skill_groups (
  id          bigint generated always as identity primary key,
  title       text not null unique,
  icon        text not null check (icon in ('code','mobile','arch','server','cloud','shield','db','brain','tool')),
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

create table public.skills (
  id          bigint generated always as identity primary key,
  group_id    bigint not null references public.skill_groups (id) on delete cascade,
  name        text not null,
  position    integer not null default 0,
  unique (group_id, name)
);
create index skills_group_id_idx on public.skills (group_id, position);

-- ---------------------------------------------------------------------
-- Projects (cards + /projects/[slug] case-study pages)
-- ---------------------------------------------------------------------
create table public.projects (
  id          bigint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null,
  badge       text not null,
  icon        text not null,                     -- emoji
  category    text not null check (category in ('mobile','backend','oss')),
  summary     text not null,
  highlights  text[] not null default '{}',
  tags        text[] not null default '{}',
  published   boolean not null default true,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index projects_position_idx on public.projects (position);

-- ---------------------------------------------------------------------
-- Experience timeline
-- end_date NULL means "Present". points may use **bold** markers.
-- ---------------------------------------------------------------------
create table public.experiences (
  id           bigint generated always as identity primary key,
  role         text not null,
  company      text not null,
  subtitle     text,
  start_date   date not null,
  end_date     date,
  location     text,
  points       text[] not null default '{}',
  tags         text[] not null default '{}',
  independent  boolean not null default false,   -- self-directed work (dashed style)
  position     integer not null default 0,
  updated_at   timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

-- Which case studies an experience entry links to
create table public.experience_projects (
  experience_id  bigint not null references public.experiences (id) on delete cascade,
  project_id     bigint not null references public.projects (id) on delete cascade,
  position       integer not null default 0,
  primary key (experience_id, project_id)
);

-- ---------------------------------------------------------------------
-- Education
-- ---------------------------------------------------------------------
create table public.education (
  id          bigint generated always as identity primary key,
  date_label  text not null,                  -- free text, e.g. "Higher Secondary"
  degree      text not null,
  school      text not null,
  location    text,
  position    integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Contact form messages (written by visitors, read only by the admin)
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject     text check (subject is null or char_length(subject) <= 200),
  body        text not null check (char_length(body) between 10 and 5000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------
-- Admins: Supabase Auth users allowed to edit content (just you)
-- Add yourself after first login:  insert into public.admins (user_id) values ('<your auth user id>');
-- ---------------------------------------------------------------------
create table public.admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- updated_at triggers
create trigger profile_updated_at      before update on public.profile      for each row execute function public.set_updated_at();
create trigger stats_updated_at        before update on public.stats        for each row execute function public.set_updated_at();
create trigger strengths_updated_at    before update on public.strengths    for each row execute function public.set_updated_at();
create trigger skill_groups_updated_at before update on public.skill_groups for each row execute function public.set_updated_at();
create trigger projects_updated_at     before update on public.projects     for each row execute function public.set_updated_at();
create trigger experiences_updated_at  before update on public.experiences  for each row execute function public.set_updated_at();
create trigger education_updated_at    before update on public.education    for each row execute function public.set_updated_at();
