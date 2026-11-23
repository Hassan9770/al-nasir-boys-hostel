import { z } from 'zod';
import MessPlan from '../models/MessPlan.js';
import MessSubscription from '../models/MessSubscription.js';
import Booking from '../models/Booking.js';
import { AppError, wrap, addMonths, startOfDay, paginate, pageResult, optStr, objectId } from '../utils/helpers.js';
import { recordAcceptance } from '../services/policy.js';
import { notifyWhatsApp } from '../services/notify.js';

export const planSchema = z.object({
  name: z.string().trim().min(2).max(100), description: optStr(1000),
  mealsPerDay: z.coerce.number().int().min(1).max(4), includedMeals: optStr(200),
  monthlyPrice: z.coerce.number().min(0), timings: optStr(300), menu: optStr(2000), menuImage: optStr(300),
  diningOption: z.enum(['dine_in', 'takeaway', 'both']).default('both'), active: z.boolean().default(true)
});
export const subscribeSchema = z.object({
  planId: objectId, customerType: z.enum(['hostel_resident', 'external']),
  startDate: z.coerce.date(), durationMonths: z.coerce.number().int().min(1).max(12),
  mealsPerDay: z.coerce.number().int().min(1).max(4),
  arrangement: z.enum(['dine_in', 'takeaway']).optional().or(z.literal('')),
  notes: optStr(500),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the Mess Terms and applicable Policies' }) })
});
export const subStatusSchema = z.object({ status: z.enum(['active', 'pending', 'expired', 'cancelled', 'rejected']), adminNote: optStr(500) });

const expireOld = () => MessSubscription.updateMany({ status: 'active', endDate: { $lte: new Date() } }, { status: 'expired' });

export const publicPlans = wrap(async (req, res) => res.json({ success: true, items: await MessPlan.find({ active: true }).sort({ monthlyPrice: 1 }) }));
export const adminPlans = wrap(async (req, res) => res.json({ success: true, items: await MessPlan.find().sort({ createdAt: -1 }) }));
export const createPlan = wrap(async (req, res) => res.status(201).json({ success: true, plan: await MessPlan.create(req.body) }));
export const updatePlan = wrap(async (req, res) => {
  const plan = await MessPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!plan) throw new AppError('Plan not found', 404);
  res.json({ success: true, plan });
});
export const deletePlan = wrap(async (req, res) => {
  if (await MessSubscription.exists({ plan: req.params.id })) throw new AppError('This plan has subscriptions. Deactivate it instead.', 409);
  await MessPlan.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
export const subscribe = wrap(async (req, res) => {
  const b = req.body;
  const plan = await MessPlan.findOne({ _id: b.planId, active: true });
  if (!plan) throw new AppError('This meal plan is not available', 404);
  if (b.mealsPerDay > plan.mealsPerDay) throw new AppError(`This plan includes at most ${plan.mealsPerDay} meals per day`, 422);
  const startDate = startOfDay(b.startDate);
  if (startDate < startOfDay()) throw new AppError('Start date cannot be in the past', 422);
  if (b.arrangement && plan.diningOption !== 'both' && plan.diningOption !== b.arrangement) throw new AppError('That collection/dining arrangement is not offered on this plan', 422);
  if (b.customerType === 'hostel_resident') {
    const stay = await Booking.exists({ user: req.user._id, status: { $in: ['approved', 'checked_in'] } });
    if (!stay) throw new AppError('Hostel resident subscriptions need an approved accommodation booking. Choose "External customer" if you live outside the hostel.', 409);
  }
  await expireOld();
  if (await MessSubscription.exists({ user: req.user._id, status: { $in: ['pending', 'active'] } })) throw new AppError('You already have a pending or active mess subscription', 409);
  const sub = await MessSubscription.create({
    user: req.user._id, customerType: b.customerType, plan: plan._id, monthlyPrice: plan.monthlyPrice, mealsPerDay: b.mealsPerDay,
    startDate, durationMonths: b.durationMonths, endDate: addMonths(startDate, b.durationMonths), arrangement: b.arrangement || undefined, notes: b.notes
  });
  await recordAcceptance(req.user._id, 'mess', req);
  notifyWhatsApp(`New mess subscription request: ${req.user.name} (${req.user.phone}), plan ${plan.name}.`);
  res.status(201).json({ success: true, subscription: sub });
});
export const mySubs = wrap(async (req, res) => {
  await expireOld();
  res.json({ success: true, items: await MessSubscription.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('plan', 'name timings diningOption') });
});
export const cancelMine = wrap(async (req, res) => {
  const s = await MessSubscription.findOne({ _id: req.params.id, user: req.user._id });
  if (!s) throw new AppError('Subscription not found', 404);
  if (s.status === 'pending') s.status = 'cancelled';
  else if (s.status === 'active') s.cancellationRequested = true;
  else throw new AppError('This subscription can no longer be cancelled', 409);
  await s.save();
  res.json({ success: true, subscription: s });
});
export const adminSubs = wrap(async (req, res) => {
  await expireOld();
  const pg = paginate(req); const q = {};
  if (req.query.status) q.status = req.query.status;
  if (req.query.customerType) q.customerType = req.query.customerType;
  const [items, total] = await Promise.all([
    MessSubscription.find(q).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit).populate('user', 'name phone email residentCategory').populate('plan', 'name'),
    MessSubscription.countDocuments(q)
  ]);
  res.json({ success: true, ...pageResult(items, total, pg) });
});
export const adminSetStatus = wrap(async (req, res) => {
  const s = await MessSubscription.findById(req.params.id);
  if (!s) throw new AppError('Subscription not found', 404);
  s.status = req.body.status; if (req.body.adminNote !== undefined) s.adminNote = req.body.adminNote;
  if (['cancelled', 'expired', 'rejected'].includes(s.status)) s.cancellationRequested = false;
  await s.save();
  res.json({ success: true, subscription: s });
});
