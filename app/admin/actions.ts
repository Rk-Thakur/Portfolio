'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { createUserClient, getAdmin, supabaseConfigured } from '@/lib/supabase/server';
import { PROFILE_FIELDS, SECTIONS, isSectionKey, type Field, type FormState } from '@/lib/admin/config';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!supabaseConfigured) return { ok: false, message: 'Supabase keys are missing on this deployment.' };
  if (!email || !password) return { ok: false, message: 'Enter your email and password.' };

  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: 'Email or password is incorrect.' };
  redirect('/admin/');
}

export async function signOut() {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect('/admin/login/');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function requireAdmin() {
  const { supabase, isAdmin } = await getAdmin();
  if (!isAdmin) throw new Error('Not authorized');
  return supabase;
}

/** Rebuild the public pages right away (instead of waiting up to 5 minutes). */
function refreshSite() {
  revalidateTag('portfolio');
  revalidatePath('/', 'layout');
}

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);

/** Turn submitted form data into a database row, collecting field errors. */
function parse(fields: Field[], formData: FormData) {
  const row: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === 'skills' || f.type === 'projects') continue; // handled separately
    const raw = formData.get(f.key);
    switch (f.type) {
      case 'bool':
        row[f.key] = raw === 'on';
        break;
      case 'lines':
        row[f.key] = lines(raw);
        if (f.required && !(row[f.key] as string[]).length) errors[f.key] = 'Add at least one line.';
        break;
      case 'number': {
        const s = String(raw ?? '').trim();
        if (!s) { if (f.required) errors[f.key] = 'Required.'; else row[f.key] = f.key === 'decimals' ? 0 : null; break; }
        const n = Number(s);
        if (!Number.isFinite(n)) errors[f.key] = 'Enter a number.';
        else row[f.key] = n;
        break;
      }
      case 'date': {
        const s = String(raw ?? '').trim();
        if (!s) { if (f.required) errors[f.key] = 'Required.'; row[f.key] = null; break; }
        if (!DATE_RE.test(s)) errors[f.key] = 'Use a valid date.';
        row[f.key] = s;
        break;
      }
      default: {
        const s = String(raw ?? '').trim();
        if (f.required && !s) { errors[f.key] = 'Required.'; break; }
        if (f.type === 'slug' && s && !SLUG_RE.test(s)) { errors[f.key] = 'Use lowercase letters, numbers and dashes (e.g. my-app).'; break; }
        if (f.type === 'select' && s && f.options && !f.options.some((o) => o.value === s)) { errors[f.key] = 'Pick an option.'; break; }
        row[f.key] = s; // empty optional text is saved as '' (some columns don't allow NULL)
      }
    }
  }
  return { row, errors };
}

function dbError(error: { code?: string; message: string }): FormState {
  if (error.code === '23505') return { ok: false, message: 'That value is already used (for projects, the slug must be unique).', errors: { slug: 'Already used by another project.' } };
  if (error.code === '23514') return { ok: false, message: 'One of the values isn’t allowed (for example, the end date is before the start date).' };
  if (error.code === '42501') return { ok: false, message: 'You don’t have permission to change this.' };
  return { ok: false, message: `Couldn’t save: ${error.message}` };
}

// ---------------------------------------------------------------------------
// Records (projects, experience, skills, education, stats, strengths)
// ---------------------------------------------------------------------------
export async function saveRecord(sectionKey: string, id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isSectionKey(sectionKey)) return { ok: false, message: 'Unknown section.' };
  const section = SECTIONS[sectionKey];
  let supabase;
  try { supabase = await requireAdmin(); } catch { return { ok: false, message: 'Your session expired. Please sign in again.' }; }

  const { row, errors } = parse(section.fields, formData);
  if (section.table === 'experiences' && row.start_date && row.end_date && String(row.end_date) < String(row.start_date)) {
    errors.end_date = 'End date must be after the start date.';
  }
  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', errors };

  let recordId = id;
  if (id === 'new') {
    const { data: last } = await supabase.from(section.table).select('position').order('position', { ascending: false }).limit(1);
    row.position = ((last?.[0]?.position as number | undefined) ?? -1) + 1;
    const { data, error } = await supabase.from(section.table).insert(row).select('id').single();
    if (error) return dbError(error);
    recordId = String(data.id);
  } else {
    const { error, count } = await supabase.from(section.table).update(row, { count: 'exact' }).eq('id', id);
    if (error) return dbError(error);
    if (!count) return { ok: false, message: 'That item no longer exists.' };
  }

  // Skills live in their own table
  if (section.table === 'skill_groups') {
    const items = [...new Set(lines(formData.get('items')))];
    const del = await supabase.from('skills').delete().eq('group_id', recordId);
    if (del.error) return dbError(del.error);
    if (items.length) {
      const ins = await supabase.from('skills').insert(items.map((name, i) => ({ group_id: Number(recordId), name, position: i })));
      if (ins.error) return dbError(ins.error);
    }
  }

  // Experience → linked case studies
  if (section.table === 'experiences') {
    const projectIds = formData.getAll('projects').map(Number).filter(Number.isFinite);
    const del = await supabase.from('experience_projects').delete().eq('experience_id', recordId);
    if (del.error) return dbError(del.error);
    if (projectIds.length) {
      const ins = await supabase.from('experience_projects').insert(
        projectIds.map((pid, i) => ({ experience_id: Number(recordId), project_id: pid, position: i })));
      if (ins.error) return dbError(ins.error);
    }
  }

  refreshSite();
  redirect(`/admin/${sectionKey}/?saved=1`);
}

export async function deleteRecord(sectionKey: string, id: string) {
  if (!isSectionKey(sectionKey)) return;
  const supabase = await requireAdmin();
  await supabase.from(SECTIONS[sectionKey].table).delete().eq('id', id);
  refreshSite();
  redirect(`/admin/${sectionKey}/?deleted=1`);
}

export async function moveRecord(sectionKey: string, id: string, dir: 'up' | 'down') {
  if (!isSectionKey(sectionKey)) return;
  const supabase = await requireAdmin();
  const table = SECTIONS[sectionKey].table;
  const { data } = await supabase.from(table).select('id, position').order('position').order('id');
  if (!data) return;
  const ids = data.map((r) => String(r.id));
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  // Renumber everything so positions stay 0, 1, 2, …
  await Promise.all(ids.map((rid, pos) => supabase.from(table).update({ position: pos }).eq('id', rid)));
  refreshSite();
  revalidatePath(`/admin/${sectionKey}/`);
}

export async function togglePublished(id: string, published: boolean) {
  const supabase = await requireAdmin();
  await supabase.from('projects').update({ published }).eq('id', id);
  refreshSite();
  revalidatePath('/admin/projects/');
}

// ---------------------------------------------------------------------------
// Profile (single row)
// ---------------------------------------------------------------------------
export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  let supabase;
  try { supabase = await requireAdmin(); } catch { return { ok: false, message: 'Your session expired. Please sign in again.' }; }
  const { row, errors } = parse(PROFILE_FIELDS, formData);
  if (Object.keys(errors).length) return { ok: false, message: 'Please fix the highlighted fields.', errors };
  const { error } = await supabase.from('profile').update(row).eq('id', 1);
  if (error) return dbError(error);
  refreshSite();
  return { ok: true, message: 'Saved. The live site is updated.' };
}
