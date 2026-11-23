import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { waLink } from '../utils/format.js';
export default function WhatsAppButton() {
  const { settings: s } = useSettings();
  if (!s?.whatsappNumber) return null;
  return (
    <a href={waLink(s.whatsappNumber, s.whatsappMessage)} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
      className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg hover:brightness-95">
      <MessageCircle className="h-6 w-6" /><span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
