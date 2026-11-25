import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createUserClient, supabaseConfigured } from '@/lib/supabase/server';
import { SECTIONS, isSectionKey, plural } from '@/lib/admin/config';
import { deleteRecord, moveRecord, togglePublished } from '../../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';
import SortableList from '@/components/admin/SortableList';
import Flash from '@/components/admin/Flash';

export default async function SectionList({
  params, searchParams,
}: { params: Promise<{ section: string }>; searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  if (!supabaseConfigured) return null; // layout shows the setup notice
  const { section: key } = await params;
  const sp = await searchParams;
  if (!isSectionKey(key)) notFound();
  const section = SECTIONS[key];

  const supabase = await createUserClient();
  const select = section.table === 'skill_groups' ? '*, skills(name)' : '*';
  const { data: rows, error } = section.dateOrder
    ? await supabase.from(section.table).select(select).order('position').order(section.dateOrder, { ascending: false }).order('id', { ascending: false })
    : await supabase.from(section.table).select(select).order('position').order('id');
  const list = ((rows ?? []) as unknown as Record<string, unknown>[]).map((r) =>
    section.table === 'skill_groups' ? { ...r, items: (r.skills as { name: string }[] | undefined)?.map((s) => s.name) ?? [] } : r
  );

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>{section.label}</h1>
          <p className="adm-muted">{list.length} {plural(section.singular, list.length)} · {section.draggable ? 'drag ⠿ to change the order on the site.' : 'use ↑ ↓ to change the order on the site.'}</p>
        </div>
        <Link href={`/admin/${key}/new/`} className="adm-btn adm-btn--primary">+ Add {section.singular}</Link>
      </header>

      {sp.saved && <Flash key={`s-${sp.saved}`} param="saved" message="Saved. The live site is updated." />}
      {sp.deleted && <Flash key={`d-${sp.deleted}`} param="deleted" message="Deleted." />}
      {error && <p className="adm-alert adm-alert--error">Couldn’t load: {error.message}</p>}

      {section.draggable ? (
        <SortableList
          sectionKey={key}
          items={list.map((r) => ({
            id: String(r.id),
            title: String(r[section.titleField] ?? '(untitled)'),
            subtitle: section.subtitle?.(r) ?? '',
            cover: String(r.cover ?? r.icon ?? '•'),
            published: !!r.published,
            publicHref: section.publicPath && r.published ? section.publicPath(r) : null,
          }))}
        />
      ) : (
      <ol className="adm-list">
        {list.map((r, i) => {
          const id = String(r.id);
          const title = String(r[section.titleField] ?? '(untitled)');
          return (
            <li key={id} className={`adm-row${section.publishable && !r.published ? ' is-draft' : ''}`}>
              <div className="adm-row__order">
                <form action={moveRecord.bind(null, key, id, 'up')}><button className="adm-icon" disabled={i === 0} aria-label={`Move ${title} up`}>↑</button></form>
                <form action={moveRecord.bind(null, key, id, 'down')}><button className="adm-icon" disabled={i === list.length - 1} aria-label={`Move ${title} down`}>↓</button></form>
              </div>
              <Link href={`/admin/${key}/${id}/`} className="adm-row__main">
                <strong>{section.table === 'projects' && r.icon ? `${r.icon} ` : ''}{title}</strong>
                {section.subtitle && <span className="adm-muted adm-small">{section.subtitle(r)}</span>}
              </Link>
              <div className="adm-row__actions">
                {section.publishable && (
                  <form action={togglePublished.bind(null, key, id, !r.published)}>
                    <button className={`adm-pill${r.published ? ' is-on' : ''}`} title="Show or hide on the site">
                      {r.published ? 'Published' : 'Draft'}
                    </button>
                  </form>
                )}
                <Link href={`/admin/${key}/${id}/`} className="adm-btn adm-btn--ghost adm-btn--sm">Edit</Link>
                <ConfirmButton action={deleteRecord.bind(null, key, id)} message={`Delete “${title}”? This can’t be undone.`}>Delete</ConfirmButton>
              </div>
            </li>
          );
        })}
      </ol>
      )}
      {!list.length && <p className="adm-muted">Nothing here yet.</p>}
    </>
  );
}
