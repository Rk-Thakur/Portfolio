import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/supabase/server';
import { SECTIONS, SECTION_KEYS } from '@/lib/admin/config';
import { signOut } from '../actions';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdmin();
  if (!user) redirect('/admin/login/');

  // Signed in, but not listed in public.admins: show how to fix it
  if (!isAdmin) {
    return (
      <main className="adm-login">
        <div className="adm-login__card">
          <span className="adm-logo">RT</span>
          <h1>Not an admin yet</h1>
          <p className="adm-muted">You&apos;re signed in as <strong>{user.email}</strong>, but this account isn&apos;t allowed to edit.</p>
          <p className="adm-muted">In Supabase → SQL Editor, run:</p>
          <pre className="adm-code">insert into public.admins (user_id){'\n'}values (&apos;{user.id}&apos;);</pre>
          <p className="adm-muted">Then reload this page.</p>
          <form action={signOut}><button className="adm-btn">Sign out</button></form>
        </div>
      </main>
    );
  }

  const links = [
    { href: '/admin/', label: 'Dashboard' },
    { href: '/admin/profile/', label: 'Profile & hero' },
    ...SECTION_KEYS.map((k) => ({ href: `/admin/${k}/`, label: SECTIONS[k].label })),
  ];

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin/" className="adm-brand"><span className="adm-logo">RT</span> Admin</Link>
        <AdminNav links={links} />
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noopener" className="adm-btn adm-btn--ghost">View site ↗</a>
          <p className="adm-muted adm-small">{user.email}</p>
          <form action={signOut}><button className="adm-btn adm-btn--ghost">Sign out</button></form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
