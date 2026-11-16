'use client';
import Link from 'next/link';
import {
  animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type Variants,
} from 'framer-motion';
import { useEffect, useState } from 'react';
import type { SectionKey } from '@/lib/admin/config';

export type SectionStat = { key: SectionKey; label: string; count: number; unit: string };
export type RecentEdit = { section: SectionKey | 'profile'; sectionLabel: string; title: string; href: string; updatedAt: string };

const ease = [0.2, 0.8, 0.2, 1] as const;
const spring = { type: 'spring', stiffness: 380, damping: 26 } as const;

const MotionLink = motion.create(Link);

const ICONS: Record<SectionKey | 'profile', React.ReactNode> = {
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  projects: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  experience: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
  skills: <><path d="m8 7-5 5 5 5M16 7l5 5-5 5" /></>,
  education: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" /></>,
  stats: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  strengths: <><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" /></>,
};
const Icon = ({ name }: { name: keyof typeof ICONS }) => <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>;

// ---- Orchestrated entrance: parent staggers its children ------------------
const page: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease } },
};
const grid: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const pop: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};
const list: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const slide: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
};

/** Number that counts up once it mounts. */
function Count({ to, delay = 0 }: { to: number; delay?: number }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) { setV(to); return; }
    const c = animate(0, to, { duration: 1.2, delay, ease, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [to, delay, reduce]);
  return <>{v}</>;
}

/** Headline that rises in word by word. */
function Words({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="dash-w" aria-hidden="true">
          <motion.span
            initial={{ y: '110%' }} animate={{ y: '0%' }}
            transition={{ duration: 0.7, ease: [0.2, 0.9, 0.25, 1], delay: delay + i * 0.07 }}
          >{w}</motion.span>
        </span>
      ))}
    </span>
  );
}

/** Card that tilts toward the cursor with a soft spotlight (springs, not CSS). */
function TiltCard({ href, children }: { href: string; children: React.ReactNode }) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 220, damping: 18 });
  const glowX = useTransform(mx, (v) => `${v * 100}%`);
  const glowY = useTransform(my, (v) => `${v * 100}%`);
  const background = useMotionTemplate`radial-gradient(260px circle at ${glowX} ${glowY}, color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%)`;

  return (
    <motion.div variants={pop} style={{ perspective: 800 }}>
      <MotionLink
        href={href}
        className="dash-card"
        style={{ rotateX, rotateY }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => { mx.set(0.5); my.set(0.5); }}
      >
        <motion.span className="dash-card__glow" style={{ background }} aria-hidden="true" />
        {children}
      </MotionLink>
    </motion.div>
  );
}

/** Ring that draws itself to show how many projects are published. */
function PublishRing({ published, total }: { published: number; total: number }) {
  const pct = total ? published / total : 0;
  return (
    <motion.div className="dash-ring" variants={rise} whileHover={{ scale: 1.03 }} transition={spring}>
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="18" className="dash-ring__track" />
        <motion.circle
          cx="22" cy="22" r="18" className="dash-ring__bar"
          initial={{ pathLength: 0 }} animate={{ pathLength: pct }}
          transition={{ duration: 1.4, ease, delay: 0.4 }}
        />
      </svg>
      <div>
        <strong><Count to={published} delay={0.4} /> / {total}</strong>
        <span className="adm-muted adm-small">projects published</span>
      </div>
    </motion.div>
  );
}

