'use client';
import Link from 'next/link';
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { useEffect, useRef, useState, useTransition } from 'react';
import { deleteRecord, reorderRecords, togglePublished } from '@/app/admin/actions';
import ConfirmButton from './ConfirmButton';

export type SortableItem = {
  id: string; title: string; subtitle: string; cover: string; published: boolean; publicHref: string | null;
};

type Status = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

/**
 * Drag-and-drop list (Framer Motion Reorder). Drag by the ⠿ handle, or focus the
 * handle and use ↑ / ↓ on the keyboard. The new order is saved when you let go,
 * and the public site shows the same order.
 */
export default function SortableList({ sectionKey, items: initial }: { sectionKey: string; items: SortableItem[] }) {
  const [items, setItems] = useState(initial);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [, startTransition] = useTransition();
  const saved = useRef(initial.map((i) => i.id).join(','));
  const savedItems = useRef(initial);
  const latest = useRef(items);
  latest.current = items;

  // Server data changed (e.g. after publish/delete): take it as the new baseline
  useEffect(() => { setItems(initial); savedItems.current = initial; saved.current = initial.map((i) => i.id).join(','); }, [initial]);

  const save = () => {
    const order = latest.current;
    const ids = order.map((i) => i.id);
    if (ids.join(',') === saved.current) return;
    setStatus({ kind: 'saving' });
    startTransition(async () => {
      const res = await reorderRecords(sectionKey, ids);
      if (res.ok) {
        saved.current = ids.join(',');
        savedItems.current = order;
        setStatus({ kind: 'saved' });
        setTimeout(() => setStatus((s) => (s.kind === 'saved' ? { kind: 'idle' } : s)), 2200);
      } else {
        setItems(savedItems.current); // put the list back the way it is saved
        setStatus({ kind: 'error', message: res.message });
      }
    });
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    latest.current = next;
    setItems(next);
    save();
  };

  return (
    <>
      <div className="adm-sort__status" aria-live="polite">
        <AnimatePresence mode="wait">
          {status.kind !== 'idle' && (
            <motion.span
              key={status.kind}
              className={`adm-sort__badge is-${status.kind}`}
              initial={{ opacity: 0, y: -6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              {status.kind === 'saving' && 'Saving order…'}
              {status.kind === 'saved' && '✓ Order saved · the site is updated'}
              {status.kind === 'error' && (status.message ?? 'Couldn’t save the order.')}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="adm-list adm-sort" as="ol">
        {items.map((item, i) => (
          <Row key={item.id} item={item} index={i} total={items.length} sectionKey={sectionKey} onDrop={save} onMove={move} />
        ))}
      </Reorder.Group>
    </>
  );
}

function Row({ item, index, total, sectionKey, onDrop, onMove }: {
  item: SortableItem; index: number; total: number; sectionKey: string;
  onDrop: () => void; onMove: (index: number, dir: -1 | 1) => void;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  return (
    <Reorder.Item
      value={item} as="li" dragListener={false} dragControls={controls}
      className={`adm-row adm-sort__row${item.published ? '' : ' is-draft'}${dragging ? ' is-dragging' : ''}`}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => { setDragging(false); onDrop(); }}
      // Driven by state (not whileDrag) so the lift always settles back after a drop
      animate={dragging
        ? { scale: 1.02, boxShadow: '0 18px 40px -12px rgba(0,0,0,.45)', zIndex: 5 }
        : { scale: 1, boxShadow: '0 0 0 0 rgba(0,0,0,0)', zIndex: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
    >
      <div className="adm-sort__lead">
        <button
          type="button" className="adm-sort__handle"
          aria-label={`Reorder “${item.title}”. Drag, or press up / down arrow keys. Position ${index + 1} of ${total}.`}
          onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); onMove(index, -1); }
            if (e.key === 'ArrowDown') { e.preventDefault(); onMove(index, 1); }
          }}
        >
          <svg viewBox="0 0 12 20" aria-hidden="true"><g fill="currentColor">{[3, 9].flatMap((x) => [4, 10, 16].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" />))}</g></svg>
        </button>
        <span className="adm-sort__num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className="adm-row__cover" aria-hidden="true">{item.cover}</span>
      </div>

      <Link href={`/admin/${sectionKey}/${item.id}/`} className="adm-row__main" draggable={false}>
        <strong>{item.title}</strong>
        {item.subtitle && <span className="adm-muted adm-small">{item.subtitle}</span>}
      </Link>

      <div className="adm-row__actions">
        <form action={togglePublished.bind(null, sectionKey, item.id, !item.published)}>
          <button className={`adm-pill${item.published ? ' is-on' : ''}`} title="Show or hide on the site">
            {item.published ? 'Published' : 'Draft'}
          </button>
        </form>
        {item.publicHref && (
          <a href={item.publicHref} target="_blank" rel="noopener" className="adm-btn adm-btn--ghost adm-btn--sm">View ↗</a>
        )}
        <Link href={`/admin/${sectionKey}/${item.id}/`} className="adm-btn adm-btn--ghost adm-btn--sm">Edit</Link>
        <ConfirmButton action={deleteRecord.bind(null, sectionKey, item.id)} message={`Delete “${item.title}”? This can’t be undone.`}>Delete</ConfirmButton>
      </div>
    </Reorder.Item>
  );
}
