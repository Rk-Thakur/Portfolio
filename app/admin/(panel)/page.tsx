import { createUserClient, supabaseConfigured } from '@/lib/supabase/server';
import { SECTIONS, SECTION_KEYS, plural, type SectionKey } from '@/lib/admin/config';
import Dashboard, { type RecentEdit, type SectionStat } from '@/components/admin/Dashboard';

// Tables with an updated_at column, and which field names the row
const RECENT_SOURCES: { section: SectionKey; table: string; title: string }[] = [
  { section: 'projects', table: 'projects', title: 'title' },
  { section: 'experience', table: 'experiences', title: 'role' },
  { section: 'skills', table: 'skill_groups', title: 'title' },
  { section: 'education', table: 'education', title: 'degree' },
  { section: 'stats', table: 'stats', title: 'label' },
  { section: 'strengths', table: 'strengths', title: 'area' },
];

export default async function DashboardPage() {
  if (!supabaseConfigured) return null; // layout shows the setup notice
  const supabase = await createUserClient();

  const [stats, drafts, skills, profile, ...recentLists] = await Promise.all([
    Promise.all(
      SECTION_KEYS.map(async (k): Promise<SectionStat> => {
        const { count } = await supabase.from(SECTIONS[k].table).select('id', { count: 'exact', head: true });
        return { key: k, label: SECTIONS[k].label, count: count ?? 0, unit: plural(SECTIONS[k].singular, count ?? 0) };
      })
    ),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('published', false),
    supabase.from('skills').select('id', { count: 'exact', head: true }),
    supabase.from('profile').select('short_name, updated_at').eq('id', 1).single(),
    ...RECENT_SOURCES.map((s) =>
      supabase.from(s.table).select(`id, ${s.title}, updated_at`).order('updated_at', { ascending: false }).limit(5)
    ),
  ]);

  const recent: RecentEdit[] = RECENT_SOURCES.flatMap((s, i) =>
    ((recentLists[i].data ?? []) as unknown as Record<string, unknown>[]).map((r) => ({
      section: s.section,
      sectionLabel: SECTIONS[s.section].label,
      title: String(r[s.title] ?? ''),
      href: `/admin/${s.section}/${r.id}/`,
      updatedAt: String(r.updated_at),
    }))
  );
  if (profile.data?.updated_at) {
    recent.push({ section: 'profile', sectionLabel: 'Profile & hero', title: 'Hero, About & contact text', href: '/admin/profile/', updatedAt: profile.data.updated_at });
  }
  recent.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <Dashboard
      name={(profile.data?.short_name ?? '').split(' ')[0] || 'there'}
      stats={stats}
      drafts={drafts.count ?? 0}
      totalSkills={skills.count ?? 0}
      recent={recent.slice(0, 6)}
    />
  );
}
