import LoginForm from '@/components/admin/LoginForm';

export default function LoginPage() {
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
