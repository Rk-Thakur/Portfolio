'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { ACCEPTED, TEMPLATE, parsePostFile, type ImportedPost } from '@/lib/admin/import-post';

type Status = { kind: 'idle' | 'reading' | 'done' | 'error'; message?: string; filled?: string[] };

const LABELS: Record<keyof ImportedPost, string> = {
  title: 'Title', slug: 'URL slug', cover: 'Cover', published_on: 'Date', excerpt: 'Excerpt',
  tags: 'Tags', body: 'Post', published: 'Published',
};

/** Fills the post form's fields; the post editor listens for "adm:set" to update its own state. */
function fill(form: HTMLFormElement, post: ImportedPost) {
  const filled: string[] = [];
  const set = (name: string, value: string) => {
    const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    if (name === 'body') el.dispatchEvent(new CustomEvent('adm:set', { detail: value }));
    else el.value = value;
    const field = el.closest('.adm-field');
    field?.classList.remove('adm-filled');
    void (field as HTMLElement | null)?.offsetWidth; // restart the highlight animation
    field?.classList.add('adm-filled');
  };
  for (const key of Object.keys(LABELS) as (keyof ImportedPost)[]) {
    const v = post[key];
    if (v === undefined) continue;
    if (key === 'published') {
      const box = form.elements.namedItem('published') as HTMLInputElement | null;
      if (box) box.checked = Boolean(v);
    } else {
      set(key, Array.isArray(v) ? v.join('\n') : String(v));
    }
    filled.push(LABELS[key]);
  }
  return filled;
}

export default function ImportPost() {
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const handle = async (file?: File | null) => {
    if (!file) return;
    const form = box.current?.closest('form');
    if (!form) return;
    const current = ['title', 'body'].map((n) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value.trim()).some(Boolean);
    if (current && !window.confirm(`Replace what's in the form with “${file.name}”?`)) return;

    setStatus({ kind: 'reading', message: `Reading ${file.name}…` });
    try {
      const post = await parsePostFile(file);
      const filled = fill(form, post);
      setStatus({ kind: 'done', message: `Filled from ${file.name}. Review the fields, then save.`, filled });
    } catch (err) {
      setStatus({ kind: 'error', message: (err as Error).message || 'Couldn’t read that file.' });
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(TEMPLATE, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'blog-post-template.json' });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div ref={box} className="adm-wide adm-import">
      <motion.div
        role="button" tabIndex={0}
        className={`adm-import__drop${over ? ' is-over' : ''}${status.kind === 'reading' ? ' is-busy' : ''}`}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.current?.click(); } }}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files?.[0]); }}
        animate={{ scale: over ? 1.015 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        <motion.span className="adm-import__icon" aria-hidden="true" animate={{ y: over ? -4 : 0, rotate: over ? -8 : 0 }}>🧾</motion.span>
        <span className="adm-import__text">
          <strong>{over ? 'Drop to fill the form' : 'Import from JSON'}</strong>
          <span className="adm-muted adm-small">Drag a <b>.json</b> file here, or click to choose one. Nothing is saved until you press save.</span>
        </span>
        <input ref={input} type="file" accept={ACCEPTED} hidden onChange={(e) => handle(e.target.files?.[0])} />
      </motion.div>

      <div className="adm-import__foot">
        <AnimatePresence initial={false}>
          {status.kind !== 'idle' && (
            <motion.p
              key="status"
              className={`adm-import__status is-${status.kind}`} role={status.kind === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              {status.kind === 'done' && '✓ '}{status.message}
              {status.filled?.length ? <span className="adm-import__chips">{status.filled.map((f) => <em key={f}>{f}</em>)}</span> : null}
            </motion.p>
          )}
        </AnimatePresence>
        <button type="button" className="adm-import__tpl" onClick={downloadTemplate}>Download JSON template</button>
      </div>
    </div>
  );
}
