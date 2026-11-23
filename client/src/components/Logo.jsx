export default function Logo({ light }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true"><rect width="64" height="64" rx="14" fill={light ? '#c9a227' : '#0f2144'} /><path d="M12 32 32 14l20 18v18H38V38H26v12H12z" fill={light ? '#0f2144' : '#c9a227'} /></svg>
      <span className={`font-display text-sm font-black leading-tight sm:text-base ${light ? 'text-white' : 'text-navy-900'}`}>AL NASIR<br /><span className="text-gold-500">BOYS HOSTEL</span></span>
    </span>
  );
}
