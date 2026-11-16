/** Shown on /admin when the Supabase keys are missing from the environment. */
export default function SetupNotice() {
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <span className="adm-logo">RT</span>
        <h1>Admin isn&apos;t connected yet</h1>
        <p className="adm-muted">The Supabase keys are missing on this deployment, so sign-in can&apos;t work.</p>
        <p className="adm-muted">In <strong>Vercel → Project → Settings → Environment Variables</strong>, add (for Production, Preview and Development):</p>
        <pre className="adm-code">NEXT_PUBLIC_SUPABASE_URL{'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY</pre>
        <p className="adm-muted">Use the same values as your <code>.env.local</code>, then <strong>Redeploy</strong>. These values are built into the site, so a redeploy is required after adding them.</p>
      </div>
    </main>
  );
}
