import { env } from '../config/env.js';
// Official WhatsApp Business Cloud API. Disabled (no-op) unless all three env vars are set.
export async function notifyWhatsApp(text) {
  const { token, phoneId, notifyTo } = env.wa;
  if (!token || !phoneId || !notifyTo) return false;
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to: notifyTo, type: 'text', text: { body: text } })
    });
    return r.ok;
  } catch (e) { console.error('WhatsApp notify failed:', e.message); return false; }
}
// Email delivery is not configured. Replace with your provider (SMTP, SendGrid, etc.).
export async function sendEmail({ to, subject, text }) {
  console.log(`\n[EMAIL not configured] To: ${to}\nSubject: ${subject}\n${text}\n`);
}
