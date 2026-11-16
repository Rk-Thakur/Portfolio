'use client';

/** A delete button that asks before running its server action. */
export default function ConfirmButton({ action, message, children }: { action: () => Promise<void>; message: string; children: React.ReactNode }) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      <button className="adm-btn adm-btn--danger adm-btn--sm">{children}</button>
    </form>
  );
}
