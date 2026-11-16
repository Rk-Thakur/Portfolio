// Describes every editable table once. The admin UI renders forms from this,
// and the server actions use it to parse + validate what was submitted.

export type FieldType =
  | 'text' | 'textarea' | 'lines' | 'number' | 'date' | 'bool' | 'select' | 'slug'
  | 'skills'     // skill_groups: one skill per line, stored in the skills table
  | 'projects';  // experiences: checkboxes of linked case studies

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
  placeholder?: string;
  wide?: boolean;       // span the full form width
  step?: string;        // number inputs
};

export type Section = {
  key: SectionKey;
  table: 'projects' | 'experiences' | 'skill_groups' | 'education' | 'stats' | 'strengths';
  label: string;        // plural, for the menu
  singular: string;
  titleField: string;   // shown in the list
  subtitle?: (row: Record<string, unknown>) => string;
  fields: Field[];
  publishable?: boolean;
};

export type SectionKey = 'projects' | 'experience' | 'skills' | 'education' | 'stats' | 'strengths';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2025-01-01" → "Jan 2025" */
const monthYear = (d: unknown) => {
  const m = /^(\d{4})-(\d{2})/.exec(String(d ?? ''));
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : '';
};

const BOLD_HELP = 'Wrap words in **double asterisks** to make them bold.';

export const SECTIONS: Record<SectionKey, Section> = {
  projects: {
    key: 'projects', table: 'projects', label: 'Projects', singular: 'project', titleField: 'title', publishable: true,
    subtitle: (r) => `${r.badge ?? ''} · ${r.category ?? ''} · /projects/${r.slug ?? ''}`,
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true, placeholder: 'KiiBank — Mobile Banking' },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, help: 'Lowercase words joined by dashes. Used in /projects/<slug>.' },
      { key: 'badge', label: 'Badge', type: 'text', required: true, placeholder: 'FinTech' },
      { key: 'icon', label: 'Icon (emoji)', type: 'text', required: true, placeholder: '🏦' },
      { key: 'category', label: 'Category', type: 'select', required: true, options: [
        { value: 'mobile', label: 'Mobile' }, { value: 'backend', label: 'Backend & AI' }, { value: 'oss', label: 'Open Source' } ] },
      { key: 'published', label: 'Published (visible on the site)', type: 'bool' },
      { key: 'summary', label: 'Summary (card text)', type: 'textarea', required: true, wide: true },
      { key: 'highlights', label: 'Highlights (case-study page)', type: 'lines', wide: true, help: 'One per line.' },
      { key: 'tags', label: 'Tags', type: 'lines', wide: true, help: 'One per line.' },
    ],
  },
  experience: {
    key: 'experience', table: 'experiences', label: 'Experience', singular: 'experience entry', titleField: 'role',
    subtitle: (r) => `${r.company ?? ''} · ${monthYear(r.start_date)} — ${r.end_date ? monthYear(r.end_date) : 'Present'}`,
    fields: [
      { key: 'role', label: 'Role', type: 'text', required: true },
      { key: 'company', label: 'Company', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Lead Flutter Developer · 3 consumer-facing apps' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'start_date', label: 'Start date', type: 'date', required: true, help: 'Only month and year are shown.' },
      { key: 'end_date', label: 'End date', type: 'date', help: 'Leave empty for "Present".' },
      { key: 'independent', label: 'Independent / self-directed (dashed style)', type: 'bool' },
      { key: 'points', label: 'Bullet points', type: 'lines', wide: true, help: `One per line. ${BOLD_HELP}` },
      { key: 'tags', label: 'Tags', type: 'lines', wide: true, help: 'One per line.' },
      { key: 'projects', label: 'Linked case studies', type: 'projects', wide: true },
    ],
  },
  skills: {
    key: 'skills', table: 'skill_groups', label: 'Skills', singular: 'skill group', titleField: 'title',
    subtitle: (r) => `${(r.items as string[] | undefined)?.length ?? 0} skills · icon: ${r.icon ?? ''}`,
    fields: [
      { key: 'title', label: 'Group title', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'select', required: true, options:
        ['code', 'mobile', 'arch', 'server', 'cloud', 'shield', 'db', 'brain', 'tool'].map((v) => ({ value: v, label: v })) },
      { key: 'items', label: 'Skills', type: 'skills', wide: true, help: 'One skill per line, in display order.' },
    ],
  },
  education: {
    key: 'education', table: 'education', label: 'Education', singular: 'education entry', titleField: 'degree',
    subtitle: (r) => `${r.school ?? ''} · ${r.date_label ?? ''}`,
    fields: [
      { key: 'degree', label: 'Degree', type: 'text', required: true },
      { key: 'school', label: 'School', type: 'text', required: true },
      { key: 'date_label', label: 'Dates', type: 'text', required: true, placeholder: 'Aug 2025 — Present' },
      { key: 'location', label: 'Location / note', type: 'text', placeholder: 'Troy, Alabama, USA' },
    ],
  },
  stats: {
    key: 'stats', table: 'stats', label: 'Hero stats', singular: 'stat', titleField: 'label',
    subtitle: (r) => `${r.value ?? ''}${r.suffix ?? ''}`,
    fields: [
      { key: 'value', label: 'Number', type: 'number', required: true, step: 'any' },
      { key: 'suffix', label: 'Suffix', type: 'text', placeholder: '%, k+, ★' },
      { key: 'decimals', label: 'Decimal places', type: 'number', step: '1', help: '0 for 40%, 1 for 4.5★' },
      { key: 'label', label: 'Label', type: 'text', required: true, wide: true },
    ],
  },
  strengths: {
    key: 'strengths', table: 'strengths', label: '"What I bring"', singular: 'strength', titleField: 'area',
    subtitle: (r) => String(r.body ?? '').slice(0, 80),
    fields: [
      { key: 'area', label: 'Area', type: 'text', required: true, placeholder: 'Mobile' },
      { key: 'body', label: 'Text', type: 'textarea', required: true, wide: true },
    ],
  },
};

