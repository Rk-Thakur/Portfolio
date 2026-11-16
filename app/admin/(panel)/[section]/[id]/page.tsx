import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createUserClient, supabaseConfigured } from '@/lib/supabase/server';
import { SECTIONS, isSectionKey } from '@/lib/admin/config';
import RecordForm from '@/components/admin/RecordForm';
import ConfirmButton from '@/components/admin/ConfirmButton';
import { deleteRecord, saveRecord } from '../../../actions';

export default async function EditRecord({ params }: { params: Promise<{ section: string; id: string }> }) {
  if (!supabaseConfigured) return null; // layout shows the setup notice
  const { section: key, id } = await params;
  if (!isSectionKey(key)) notFound();
  const section = SECTIONS[key];
  const isNew = id === 'new';
  if (!isNew && !/^\d+$/.test(id)) notFound();

  const supabase = await createUserClient();
  let values: Record<string, unknown> = section.table === 'projects' ? { published: true } : section.table === 'stats' ? { decimals: 0 } : {};

  if (!isNew) {
    const { data } = await supabase.from(section.table).select('*').eq('id', id).maybeSingle();
    if (!data) notFound();
    values = data;
    if (section.table === 'skill_groups') {
      const { data: skills } = await supabase.from('skills').select('name').eq('group_id', id).order('position');
      values = { ...values, items: (skills ?? []).map((s) => s.name) };
    }
    if (section.table === 'experiences') {
      const { data: links } = await supabase.from('experience_projects').select('project_id').eq('experience_id', id).order('position');
      values = { ...values, projects: (links ?? []).map((l) => String(l.project_id)) };
    }
  }

  let projectOptions: { value: string; label: string }[] | undefined;
  if (section.table === 'experiences') {
    const { data: projects } = await supabase.from('projects').select('id, title, icon').order('position');
    projectOptions = (projects ?? []).map((p) => ({ value: String(p.id), label: `${p.icon} ${p.title}` }));
  }

  const title = isNew ? `New ${section.singular}` : String(values[section.titleField] ?? 'Edit');
  return (
    <>
      <header className="adm-head">
        <div>
          <Link href={`/admin/${key}/`} className="adm-back">← {section.label}</Link>
          <h1>{title}</h1>
        </div>
        {!isNew && (
          <ConfirmButton action={deleteRecord.bind(null, key, id)} message={`Delete “${title}”? This can’t be undone.`}>Delete</ConfirmButton>
        )}
      </header>
      <RecordForm
        fields={section.fields}
        values={values}
        action={saveRecord.bind(null, key, id)}
        submitLabel={isNew ? `Create ${section.singular}` : 'Save changes'}
        projectOptions={projectOptions}
        cancelHref={`/admin/${key}/`}
      />
    </>
  );
}
