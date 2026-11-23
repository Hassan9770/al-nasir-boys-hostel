import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { errMsg } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Field, PageHeader, usePageMeta } from '../../components/ui.jsx';
import CategoryFields from '../../components/CategoryFields.jsx';
import { date } from '../../utils/format.js';
export default function Profile() {
  usePageMeta('My Profile'); const { user, setUser } = useAuth(); const [busy, setBusy] = useState(false); const [pw, setPw] = useState(false);
  const f = useForm({ defaultValues: user }); const g = useForm();
  const save = async (v) => { setBusy(true); try { const { name, phone, institution, course, company, designation, employer, purposeOfStay, emergencyName, emergencyPhone } = v; const r = await api.patch('/auth/profile', { name, phone, institution, course, company, designation, employer, purposeOfStay, emergencyName, emergencyPhone }); setUser(r.data.user); toast.success('Profile updated'); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  const change = async (v) => { setPw(true); try { await api.post('/auth/change-password', { currentPassword: v.currentPassword, newPassword: v.newPassword }); toast.success('Password changed'); g.reset(); } catch (e) { toast.error(errMsg(e)); } finally { setPw(false); } };
  return (
    <>
      <PageHeader title="My profile" sub={`${user.email} · ${user.residentCategory} · Member since ${date(user.createdAt)}`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={f.handleSubmit(save)} className="card grid gap-4 p-5 sm:grid-cols-2" noValidate>
          <Field label="Full name" error={f.formState.errors.name}><input className="input" {...f.register('name', { required: 'Name is required' })} /></Field>
          <Field label="Phone" error={f.formState.errors.phone}><input className="input" {...f.register('phone', { required: 'Phone is required' })} /></Field>
          <CategoryFields register={f.register} category={user.residentCategory} emergency />
          <div className="sm:col-span-2"><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></div>
        </form>
        <form onSubmit={g.handleSubmit(change)} className="card h-fit space-y-4 p-5" noValidate>
          <h2 className="text-lg">Change password</h2>
          <Field label="Current password" error={g.formState.errors.currentPassword}><input type="password" autoComplete="current-password" className="input" {...g.register('currentPassword', { required: 'Required' })} /></Field>
          <Field label="New password" error={g.formState.errors.newPassword}><input type="password" autoComplete="new-password" className="input" {...g.register('newPassword', { required: 'Required', minLength: { value: 8, message: 'At least 8 characters' }, pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Use letters and numbers' } })} /></Field>
          <button className="btn-primary" disabled={pw}>{pw ? 'Updating…' : 'Update password'}</button>
        </form>
      </div>
    </>
  );
}
