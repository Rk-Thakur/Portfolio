import { createUserClient, supabaseConfigured } from '@/lib/supabase/server';
import { PROFILE_FIELDS } from '@/lib/admin/config';
import RecordForm from '@/components/admin/RecordForm';
import { saveProfile } from '../../actions';

export default async function ProfilePage() {
  if (!supabaseConfigured) return null; // layout shows the setup notice
  const supabase = await createUserClient();
  const { data } = await supabase.from('profile').select('*').eq('id', 1).single();
  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Profile & hero</h1>
          <p className="adm-muted">Headline, intro, About section and contact details.</p>
        </div>
      </header>
      {data ? (
        <RecordForm fields={PROFILE_FIELDS} values={data} action={saveProfile} submitLabel="Save profile" />
      ) : (
        <p className="adm-alert adm-alert--error">No profile row found. Run supabase/seed.sql first.</p>
      )}
    </>
  );
}
