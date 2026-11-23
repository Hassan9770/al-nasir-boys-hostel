import HostelPolicy, { POLICY_TYPES } from '../models/HostelPolicy.js';
import TermsAcceptance from '../models/TermsAcceptance.js';

export async function latestPublished() {
  const out = {};
  for (const type of POLICY_TYPES) {
    const p = await HostelPolicy.findOne({ type, published: true }).sort({ version: -1 });
    if (p) out[type] = p;
  }
  return out;
}
export async function recordAcceptance(userId, context, req) {
  const latest = await latestPublished();
  const items = Object.values(latest).map((p) => ({ type: p.type, version: p.version }));
  return TermsAcceptance.create({ user: userId, context, items, ip: req.ip });
}
// Policies flagged "requiresReacceptance" whose latest version the user has not yet accepted.
export async function pendingAcceptance(userId) {
  const latest = await latestPublished();
  const acc = await TermsAcceptance.find({ user: userId }).lean();
  const accepted = {};
  acc.forEach((a) => a.items.forEach((i) => { accepted[i.type] = Math.max(accepted[i.type] || 0, i.version); }));
  return Object.values(latest)
    .filter((p) => (accepted[p.type] || 0) < p.version && (p.requiresReacceptance || !accepted[p.type]))
    .map((p) => ({ type: p.type, title: p.title, version: p.version }));
}
