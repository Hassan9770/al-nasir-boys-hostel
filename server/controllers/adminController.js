import { z } from 'zod';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import MessSubscription from '../models/MessSubscription.js';
import HostelPolicy, { POLICY_TYPES } from '../models/HostelPolicy.js';
import ContactMessage from '../models/ContactMessage.js';
import Testimonial from '../models/Testimonial.js';
import GalleryImage, { GALLERY_CATEGORIES } from '../models/GalleryImage.js';
import { getSettings } from '../models/HostelSettings.js';
import { AppError, wrap, paginate, pageResult, escapeRegex, monthKey, optStr } from '../utils/helpers.js';
import { withAvailability, ACTIVE } from '../services/availability.js';

export const stats = wrap(async (req, res) => {
  const now = new Date(); const month = monthKey(now);
  const [rooms, residents, student, working, pendingBookings, approvedBookings, activeMess, externalMess, pendingMess, rentOut, messOut, revenue] = await Promise.all([
    Room.find({ status: 'active' }),
    User.countDocuments({ role: 'resident', active: true }),
    User.countDocuments({ role: 'resident', active: true, residentCategory: 'Student' }),
    User.countDocuments({ role: 'resident', active: true, residentCategory: { $in: ['Job Holder / Employee', 'Labour Worker', 'Business Owner / Self-Employed'] } }),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: { $in: ACTIVE } }),
    MessSubscription.countDocuments({ status: 'active' }),
    MessSubscription.countDocuments({ status: 'active', customerType: 'external' }),
    MessSubscription.countDocuments({ status: 'pending' }),
    Payment.aggregate([{ $match: { type: 'rent' } }, { $group: { _id: null, v: { $sum: { $max: [0, { $subtract: ['$amountDue', '$amountPaid'] }] } } } }]),
    Payment.aggregate([{ $match: { type: 'mess' } }, { $group: { _id: null, v: { $sum: { $max: [0, { $subtract: ['$amountDue', '$amountPaid'] }] } } } }]),
    Payment.aggregate([{ $unwind: '$transactions' }, { $match: { 'transactions.date': { $gte: new Date(month + '-01T00:00:00Z') } } }, { $group: { _id: '$type', v: { $sum: '$transactions.amount' } } }])
  ]);
  const withAvail = await withAvailability(rooms);
  const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
  const occupiedBeds = withAvail.reduce((s, r) => s + r.occupiedBeds, 0);
  const rev = Object.fromEntries(revenue.map((r) => [r._id, r.v]));
  res.json({ success: true, stats: {
    totalResidents: residents, studentResidents: student, workingResidents: working, totalRooms: rooms.length, totalBeds, availableBeds: totalBeds - occupiedBeds, occupiedBeds,
    pendingBookings, approvedBookings, activeMess, externalMess, pendingMess,
    outstandingRent: rentOut[0]?.v || 0, outstandingMess: messOut[0]?.v || 0,
    monthlyRentRevenue: rev.rent || 0, monthlyMessRevenue: rev.mess || 0, month
  } });
});

// Residents
export const listUsers = wrap(async (req, res) => {
  const pg = paginate(req); const q = { role: 'resident' };
  if (req.query.category) q.residentCategory = req.query.category;
  if (req.query.active === '0' || req.query.active === '1') q.active = req.query.active === '1';
  if (req.query.search) { const r = new RegExp(escapeRegex(req.query.search), 'i'); q.$or = [{ name: r }, { email: r }, { phone: r }]; }
  const [items, total] = await Promise.all([User.find(q).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit), User.countDocuments(q)]);
  res.json({ success: true, ...pageResult(items, total, pg) });
});
export const getUser = wrap(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'resident' });
  if (!user) throw new AppError('Resident not found', 404);
  const [bookings, payments, subs] = await Promise.all([
    Booking.find({ user: user._id }).sort({ createdAt: -1 }).populate('room', 'roomNumber type monthlyRent'),
    Payment.find({ user: user._id }).sort({ billingMonth: -1 }),
    MessSubscription.find({ user: user._id }).sort({ createdAt: -1 }).populate('plan', 'name')
  ]);
  res.json({ success: true, user, bookings, payments, subscriptions: subs });
});
export const userSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(), phone: z.string().trim().max(30).optional(), active: z.boolean().optional(),
  emergencyName: optStr(), emergencyPhone: optStr(20), institution: optStr(), course: optStr(), company: optStr(), designation: optStr(), employer: optStr(), purposeOfStay: optStr()
});
export const updateUser = wrap(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'resident' });
  if (!user) throw new AppError('Resident not found', 404);
  Object.assign(user, req.body); await user.save();
  res.json({ success: true, user });
});

