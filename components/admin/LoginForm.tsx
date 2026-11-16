'use client';
import { startTransition, useActionState } from 'react';
import { signIn } from '@/app/admin/actions';
import type { FormState } from '@/lib/admin/config';

export default function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(signIn, { ok: false });
  return (
    <form
      className="adm-form adm-form--stack"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <label className="adm-field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="email" required autoFocus />
      </label>
      <label className="adm-field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.message && <p className="adm-alert adm-alert--error" role="alert">{state.message}</p>}
      <button className="adm-btn adm-btn--primary" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