function timeAgo(iso: string, now: number) {
  const s = Math.max(0, (now - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = s / 60; if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60; if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24; if (d < 30) return `${Math.floor(d)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Dashboard({ name, stats, drafts, totalSkills, recent }: {
  name: string; stats: SectionStat[]; drafts: number; totalSkills: number; recent: RecentEdit[];
}) {
  // Time-based text is set after mount so server and browser agree
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const hour = now ? new Date(now).getHours() : 12;
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = now ? new Date(now).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : '';

  const total = stats.reduce((n, s) => n + s.count, 0);
  const projects = stats.find((s) => s.key === 'projects')?.count ?? 0;

  return (
    <motion.div className="dash" variants={page} initial="hidden" animate="show">
      {/* Drifting accent glow behind the header */}
      <motion.div
        className="dash-aurora" aria-hidden="true"
        animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Greeting + status */}
      <header className="dash-hero">
        <div>
          <motion.p className="dash-kicker" variants={rise}>{today || 'Overview'}</motion.p>
          <h1>
            {now ? <Words text={`${greeting}, ${name}`} delay={0.1} /> : <span className="dash-w-hold">{`${greeting}, ${name}`}</span>}
            <motion.span
              className="dash-wave" aria-hidden="true"
              initial={{ rotate: 0, scale: 0 }} animate={{ rotate: [0, 18, -8, 14, -4, 0], scale: 1 }}
              transition={{ scale: { ...spring, delay: 0.5 }, rotate: { duration: 1.6, delay: 0.7 } }}
            >👋</motion.span>
          </h1>
          <motion.p className="adm-muted" variants={rise}>Everything you save here goes live on your portfolio instantly.</motion.p>
        </div>
        <div className="dash-hero__side">
          <PublishRing published={projects - drafts} total={projects} />
          <motion.span className="dash-live" variants={rise}>
            <span className="dash-live__dot" aria-hidden="true">
              <motion.i animate={{ scale: [1, 2.4], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
            </span>
            Live · connected to Supabase
          </motion.span>
        </div>
      </header>

      {/* Quick actions */}
      <motion.div className="dash-quick" variants={grid}>
        {[
          { href: '/admin/projects/new/', label: 'New project', icon: <span className="dash-plus">+</span>, primary: true },
          { href: '/admin/profile/', label: 'Edit hero text', icon: <Icon name="profile" /> },
          { href: '/admin/experience/new/', label: 'Add experience', icon: <Icon name="experience" /> },
        ].map((a) => (
          <motion.div key={a.href} variants={pop}>
            <MotionLink
              href={a.href} className={`dash-action${a.primary ? ' dash-action--primary' : ''}`}
              whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} transition={spring}
            >
              {a.icon} {a.label}
            </MotionLink>
          </motion.div>
        ))}
        <motion.div variants={pop}>
          <motion.a href="/" target="_blank" rel="noopener" className="dash-action" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }} transition={spring}>
            View site <motion.span className="dash-ext" whileHover={{ x: 2, y: -2 }}>↗</motion.span>
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Content overview */}
      <section className="dash-block" aria-labelledby="dash-content">
        <motion.div className="dash-block__head" variants={rise}>
          <h2 id="dash-content">Content</h2>
          <span className="adm-muted adm-small">{total} items · {totalSkills} skills</span>
        </motion.div>
        <motion.div className="dash-grid" variants={grid}>
          {stats.map((s, i) => (
            <TiltCard key={s.key} href={`/admin/${s.key}/`}>
              <motion.span className="dash-card__icon" whileHover={{ rotate: -10, scale: 1.1 }} transition={spring}>
                <Icon name={s.key} />
              </motion.span>
              <span className="dash-card__label">{s.label}</span>
              <strong className="dash-card__num"><Count to={s.count} delay={0.3 + i * 0.06} /></strong>
              <span className="dash-card__unit">
                {s.key === 'skills' ? `${totalSkills} skills in ${s.count} groups` : s.unit}
                {s.key === 'projects' && drafts > 0 && (
                  <motion.em className="dash-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...spring, delay: 0.9 }}>
                    {drafts} draft{drafts > 1 ? 's' : ''}
                  </motion.em>
                )}
              </span>
              <span className="dash-card__arrow" aria-hidden="true">→</span>
            </TiltCard>
          ))}
        </motion.div>
      </section>

      {/* Recent activity */}
      <section className="dash-block" aria-labelledby="dash-recent">
        <motion.div className="dash-block__head" variants={rise}>
          <h2 id="dash-recent">Recently edited</h2>
        </motion.div>
        {recent.length ? (
          <motion.ol className="dash-recent" variants={list}>
            {recent.map((r) => (
              <motion.li key={r.href + r.updatedAt} variants={slide}>
                <MotionLink href={r.href} whileHover="hover" initial="rest" animate="rest">
                  <motion.span className="dash-recent__icon" variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: -8, scale: 1.08 } }} transition={spring}>
                    <Icon name={r.section} />
                  </motion.span>
                  <motion.span className="dash-recent__text" variants={{ rest: { x: 0 }, hover: { x: 4 } }} transition={spring}>
                    <strong>{r.title}</strong>
                    <span className="adm-muted adm-small">{r.sectionLabel}</span>
                  </motion.span>
                  <time dateTime={r.updatedAt} className="adm-muted adm-small">{now ? timeAgo(r.updatedAt, now) : ''}</time>
                  <motion.span className="dash-recent__go" aria-hidden="true" variants={{ rest: { opacity: 0, x: -6 }, hover: { opacity: 1, x: 0 } }} transition={spring}>→</motion.span>
                </MotionLink>
              </motion.li>
            ))}
          </motion.ol>
        ) : (
          <motion.p className="adm-muted" variants={rise}>No edits yet.</motion.p>
        )}
      </section>
    </motion.div>
  );
}
