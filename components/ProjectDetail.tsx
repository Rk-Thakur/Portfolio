'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Reveal, TiltCard } from './Reveal';
import Magnetic from './Magnetic';
import type { Project } from '@/lib/data';
import { usePortfolio } from './PortfolioProvider';
import { ease } from '@/lib/motion';

const catLabel = { mobile: 'Mobile app', backend: 'Backend & AI', oss: 'Open source' } as const;

export default function ProjectDetail({ project: p, next, index, total }: { project: Project; next: Project; index: number; total: number }) {
  const { profile } = usePortfolio();
  const words = p.title.split(' ');
  return (
    <main id="main" className="case">
      <div className="aurora aurora--case" aria-hidden="true"><span /><span /><span /></div>
      <div className="container case__inner">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }}>
          <Link href="/#projects" className="case__back">← All projects</Link>
        </motion.div>

        <header className="case__head">
          <motion.div
            className="case__icon"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
          >
            {p.icon}
          </motion.div>
          <motion.p className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} — {p.badge} · {catLabel[p.cat]}
          </motion.p>
          <h1 className="case__title" aria-label={p.title}>
            {words.map((w, i) => (
              <span className="w" key={i} aria-hidden="true">
                <motion.span initial={{ y: '110%', rotate: 6 }} animate={{ y: '0%', rotate: 0 }} transition={{ duration: 0.9, ease: [0.2, 0.9, 0.25, 1], delay: 0.15 + i * 0.07 }}>
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="case__summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease, delay: 0.45 }}>
            {p.summary}
          </motion.p>
          <motion.ul className="tags case__tags" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.6 } } }}>
            {p.tags.map((t) => (
              <motion.li key={t} variants={{ hidden: { opacity: 0, y: 10, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1 } }}>{t}</motion.li>
            ))}
          </motion.ul>
        </header>

        <section className="case__body">
          <Reveal as="div" className="case__label"><p className="kicker">What I built</p></Reveal>
          <ol className="case__list">
            {p.highlights.map((h, i) => (
              <Reveal as="li" key={i} delay={i * 0.08} y={24}>
                <span className="case__num">{String(i + 1).padStart(2, '0')}</span>
                <p>{h}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <TiltCard as="div" className="case__next">
          <Link href={`/projects/${next.slug}/`} className="project__cover" aria-label={`Next project: ${next.title}`} />
          <span className="kicker">Next project</span>
          <div className="case__next-row">
            <h2>{next.title}</h2>
            <span className="case__arrow" aria-hidden="true">→</span>
          </div>
        </TiltCard>

        <Reveal className="case__cta">
          <p>Want the details behind this project?</p>
          <Magnetic className="btn btn--primary" href={`mailto:${profile.email}`}><span>Get in touch</span></Magnetic>
        </Reveal>
      </div>
    </main>
  );
}
