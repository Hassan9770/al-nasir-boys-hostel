import { z } from 'zod';
import Testimonial from '../models/Testimonial.js';
import GalleryImage from '../models/GalleryImage.js';
import ContactMessage from '../models/ContactMessage.js';
import { getSettings } from '../models/HostelSettings.js';
import { latestPublished } from '../services/policy.js';
import { wrap, optStr } from '../utils/helpers.js';
import { notifyWhatsApp } from '../services/notify.js';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number'),
  message: z.string().trim().min(5, 'Write a short message').max(2000)
});
export const settings = wrap(async (req, res) => {
  const s = (await getSettings()).toObject(); delete s._id; delete s.__v; delete s.singleton;
  s.facilities = (s.facilities || []).filter((f) => f.enabled);
  res.json({ success: true, settings: s });
});
export const policies = wrap(async (req, res) => res.json({ success: true, policies: await latestPublished() }));
export const testimonials = wrap(async (req, res) => res.json({ success: true, items: await Testimonial.find({ approved: true }).sort({ createdAt: -1 }).limit(12).select('-__v') }));
export const gallery = wrap(async (req, res) => {
  const q = { active: true }; if (req.query.category) q.category = req.query.category;
  res.json({ success: true, items: await GalleryImage.find(q).sort({ createdAt: -1 }) });
});
export const submitContact = wrap(async (req, res) => {
  await ContactMessage.create(req.body);
  notifyWhatsApp(`New website enquiry from ${req.body.name} (${req.body.phone}).`);
  res.status(201).json({ success: true, message: 'Thank you. We have received your message and will get back to you.' });
});
export { optStr };
