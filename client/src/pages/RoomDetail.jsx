import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BedDouble } from 'lucide-react';
import useFetch from '../hooks/useFetch.js';
import api, { errMsg, img } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge, Field, Load, usePageMeta } from '../components/ui.jsx';
import CategoryFields from '../components/CategoryFields.jsx';
import TermsCheckbox from '../components/TermsCheckbox.jsx';
import { money, today } from '../utils/format.js';

export default function RoomDetail() {
  const { id } = useParams(); const state = useFetch(`/rooms/${id}`); const { user } = useAuth(); const nav = useNavigate();
  const room = state.data?.room; usePageMeta(room ? `Room ${room.roomNumber}` : 'Room');
  const [pic, setPic] = useState(0); const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { residentCategory: user?.residentCategory && user.residentCategory !== 'Mess Customer Only' ? user.residentCategory : 'Student', durationMonths: 1, emergencyName: user?.emergencyName || '', emergencyPhone: user?.emergencyPhone || '', institution: user?.institution || '', course: user?.course || '', company: user?.company || '', designation: user?.designation || '', employer: user?.employer || '', purposeOfStay: user?.purposeOfStay || '' } });
  const cat = watch('residentCategory');
  const submit = async (v) => {
    setBusy(true);
    try { await api.post('/bookings', { ...v, roomId: id, acceptTerms: true }); toast.success('Booking request submitted. Management will review it.'); nav('/portal/bookings'); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="container-x py-10">
      <Link to="/rooms" className="text-sm font-semibold text-navy-700 underline">← All rooms</Link>
      <Load state={state}>{room && (
        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="aspect-video overflow-hidden rounded-xl bg-navy-100">{room.images?.[pic] ? <img src={img(room.images[pic])} alt={`Room ${room.roomNumber}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-navy-500"><BedDouble className="h-16 w-16" /></div>}</div>
            {room.images?.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto">{room.images.map((u, i) => <button key={u} onClick={() => setPic(i)} aria-label={`Photo ${i + 1}`}><img src={img(u)} alt="" className={`h-16 w-24 rounded object-cover ${i === pic ? 'ring-2 ring-gold-500' : ''}`} loading="lazy" /></button>)}</div>}
            <div className="mt-6 flex items-center gap-3"><h1 className="text-3xl">Room {room.roomNumber}</h1><Badge value={room.availability} /></div>
            <p className="mt-2 text-2xl font-bold text-navy-800">{money(room.monthlyRent)}<span className="text-base font-normal text-slate-500"> / month per bed</span></p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">{[['Type', room.type], ['Total beds', room.totalBeds], ['Available now', room.availableBeds]].map(([k, v]) => <div key={k} className="card p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="text-lg font-bold">{v}</dd></div>)}</dl>
            {room.description && <p className="mt-4 text-slate-700">{room.description}</p>}
            {room.facilities?.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{room.facilities.map((f) => <li key={f} className="rounded-full bg-navy-50 px-3 py-1 text-sm">{f}</li>)}</ul>}
          </div>
          <div className="card h-fit p-5">
            <h2 className="text-xl">Book this room</h2>
            {!user ? <div className="mt-3"><p className="text-slate-600">Log in or create an account to send a booking request.</p><div className="mt-4 flex gap-3"><Link to="/login" state={{ from: `/rooms/${id}` }} className="btn-primary">Login</Link><Link to="/register" className="btn-outline">Sign Up</Link></div></div>
              : room.availability === 'unavailable' ? <p className="mt-3 text-slate-600">This room is not currently open for booking.</p>
              : (
              <form onSubmit={handleSubmit(submit)} className="mt-4 grid gap-4 sm:grid-cols-2" noValidate>
                <Field label="Resident category"><select className="input" {...register('residentCategory', { required: true })}>{['Student', 'Job Holder / Employee', 'Labour Worker', 'Business Owner / Self-Employed', 'Other'].map((c) => <option key={c}>{c}</option>)}</select></Field>
                <CategoryFields register={register} category={cat} errors={errors} emergency />
                <Field label="Check-in date" error={errors.checkIn}><input type="date" min={today()} className="input" {...register('checkIn', { required: 'Choose a check-in date', validate: (v) => v >= today() || 'Date cannot be in the past' })} /></Field>
                <Field label="Expected stay (months)" error={errors.durationMonths}><input type="number" min="1" max="24" className="input" {...register('durationMonths', { required: 'Enter duration', min: { value: 1, message: 'At least 1 month' }, max: { value: 24, message: 'Maximum 24 months' } })} /></Field>
                <div className="sm:col-span-2"><Field label="Additional requirements (optional)"><textarea rows={3} className="input" {...register('requirements')} /></Field></div>
                <p className="text-xs text-slate-500 sm:col-span-2">Booking as {user.name} · {user.phone} · {user.email}. Your booking is a request until management approves it.</p>
                <div className="sm:col-span-2"><TermsCheckbox register={register} error={errors.acceptTerms} /></div>
                <div className="sm:col-span-2"><button className="btn-gold w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit booking request'}</button></div>
              </form>)}
          </div>
        </div>)}</Load>
    </div>
  );
}
