import Hero from '@/components/Hero';
import { About, Contact, Education, Experience, Projects, Skills } from '@/components/Sections';

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      <Contact />
    </main>
  );
}
