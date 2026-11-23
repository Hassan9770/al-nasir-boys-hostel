import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { errMsg } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Field, usePageMeta } from '../components/ui.jsx';
import CategoryFields from '../components/CategoryFields.jsx';
import TermsCheckbox from '../components/TermsCheckbox.jsx';

const Shell = ({ title, sub, children }) => <div className="container-x max-w-lg py-12"><div className="card p-6 sm:p-8"><h1 className="text-2xl">{title}</h1>{sub && <p className="mt-1 text-slate-600">{sub}</p>}<div className="mt-6">{children}</div></div></div>;
const pwRules = { required: 'Enter a password', minLength: { value: 8, message: 'At least 8 characters' }, pattern: { value: /^(?=.*[A-Za-z])(?=.*\d).+$/, message: 'Use letters and numbers' } };

export function Login() {
  usePageMeta('Login'); const { login } = useAuth(); const nav = useNavigate(); const loc = useLocation(); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const submit = async (v) => { setBusy(true); try { const u = await login(v); nav(loc.state?.from || (u.role === 'admin' ? '/admin' : '/portal'), { replace: true }); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  return (
    <Shell title="Welcome back" sub="Log in to your Resident Dashboard.">
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}><input type="email" autoComplete="email" className="input" {...register('email', { required: 'Enter your email' })} /></Field>
        <Field label="Password" error={errors.password}><input type="password" autoComplete="current-password" className="input" {...register('password', { required: 'Enter your password' })} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <div className="flex justify-between text-sm"><Link className="underline" to="/forgot-password">Forgot password?</Link><Link className="underline" to="/register">Create an account</Link></div>
      </form>
    </Shell>
  );
}
export function Register() {
  usePageMeta('Sign Up'); const { register: signup } = useAuth(); const nav = useNavigate(); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { residentCategory: 'Student' } });
  const cat = watch('residentCategory');
  const submit = async (v) => { setBusy(true); try { await signup({ ...v, acceptTerms: true }); toast.success('Account created'); nav('/portal'); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  return (
    <Shell title="Create your account" sub="For hostel residents and mess customers.">
      <form onSubmit={handleSubmit(submit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2"><Field label="Full name" error={errors.name}><input className="input" autoComplete="name" {...register('name', { required: 'Enter your full name', minLength: { value: 2, message: 'Too short' } })} /></Field></div>
        <Field label="Email" error={errors.email}><input type="email" autoComplete="email" className="input" {...register('email', { required: 'Enter your email', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} /></Field>
        <Field label="Phone number" error={errors.phone}><input type="tel" autoComplete="tel" className="input" {...register('phone', { required: 'Enter your phone number', pattern: { value: /^[+\d][\d\s-]{6,18}$/, message: 'Enter a valid phone number' } })} /></Field>
        <div className="sm:col-span-2"><Field label="Resident category" hint="Choose “Mess Customer Only” if you live outside the hostel and only want meals."><select className="input" {...register('residentCategory', { required: true })}>{['Student', 'Job Holder / Employee', 'Labour Worker', 'Business Owner / Self-Employed', 'Other', 'Mess Customer Only'].map((c) => <option key={c}>{c}</option>)}</select></Field></div>
        <CategoryFields register={register} category={cat} errors={errors} />
        <Field label="Password" error={errors.password}><input type="password" autoComplete="new-password" className="input" {...register('password', pwRules)} /></Field>
        <Field label="Confirm password" error={errors.confirmPassword}><input type="password" autoComplete="new-password" className="input" {...register('confirmPassword', { required: 'Confirm your password', validate: (v) => v === watch('password') || 'Passwords do not match' })} /></Field>
        <div className="sm:col-span-2"><TermsCheckbox register={register} error={errors.acceptTerms} /></div>
        <div className="sm:col-span-2"><button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button><p className="mt-3 text-center text-sm">Already registered? <Link className="underline" to="/login">Log in</Link></p></div>
      </form>
    </Shell>
  );
}
export function Forgot() {
  usePageMeta('Forgot password'); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const submit = async (v) => { setBusy(true); try { await api.post('/auth/forgot-password', v); setSent(true); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  return (
    <Shell title="Reset your password" sub="We will send a reset link to your email.">
      {sent ? <p className="rounded bg-green-50 p-3 text-green-800">If that email is registered, a reset link has been sent. The link is valid for 30 minutes.</p> : (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email}><input type="email" className="input" {...register('email', { required: 'Enter your email' })} /></Field>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>)}
      <p className="mt-4 text-sm"><Link className="underline" to="/login">Back to login</Link></p>
    </Shell>
  );
}
export function Reset() {
  usePageMeta('Reset password'); const [sp] = useSearchParams(); const nav = useNavigate(); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const submit = async (v) => { setBusy(true); try { await api.post('/auth/reset-password', { token: sp.get('token'), password: v.password }); toast.success('Password reset. Please log in.'); nav('/login'); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  return (
    <Shell title="Choose a new password">
      {!sp.get('token') ? <p className="text-red-700">This reset link is missing its token. Request a new one.</p> : (
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <Field label="New password" error={errors.password}><input type="password" autoComplete="new-password" className="input" {...register('password', pwRules)} /></Field>
          <Field label="Confirm password" error={errors.confirm}><input type="password" autoComplete="new-password" className="input" {...register('confirm', { validate: (v) => v === watch('password') || 'Passwords do not match' })} /></Field>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Reset password'}</button>
        </form>)}
    </Shell>
  );
}
export const NotFound = () => <div className="container-x py-24 text-center"><h1 className="text-4xl">Page not found</h1><p className="mt-2 text-slate-600">The page you are looking for does not exist.</p><Link to="/" className="btn-primary mt-6">Go home</Link></div>;
