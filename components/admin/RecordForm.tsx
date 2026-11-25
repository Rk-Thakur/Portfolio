'use client';
import Link from 'next/link';
import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import type { Field, FormState } from '@/lib/admin/config';
import MarkdownField from './MarkdownField';
import Flash from './Flash';
import ImportPost from './ImportPost';

type Props = {
  fields: Field[];
  values: Record<string, unknown>;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  projectOptions?: { value: string; label: string }[];
  cancelHref?: string;
};

const asLines = (v: unknown) => (Array.isArray(v) ? v.join('\n') : String(v ?? ''));

/** Renders a form from field config; errors come back from the server action. */
export default function RecordForm({ fields, values, action, submitLabel, projectOptions, cancelHref }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, { ok: false });
  const top = useRef<HTMLDivElement>(null);
  const errors = state.errors ?? {};
  // New key per result, so saving twice shows the message again
  const [nonce, setNonce] = useState(0);
  useEffect(() => { setNonce((n) => n + 1); }, [state]);

  useEffect(() => {
    if (state.message) top.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [state]);

  const render = (f: Field) => {
    const id = `f-${f.key}`;
    const err = errors[f.key];
    const v = values[f.key];
    const common = { id, name: f.key, 'aria-invalid': !!err, 'aria-describedby': err ? `${id}-err` : f.help ? `${id}-help` : undefined };

    let control: React.ReactNode;
    switch (f.type) {
      case 'markdown':
        control = <MarkdownField id={id} name={f.key} defaultValue={String(v ?? '')} invalid={!!err} describedBy={common['aria-describedby']} />;
        break;
      case 'textarea':
        control = <textarea {...common} rows={4} defaultValue={String(v ?? '')} required={f.required} />;
        break;
      case 'lines':
      case 'skills': {
        const text = asLines(v);
        control = <textarea {...common} rows={Math.min(14, Math.max(4, text.split('\n').length + 1))} defaultValue={text} />;
        break;
      }
      case 'number':
        control = <input {...common} type="number" step={f.step ?? 'any'} defaultValue={v === null || v === undefined ? '' : String(v)} required={f.required} />;
        break;
      case 'url':
        control = <input {...common} type="url" inputMode="url" defaultValue={String(v ?? '')} placeholder={f.placeholder} spellCheck={false} />;
        break;
      case 'date':
        control = <input {...common} type="date" defaultValue={v ? String(v).slice(0, 10) : ''} required={f.required} />;
        break;
      case 'bool':
        return (
          <label key={f.key} className={`adm-check${f.wide ? ' adm-wide' : ''}`}>
            <input type="checkbox" name={f.key} defaultChecked={!!v} /> <span>{f.label}</span>
          </label>
        );
      case 'select':
        control = (
          <select {...common} defaultValue={String(v ?? f.options?.[0]?.value ?? '')} required={f.required}>
            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
        break;
      case 'projects': {
        const selected = new Set((v as string[] | undefined) ?? []);
        control = (
          <div className="adm-checks">
            {(projectOptions ?? []).map((o) => (
              <label key={o.value} className="adm-check">
                <input type="checkbox" name="projects" value={o.value} defaultChecked={selected.has(o.value)} /> <span>{o.label}</span>
              </label>
            ))}
            {!projectOptions?.length && <span className="adm-muted adm-small">No projects yet.</span>}
          </div>
        );
        break;
      }
      default:
        control = <input {...common} type="text" defaultValue={String(v ?? '')} placeholder={f.placeholder} required={f.required} spellCheck={f.type !== 'slug'} />;
    }

    return (
      <div key={f.key} className={`adm-field${f.wide ? ' adm-wide' : ''}${err ? ' has-error' : ''}`}>
        <label htmlFor={f.type === 'projects' ? undefined : id}>
          {f.label}{f.required && <span className="adm-req" aria-hidden="true"> *</span>}
        </label>
        {control}
        {err ? <p id={`${id}-err`} className="adm-error">{err}</p> : f.help ? <p id={`${id}-help`} className="adm-help">{f.help}</p> : null}
      </div>
    );
  };

  return (
    <form
      className="adm-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
    >
      <div ref={top} className="adm-wide">
        {state.message && (state.ok
          ? <Flash key={nonce} message={state.message} />
          : <p className="adm-alert adm-alert--error" role="alert">{state.message}</p>)}
      </div>
      {fields.some((f) => f.type === 'markdown') && <ImportPost />}
      {fields.map(render)}
      <div className="adm-actions adm-wide">
        <button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? 'Saving…' : submitLabel}</button>
        {cancelHref && <Link href={cancelHref} className="adm-btn adm-btn--ghost">Cancel</Link>}
      </div>
    </form>
  );
}
