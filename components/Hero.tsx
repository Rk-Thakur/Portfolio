'use client';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Particles from './Particles';
import Typer from './Typer';
import CountUp from './CountUp';
import Marquee from './Marquee';
import Magnetic from './Magnetic';
import { Reveal } from './Reveal';
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons';
import { usePortfolio } from './PortfolioProvider';
import Rich from './Rich';
import { ease, intro, LOADER_MS } from '@/lib/motion';

export default function Hero() {
  const { profile, stats, marquee } = usePortfolio();
  const lines = [
    { text: profile.heroHeadline, grad: false },
    { text: profile.heroTagline, grad: true },
  ];
  const base = useRef(intro.played ? 0.05 : LOADER_MS / 1000 + 0.15).current;
  useEffect(() => { intro.played = true; }, []);

  // Scroll-linked parallax: copy drifts up and fades, phone sinks and turns
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const phoneScale = useTransform(scrollYProgress, [0, 1], [1, 0.88]);

  // Phone tilts toward the cursor
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-16, 16]), { stiffness: 150, damping: 15 });
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 15 });

  const intro_ = (i: number) => ({
    initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.9, ease, delay: base + i * 0.09 },
  });

  let w = 0;
  return (
    <section className="hero" ref={ref}>
      <div className="aurora" aria-hidden="true"><span /><span /><span /></div>
      <Particles />
      <div className="container hero__grid">
        <motion.div className="hero__copy" style={{ y: copyY, opacity: copyOpacity }}>
          <motion.p className="eyebrow" {...intro_(0)}><span className="dot" /> {profile.availability}</motion.p>
          <motion.p className="hero__hello" {...intro_(1)}>Hi, I&apos;m <strong>{profile.name}</strong> 👋</motion.p>
          <h1 className="hl" aria-label={lines.map((l) => l.text).join(' ')}>
            {lines.map((line) => (
              <span className={`hl-line${line.grad ? ' hl-grad' : ''}`} key={line.text} aria-hidden="true">
                {line.text.split(' ').map((word, i, arr) => {
                  const idx = w++;
                  return (
                    <span className="w" key={i}>
                      <motion.span
                        initial={{ y: '110%', rotate: 6 }}
                        animate={{ y: '0%', rotate: 0 }}
                        transition={{ duration: 0.9, ease: [0.2, 0.9, 0.25, 1], delay: base + 0.1 + idx * 0.07 }}
                      >
                        {word}
                      </motion.span>
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <motion.p className="typer" {...intro_(6)}>
            <span className="typer__prompt">~/ranjan $</span> <Typer words={profile.roles} startDelay={(base + 2.4) * 1000} />
            <span className="caret" aria-hidden="true" />
          </motion.p>
          <motion.p className="lead" {...intro_(7)}>
            <Rich text={profile.heroIntro} />
          </motion.p>
          <motion.div className="hero__ctas" {...intro_(8)}>
            <Magnetic href="#projects" className="btn btn--primary"><span>View my work</span></Magnetic>
            <Magnetic href="#contact" className="btn btn--ghost"><span>Get in touch</span></Magnetic>
          </motion.div>
          <motion.ul className="socials" aria-label="Profiles" {...intro_(9)}>
            <li><Magnetic strength={0.4} href={profile.github} target="_blank" rel="noopener" aria-label="GitHub"><GitHubIcon /></Magnetic></li>
            <li><Magnetic strength={0.4} href={profile.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn"><LinkedInIcon /></Magnetic></li>
            <li><Magnetic strength={0.4} href={`mailto:${profile.email}`} aria-label="Email"><MailIcon /></Magnetic></li>
          </motion.ul>
        </motion.div>

        <motion.div
          className="hero__visual"
          aria-hidden="true"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, ease, delay: base + 0.3 }}
          style={{ y: phoneY, scale: phoneScale }}
          onPointerMove={(e) => {
            if (e.pointerType !== 'mouse') return;
            const r = e.currentTarget.getBoundingClientRect();
            px.set((e.clientX - r.left) / r.width - 0.5);
            py.set((e.clientY - r.top) / r.height - 0.5);
          }}
          onPointerLeave={() => { px.set(0); py.set(0); }}
        >
          <div className="orbit orbit--1"><span>Dart</span></div>
          <div className="orbit orbit--2"><span>Swift</span></div>
          <motion.div className="phone" style={{ rotateX, rotateY, transformPerspective: 1000 }}>
            <div className="phone__push"><span className="push__icon">🚀</span><div><b>Release 2.4.1 is live</b><small>App Store · Google Play</small></div></div>
            <div className="phone__notch" />
            <div className="phone__screen">
              <div className="app-bar"><span>9:41</span><span className="bars"><i /><i /><i /></span></div>
              <div className="app-card app-card--balance">
                <small>Total balance</small>
                <b>$12,480.20</b>
                <div className="spark">
                  {[40, 65, 50, 80, 60, 92, 74].map((h, i) => <span key={i} style={{ '--h': `${h}%` } as React.CSSProperties} />)}
                </div>
              </div>
              <div className="app-row"><span className="chip c1" /><div><b>Transfer sent</b><small>Real-time · REST</small></div><em>-$120</em></div>
              <div className="app-row"><span className="chip c2" /><div><b>Sync complete</b><small>SignalR · WebSocket</small></div><em>✓</em></div>
              <div className="app-row"><span className="chip c3" /><div><b>Build 2.4.1</b><small>Fastlane · Play &amp; App Store</small></div><em>live</em></div>
            </div>
          </motion.div>
          <motion.div className="float-card fc-1" style={{ x: useTransform(px, [-0.5, 0.5], [18, -18]) }}><span className="mono">flutter test</span><b>80%+ coverage</b></motion.div>
          <motion.div className="float-card fc-2" style={{ x: useTransform(px, [-0.5, 0.5], [-22, 22]) }}><span className="mono">ci/cd</span><b>−70% release effort</b></motion.div>
        </motion.div>
      </div>

      <div className="container">
        <Reveal as="ul" className="stats">
          {stats.map((s) => (
            <li key={s.label}><CountUp to={s.value} suffix={s.suffix} decimals={s.decimals} /><span>{s.label}</span></li>
          ))}
        </Reveal>
      </div>

      <Marquee items={marquee} />
    </section>
  );
}
