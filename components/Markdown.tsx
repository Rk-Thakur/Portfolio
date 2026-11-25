import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { common } from 'lowlight';
import dart from 'highlight.js/lib/languages/dart';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import CodeBlock from './CodeBlock';

// Common languages + the ones a mobile/backend blog needs.
const languages = { ...common, dart, dockerfile };

// Raw HTML in posts is ignored (react-markdown's default), and unsafe link
// protocols like javascript: are stripped, so a post can never inject scripts.
const components: Components = {
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  a: ({ href = '', children }) => {
    const external = /^https?:\/\//.test(href);
    return external
      ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <a href={href}>{children}</a>;
  },
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt }) => <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} loading="lazy" decoding="async" />,
  table: ({ children }) => <div className="md-table"><table>{children}</table></div>,
};

/** Renders a blog post's Markdown (GitHub-flavoured: tables, task lists, strikethrough). */
export default function Markdown({ source }: { source: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false, languages, aliases: { dart: ['flutter'] } }]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
