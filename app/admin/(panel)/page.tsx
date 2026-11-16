import Link from 'next/link';
import { createUserClient } from '@/lib/supabase/server';
import { SECTIONS, SECTION_KEYS, plural } from '@/lib/admin/config';

export default async function Dashboard() {
  const supabase = await createUserClient();
  const counts = await Promise.all(
    SECTION_KEYS.map(async (k) => {
      const { count } = await supabase.from(SECTIONS[k].table).select('id', { count: 'exact', head: true });
      return [k, count ?? 0] as const;
    })
  );
  const { count: drafts } = await supabase.from('projects').select('id', { count: 'exact', head: true }).eq('published', false);
  const { data: profile } = await supabase.from('profile').select('updated_at').eq('id', 1).single();

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p className="adm-muted">Changes you save here appear on the live site immediately.</p>
        </div>
      </header>

      <div className="adm-cards">
        <Link href="/admin/profile/" className="adm-card">
          <span className="adm-card__label">Profile & hero</span>
          <strong>Edit text</strong>
          <span className="adm-muted adm-small">
            {profile?.updated_at ? `Updated ${new Date(profile.updated_at).toLocaleString()}` : 'Headline, intro, About, contact links'}
          </span>
        </Link>
        {counts.map(([k, n]) => (
          <Link key={k} href={`/admin/${k}/`} className="adm-card">
            <span className="adm-card__label">{SECTIONS[k].label}</span>
            <strong>{n}</strong>
            <span className="adm-muted adm-small">{k === 'projects' && drafts ? `${drafts} draft${drafts > 1 ? 's' : ''}` : plural(SECTIONS[k].singular, n)}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
