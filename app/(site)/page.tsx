import Hero from '@/components/Hero';
import LatestWriting from '@/components/LatestWriting';
import { About, Contact, Education, Experience, Projects, Skills } from '@/components/Sections';
import { getPosts } from '@/lib/blog';

export default async function Home() {
  const posts = await getPosts();
  return (
    <main id="main">
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      {posts.length > 0 && <LatestWriting posts={posts.slice(0, 3)} n="06" />}
      <Contact n={posts.length > 0 ? '07' : '06'} />
    </main>
  );
}
