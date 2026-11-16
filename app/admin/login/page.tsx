import LoginForm from '@/components/admin/LoginForm';
import SetupNotice from '@/components/admin/SetupNotice';
import { supabaseConfigured } from '@/lib/supabase/server';

export default function LoginPage() {
  if (!supabaseConfigured) return <SetupNotice />;
  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <span className="adm-logo">RT</span>
        <h1>Admin sign in</h1>
        <p className="adm-muted">Edit your portfolio content.</p>
        <LoginForm />
      </div>
    </main>
  );
}
