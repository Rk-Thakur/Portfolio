import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectDetail from '@/components/ProjectDetail';
import { getPortfolio } from '@/lib/portfolio';

export const revalidate = 300;
// Projects added in Supabase after a deploy get their page on first visit
export const dynamicParams = true;

export async function generateStaticParams() {
  const { projects } = await getPortfolio();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { projects } = await getPortfolio();
  const p = projects.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { projects } = await getPortfolio();
  const i = projects.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  const next = projects[(i + 1) % projects.length];
  const prev = projects[(i - 1 + projects.length) % projects.length];
  return <ProjectDetail project={projects[i]} prev={prev} next={next} index={i} total={projects.length} />;
}