// Settings
export const settingsSchema = z.object({
  hostelName: z.string().trim().max(100), tagline: optStr(200), description: optStr(3000), mission: optStr(1500), vision: optStr(1500), heroImage: optStr(300), messIntro: optStr(2000),
  phone: optStr(40), email: optStr(150), address: optStr(300), whatsappNumber: z.string().trim().regex(/^\d{8,15}$/, 'WhatsApp number: digits only with country code, e.g. 923001234567').optional().or(z.literal('')),
  whatsappMessage: optStr(300), mapLink: optStr(500), mapEmbedUrl: optStr(800), officeHours: optStr(200),
  social: z.object({ facebook: optStr(300), instagram: optStr(300), youtube: optStr(300), tiktok: optStr(300) }).optional(),
  facilities: z.array(z.object({ key: z.string().max(60), name: z.string().trim().min(1).max(100), description: optStr(400), icon: optStr(30), enabled: z.boolean() })).max(60).optional(),
  whyChooseUs: z.array(z.object({ title: z.string().max(100), text: z.string().max(400) })).max(12).optional(),
  faqs: z.array(z.object({ q: z.string().max(300), a: z.string().max(1500) })).max(30).optional(),
  payment: z.object({ rentDueDay: z.coerce.number().int().min(1).max(28), messPaymentDeadlineDays: z.coerce.number().int().min(0).max(30), methods: z.array(z.string().max(50)).max(10) }).optional()
}).partial();
export const updateSettings = wrap(async (req, res) => {
  const s = await getSettings();
  Object.entries(req.body).forEach(([k, v]) => { if (v !== undefined) s[k] = v; });
  await s.save();
  res.json({ success: true, settings: s });
});

export const listFacilities = wrap(async (req, res) => res.json({ success: true, items: (await getSettings()).facilities }));

// Policies (versioned)
export const policySchema = z.object({
  type: z.enum(POLICY_TYPES), title: z.string().trim().min(2).max(150), content: z.string().min(10).max(60000),
  requiresReacceptance: z.boolean().default(false), publish: z.boolean().default(false)
});
export const listPolicies = wrap(async (req, res) => res.json({ success: true, items: await HostelPolicy.find().sort({ type: 1, version: -1 }) }));
export const createPolicy = wrap(async (req, res) => {
  const last = await HostelPolicy.findOne({ type: req.body.type }).sort({ version: -1 });
  const { publish, ...rest } = req.body;
  const p = await HostelPolicy.create({ ...rest, version: (last?.version || 0) + 1, published: publish, publishedAt: publish ? new Date() : undefined });
  res.status(201).json({ success: true, policy: p });
});
export const updatePolicy = wrap(async (req, res) => {
  const p = await HostelPolicy.findById(req.params.id);
  if (!p) throw new AppError('Policy not found', 404);
  if (p.published) throw new AppError('Published versions are locked for audit purposes. Create a new version instead.', 409);
  const { publish, ...rest } = req.body;
  Object.assign(p, rest);
  if (publish) { p.published = true; p.publishedAt = new Date(); }
  await p.save();
  res.json({ success: true, policy: p });
});
export const deletePolicy = wrap(async (req, res) => {
  const p = await HostelPolicy.findById(req.params.id);
  if (!p) throw new AppError('Policy not found', 404);
  if (p.published) throw new AppError('Published versions cannot be deleted', 409);
  await p.deleteOne();
  res.json({ success: true });
});

// Contact enquiries
export const listContacts = wrap(async (req, res) => {
  const pg = paginate(req); const q = req.query.status ? { status: req.query.status } : {};
  const [items, total] = await Promise.all([ContactMessage.find(q).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit), ContactMessage.countDocuments(q)]);
  res.json({ success: true, ...pageResult(items, total, pg) });
});
export const contactSchema = z.object({ status: z.enum(['new', 'in_progress', 'resolved']).optional(), adminReply: optStr(2000) });
export const updateContact = wrap(async (req, res) => {
  const c = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) throw new AppError('Enquiry not found', 404);
  res.json({ success: true, contact: c });
});
export const deleteContact = wrap(async (req, res) => { await ContactMessage.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Testimonials
export const testimonialSchema = z.object({ displayName: z.string().trim().min(2).max(80), role: optStr(80), message: z.string().trim().min(5).max(600), rating: z.coerce.number().int().min(1).max(5).default(5), approved: z.boolean().default(false) });
export const listTestimonials = wrap(async (req, res) => res.json({ success: true, items: await Testimonial.find().sort({ createdAt: -1 }) }));
export const createTestimonial = wrap(async (req, res) => res.status(201).json({ success: true, item: await Testimonial.create(req.body) }));
export const updateTestimonial = wrap(async (req, res) => {
  const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!t) throw new AppError('Testimonial not found', 404);
  res.json({ success: true, item: t });
});
export const deleteTestimonial = wrap(async (req, res) => { await Testimonial.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Gallery
export const gallerySchema = z.object({ url: z.string().min(1).max(300), title: optStr(100), category: z.enum(GALLERY_CATEGORIES).default('Other'), active: z.boolean().default(true) });
export const listGalleryAdmin = wrap(async (req, res) => res.json({ success: true, items: await GalleryImage.find().sort({ createdAt: -1 }) }));
export const createGallery = wrap(async (req, res) => res.status(201).json({ success: true, item: await GalleryImage.create(req.body) }));
export const updateGallery = wrap(async (req, res) => {
  const g = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!g) throw new AppError('Image not found', 404);
  res.json({ success: true, item: g });
});
export const deleteGallery = wrap(async (req, res) => { await GalleryImage.findByIdAndDelete(req.params.id); res.json({ success: true }); });

export const uploadImage = (req, res, next) => {
  if (!req.file) return next(new AppError('Choose an image to upload', 400));
  res.status(201).json({ success: true, url: '/uploads/' + req.file.filename });
};
