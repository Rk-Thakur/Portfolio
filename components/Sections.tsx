'use client';
import Link from 'next/link';
import { AnimatePresence, LayoutGroup, motion, useScroll, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import SectionHead from './SectionHead';
import Magnetic from './Magnetic';
import { Reveal, TiltCard } from './Reveal';
import SkillCard from './SkillCard';
import type { ProjectCat } from '@/lib/data';
import { usePortfolio } from './PortfolioProvider';
import Rich from './Rich';

export function About() {
  const { profile, strengths } = usePortfolio();
  return (
    <section className="section" id="about">
      <div className="container about">
        <SectionHead kicker="01 — About" title={profile.aboutHeading} />
        <Reveal className="about__body">
          <p><Rich text={profile.aboutIntro} /></p>
          <p className="about__sub">What I bring</p>
          <ul className="strengths">
            {strengths.map((s, i) => (
              <li key={s.area} style={{ '--i': i } as React.CSSProperties}>
                <span className="strengths__area">{s.area}</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
          <div className="about__tags">
            {profile.aboutTags.map((t, i) => (
              <span key={t} style={{ '--i': i } as React.CSSProperties}>{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Skills() {
  const { skills } = usePortfolio();
  return (
    <section className="section section--alt" id="skills">
      <div className="container">
        <SectionHead kicker="02 — Skills" title="Tools I work with every day" />
        <div className="skills">
          {skills.map((g, gi) => (
            <SkillCard key={g.title} group={g} delay={(gi % 3) * 0.08} />
          ))}
        </div>
        <Reveal as="p" className="langs">
          <span className="mono">total:</span> {skills.reduce((n, g) => n + g.items.length, 0)} skills across {skills.length} areas · always learning
        </Reveal>
      </div>
    </section>
  );
}

export function Experience() {
  const { experience, projects } = usePortfolio();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start 75%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return (
    <section className="section" id="experience">
      <div className="container">
        <SectionHead kicker="03 — Experience" title="Where I've shipped" />
        <div className="timeline-wrap" ref={wrapRef}>
          <motion.span className="timeline__line" style={{ scaleY }} aria-hidden="true" />
          <ol className="timeline">
            {experience.map((job) => (
              <Reveal as="li" className={`job${job.independent ? ' job--independent' : ''}`} key={job.company}>
                <div className="job__meta">
                  <span className="job__date">{job.date}</span>
                  <span className="job__loc">{job.location}</span>
                </div>
                <div className="job__card spot">
                  {job.independent && <span className="job__badge">Independent · Self-directed</span>}
                  <h3>{job.role} <span className="at">{job.independent ? '— ' : '@ '}{job.company}</span></h3>
                  <p className="job__sub">{job.sub}</p>
                  <ul>
                    {job.points.map((p, i) => <li key={i} style={{ '--i': i } as React.CSSProperties}><Rich text={p} /></li>)}
                  </ul>
                  <ul className="tags">{job.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                  {job.projects && (
                    <div className="job__projects">
                      <span className="job__projects-label">Case studies</span>
                      {job.projects.map((slug) => {
                        const p = projects.find((x) => x.slug === slug);
                        return p ? (
                          <Link key={slug} href={`/projects/${slug}/`} className="job__project">
                            <span aria-hidden="true">{p.icon}</span>{p.title.split(' — ')[0]}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const filters: { id: 'all' | ProjectCat; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'backend', label: 'Backend & AI' },
  { id: 'oss', label: 'Open Source' },
];

export function Projects() {
  const { projects, profile } = usePortfolio();
  const [filter, setFilter] = useState<'all' | ProjectCat>('all');
  const shown = projects.filter((p) => filter === 'all' || p.cat === filter);
  return (
    <section className="section section--alt" id="projects">
      <div className="container">
        <SectionHead kicker="04 — Projects" title="Selected work" />
        <Reveal className="filters" role="tablist" aria-label="Filter projects">
          {filters.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} className={`filter${filter === f.id ? ' is-active' : ''}`} onClick={() => setFilter(f.id)}>
              {filter === f.id && <motion.span className="filter__pill" layoutId="filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              <span className="filter__label">{f.label}</span>
            </button>
          ))}
        </Reveal>
        <LayoutGroup>
          <motion.div className="projects" layout>
            <AnimatePresence mode="popLayout">
              {shown.map((p, i) => (
                <TiltCard
                  key={p.slug}
                  className="project"
                  layout
                  delay={(i % 3) * 0.06}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(6px)', transition: { duration: 0.25 } }}
                >
                  <div className="project__top"><span className="project__badge">{p.badge}</span><span className="project__icon">{p.icon}</span></div>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  <ul className="tags">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                  <Link href={`/projects/${p.slug}/`} className="project__cover" aria-label={`Read more about ${p.title}`} />
                  <span className="project__more">Case study <span aria-hidden="true">→</span></span>
                </TiltCard>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        <Reveal as="p" className="more"><a href={profile.github} target="_blank" rel="noopener" className="link-arrow">See more on GitHub</a></Reveal>
      </div>
    </section>
  );
}

export function Education() {
  const { education } = usePortfolio();
  return (
    <section className="section" id="education">
      <div className="container">
        <SectionHead kicker="05 — Education" title="Education" />
        <div className="edu">
          {education.map((e, i) => (
            <TiltCard key={e.school} className="edu__card" delay={i * 0.08}>
              <span className="edu__date">{e.date}</span>
              <h3>{e.degree}</h3>
              <p className="edu__school">{e.school}</p>
              <p className="edu__loc">{e.loc}</p>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ n = '06' }: { n?: string }) {
  const { profile } = usePortfolio();
  const [toast, setToast] = useState<string | null>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setToast('Email copied'); }
    catch { setToast(profile.email); }
    setTimeout(() => setToast(null), 1800);
  };
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <Reveal className="contact__card">
          <SectionHead kicker={`${n} — Contact`} title="Let's build something great together." className="contact__head" />
          <p>I&apos;m open to full-time Software Engineer and Mobile Application Engineer roles. The fastest way to reach me is email.</p>
          <div className="contact__actions">
            <Magnetic className="btn btn--primary" href={`mailto:${profile.email}`}><span>{profile.email}</span></Magnetic>
            <motion.button className="btn btn--ghost" onClick={copy} whileTap={{ scale: 0.94 }}><span>Copy email</span></motion.button>
          </div>
          <ul className="contact__list">
            <li><span>Phone</span><a href={profile.phoneHref}>{profile.phone}</a></li>
            <li><span>Location</span>{profile.location}</li>
            <li><span>LinkedIn</span><a href={profile.linkedin} target="_blank" rel="noopener">{profile.linkedinHandle}</a></li>
            <li><span>GitHub</span><a href={profile.github} target="_blank" rel="noopener">{profile.githubHandle}</a></li>
          </ul>
        </Reveal>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div className="toast is-on" role="status" initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
