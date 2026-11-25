'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/** A code block with its language label and a copy button. */
export default function CodeBlock({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  // <pre><code class="language-dart hljs">…</code></pre>
  const lang = (() => {
    const child = children as { props?: { className?: string } } | undefined;
    const m = /language-([\w+-]+)/.exec(child?.props?.className ?? '');
    return m?.[1] ?? '';
  })();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText ?? '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="md-code">
      <div className="md-code__bar">
        <span className="md-code__lang">{lang || 'code'}</span>
        <button type="button" className="md-code__copy" onClick={copy} aria-label="Copy code">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={copied ? 'y' : 'n'} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.15 }}>
              {copied ? 'Copied ✓' : 'Copy'}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}