/** "entry" → "entries", "stat" → "stats" */
export const plural = (word: string, n: number) =>
  n === 1 ? word : word.endsWith('y') ? `${word.slice(0, -1)}ies` : `${word}s`;

export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];
export const isSectionKey = (k: string): k is SectionKey => (SECTION_KEYS as string[]).includes(k);

export const PROFILE_FIELDS: Field[] = [
  { key: 'name', label: 'Full name', type: 'text', required: true },
  { key: 'short_name', label: 'Short name (nav)', type: 'text', required: true },
  { key: 'initials', label: 'Initials (logo)', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'availability', label: 'Availability line (above headline)', type: 'text', wide: true },
  { key: 'hero_headline', label: 'Hero headline', type: 'text', required: true, wide: true },
  { key: 'hero_tagline', label: 'Hero tagline (gradient line)', type: 'text', required: true, wide: true },
  { key: 'hero_intro', label: 'Hero paragraph', type: 'textarea', required: true, wide: true, help: BOLD_HELP },
  { key: 'roles', label: 'Typing roles (terminal line)', type: 'lines', wide: true, help: 'One per line.' },
  { key: 'about_heading', label: 'About heading', type: 'text', required: true, wide: true },
  { key: 'about_intro', label: 'About paragraph', type: 'textarea', required: true, wide: true, help: BOLD_HELP },
  { key: 'about_tags', label: 'About tags', type: 'lines', help: 'One per line.' },
  { key: 'marquee', label: 'Tech ticker', type: 'lines', help: 'One per line.' },
  { key: 'email', label: 'Email', type: 'text', required: true },
  { key: 'phone', label: 'Phone (display)', type: 'text' },
  { key: 'phone_href', label: 'Phone link', type: 'text', placeholder: 'tel:+19174987261' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'github_url', label: 'GitHub URL', type: 'text' },
  { key: 'github_handle', label: 'GitHub handle', type: 'text' },
  { key: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
  { key: 'linkedin_handle', label: 'LinkedIn handle', type: 'text' },
];

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string> };
