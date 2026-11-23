import { z } from 'zod';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import MessSubscription from '../models/MessSubscription.js';
import { AppError, wrap, paginate, pageResult, optStr, objectId } from '../utils/helpers.js';

export const recordSchema = z.object({
  userId: objectId,
  type: z.enum(['rent', 'mess']),
  billingMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Billing month must be YYYY-MM'),
  bookingId: objectId.optional().or(z.literal('')),
  subscriptionId: objectId.optional().or(z.literal('')),
  amountDue: z.coerce.number().min(0).optional(),
  amountPaid: z.coerce.number().min(1, 'Enter the amount received'),
  paymentDate: z.coerce.date(),
  method: z.string().trim().min(2).max(50),
  reference: optStr(100), note: optStr(300)
});
export const generateSchema = z.object({ billingMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) });
const receiptNo = () => 'ANH-' + new Date().getFullYear() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();

export const myPayments = wrap(async (req, res) => {
  const items = await Payment.find({ user: req.user._id }).sort({ billingMonth: -1 }).populate('booking', 'checkIn').populate('subscription', 'status');
  const outstanding = items.reduce((s, p) => s + p.balance, 0);
  res.json({ success: true, items, outstanding });
});
export const getOne = wrap(async (req, res) => {
  const p = await Payment.findById(req.params.id).populate('user', 'name phone email residentCategory').populate('booking').populate('subscription');
  if (!p || (req.user.role !== 'admin' && String(p.user._id) !== String(req.user._id))) throw new AppError('Payment record not found', 404);
  res.json({ success: true, payment: p });
});
export const adminList = wrap(async (req, res) => {
  const pg = paginate(req); const q = {};
  ['type', 'status', 'billingMonth', 'user'].forEach((k) => { if (req.query[k]) q[k] = req.query[k]; });
  const [items, total] = await Promise.all([
    Payment.find(q).sort({ billingMonth: -1, createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('user', 'name phone residentCategory'),
    Payment.countDocuments(q)
  ]);
  res.json({ success: true, ...pageResult(items, total, pg) });
});
// Records money actually received by the hostel (cash/bank). Never auto-marks anything as paid.
export const record = wrap(async (req, res) => {
  const b = req.body;
  const filter = { user: b.userId, type: b.type, billingMonth: b.billingMonth, booking: b.bookingId || null, subscription: b.subscriptionId || null };
  let p = await Payment.findOne(filter);
  if (!p) {
    if (b.amountDue === undefined) throw new AppError('Enter the amount due for this new billing entry', 422);
    if (b.bookingId && !(await Booking.findOne({ _id: b.bookingId, user: b.userId }))) throw new AppError('Booking does not belong to this resident', 422);
    if (b.subscriptionId && !(await MessSubscription.findOne({ _id: b.subscriptionId, user: b.userId }))) throw new AppError('Subscription does not belong to this resident', 422);
    p = new Payment({ user: b.userId, type: b.type, billingMonth: b.billingMonth, amountDue: b.amountDue, booking: b.bookingId || undefined, subscription: b.subscriptionId || undefined });
  } else if (b.amountDue !== undefined) p.amountDue = b.amountDue;
  p.transactions.push({ amount: b.amountPaid, date: b.paymentDate, method: b.method, reference: b.reference, note: b.note, receiptNo: receiptNo(), recordedBy: req.user._id });
  await p.save();
  res.status(201).json({ success: true, payment: p });
});
// Creates unpaid ledger entries (amount due only) for everyone currently accommodated / subscribed.
export const generate = wrap(async (req, res) => {
  const [y, m] = req.body.billingMonth.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1)); const end = new Date(Date.UTC(y, m, 1));
  const bookings = await Booking.find({ status: { $in: ['approved', 'checked_in'] }, checkIn: { $lt: end }, checkOut: { $gt: start } }).populate('room', 'monthlyRent');
  const subs = await MessSubscription.find({ status: 'active', startDate: { $lt: end }, endDate: { $gt: start } });
  const docs = [
    ...bookings.map((b) => ({ user: b.user, type: 'rent', booking: b._id, amountDue: b.room?.monthlyRent || 0 })),
    ...subs.map((s) => ({ user: s.user, type: 'mess', subscription: s._id, amountDue: s.monthlyPrice }))
  ].map((d) => ({ ...d, billingMonth: req.body.billingMonth, transactions: [], status: 'unpaid', amountPaid: 0 }));
  let created = 0;
  for (const d of docs) {
    const r = await Payment.updateOne({ user: d.user, type: d.type, billingMonth: d.billingMonth, booking: d.booking || null, subscription: d.subscription || null }, { $setOnInsert: d }, { upsert: true });
    if (r.upsertedCount) created++;
  }
  res.json({ success: true, created, message: `${created} new billing entr${created === 1 ? 'y' : 'ies'} created` });
});
