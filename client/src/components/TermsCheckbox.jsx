import { Link } from 'react-router-dom';
export default function TermsCheckbox({ register, error, mess }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1 h-4 w-4" {...register('acceptTerms', { required: 'You must accept the Terms & Conditions and Policies' })} />
        <span>I have read and agree to the <Link className="font-semibold text-navy-700 underline" to="/terms" target="_blank">Terms &amp; Conditions</Link>, <Link className="font-semibold text-navy-700 underline" to="/rules" target="_blank">Hostel Rules</Link>{mess && <>, the Mess Terms</>} and the <Link className="font-semibold text-navy-700 underline" to="/privacy" target="_blank">Privacy Policy</Link> and applicable Policies.</span>
      </label>
      {error && <p className="mt-1 text-sm text-red-600" role="alert">{error.message}</p>}
    </div>
  );
}
