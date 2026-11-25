'use client';
import { useRef, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import Markdown from '@/components/Markdown';
import { readingMinutes } from '@/lib/blog-shared';

type Props = {
  id: string; name: string; defaultValue: string; invalid?: boolean; describedBy?: string;
};

// [label, before, after, placeholder, line-start?]
const TOOLS: [string, string, string, string, string, boolean?][] = [
  ['B', 'Bold', '**', '**', 'bold text'],
  ['I', 'Italic', '_', '_', 'italic text'],
  ['H2', 'Heading', '## ', '', 'Heading', true],
  ['H3', 'Sub-heading', '### ', '', 'Sub-heading', true],
  ['•', 'Bullet list', '- ', '', 'List item', true],
  ['❝', 'Quote', '> ', '', 'Quote', true],
  ['🔗', 'Link', '[', '](https://)', 'link text'],
  ['`', 'Inline code', '`', '`', 'code'],
  ['{ }', 'Code block', '```dart\n', '\n```', '// code here', true],
];

/** Markdown editor: Write / Preview tabs, a small toolbar and a live word count. */
export default function MarkdownField({ id, name, defaultValue, invalid, describedBy }: Props) {
  const [text, setText] = useState(defaultValue);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const ta = useRef<HTMLTextAreaElement>(null);
  const words = (text.match(/[\p{L}\p{N}'’-]+/gu) ?? []).length;

  const apply = (before: string, after: string, placeholder: string, lineStart?: boolean) => {
    const el = ta.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const selected = value.slice(a, b) || placeholder;
    const needsBreak = lineStart && a > 0 && value[a - 1] !== '\n' ? '\n' : '';
    const insert = `${needsBreak}${before}${selected}${after}`;
    const next = value.slice(0, a) + insert + value.slice(b);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const start = a + needsBreak.length + before.length;
      el.setSelectionRange(start, start + selected.length);
    });
  };

  return (
    <div className="adm-md">
      <div className="adm-md__bar">
        <LayoutGroup id={`md-tabs-${id}`}>
          <div className="adm-md__tabs" role="tablist">
            {(['write', 'preview'] as const).map((t) => (
              <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
                {tab === t && <motion.span className="adm-md__pill" layoutId="md-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span>{t === 'write' ? 'Write' : 'Preview'}</span>
              </button>
            ))}
          </div>
        </LayoutGroup>
        {tab === 'write' && (
          <div className="adm-md__tools" aria-label="Formatting">
            {TOOLS.map(([label, title, before, after, ph, line]) => (
              <button key={title} type="button" title={title} aria-label={title} onClick={() => apply(before, after, ph, line)}>{label}</button>
            ))}
          </div>
        )}
      </div>

      {/* The textarea stays mounted (hidden in preview) so the form always submits the text */}
      <textarea
        ref={ta} id={id} name={name} value={text} onChange={(e) => setText(e.target.value)}
        aria-invalid={invalid} aria-describedby={describedBy}
        className="adm-md__input" rows={22} spellCheck hidden={tab !== 'write'}
        placeholder={'## Why I wrote this\n\nStart writing in Markdown…\n\n```dart\nvoid main() => print(\'hello\');\n```'}
      />
      {tab === 'preview' && (
        <div className="adm-md__preview">
          {text.trim() ? <Markdown source={text} /> : <p className="adm-muted">Nothing to preview yet.</p>}
        </div>
      )}

      <p className="adm-help adm-md__meta">
        {words.toLocaleString()} words · ~{readingMinutes(text)} min read · Markdown: **bold**, _italic_, ## headings, - lists, [links](https://…), ```code```
      </p>
    </div>
  );
}
