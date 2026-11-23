import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import User, { CATEGORIES } from '../models/User.js';
import { env } from '../config/env.js';
import { AppError, wrap, optStr } from '../utils/helpers.js';
import { recordAcceptance, pendingAcceptance } from '../services/policy.js';
import { sendEmail } from '../services/notify.js';

const password = z.string().min(8, 'Password must be at least 8 characters').max(72).regex(/[A-Za-z]/, 'Password needs a letter').regex(/\d/, 'Password needs a number');
const phone = z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, 'Enter a valid phone number');
const catFields = { institution: optStr(), course: optStr(), company: optStr(), designation: optStr(), employer: optStr(), purposeOfStay: optStr(), emergencyName: optStr(), emergencyPhone: optStr(20) };

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone, password, confirmPassword: z.string(),
  residentCategory: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Select a resident category' }) }),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms & Conditions and Policies' }) }),
  ...catFields
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });
export const profileSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), phone: phone.optional(), ...catFields });
export const changePwSchema = z.object({ currentPassword: z.string().min(1), newPassword: password });
export const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const resetSchema = z.object({ token: z.string().min(10), password });

const cookieOpts = () => ({ httpOnly: true, secure: env.nodeEnv === 'production', sameSite: env.cookieSameSite, maxAge: 7 * 24 * 3600 * 1000, path: '/' });
const issue = (res, user) => res.cookie('token', jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: env.jwtExpires }), cookieOpts());
const clean = (u) => (u.toJSON ? u.toJSON() : u);

export const register = wrap(async (req, res) => {
  const { confirmPassword, acceptTerms, password, ...rest } = req.body;
  if (await User.findOne({ email: rest.email })) throw new AppError('An account with this email already exists', 409);
  const user = await User.create({ ...rest, role: 'resident', passwordHash: await bcrypt.hash(password, 12) });
  await recordAcceptance(user._id, 'registration', req);
  issue(res, user);
  res.status(201).json({ success: true, user: clean(user), pendingPolicies: [] });
});
export const login = wrap(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
  const ok = user && (await bcrypt.compare(req.body.password, user.passwordHash));
  if (!ok) throw new AppError('Incorrect email or password', 401);
  if (!user.active) throw new AppError('This account has been deactivated. Please contact the hostel.', 403);
  issue(res, user);
  res.json({ success: true, user: clean(user), pendingPolicies: user.role === 'admin' ? [] : await pendingAcceptance(user._id) });
});
export const logout = (req, res) => { res.clearCookie('token', { ...cookieOpts(), maxAge: undefined }); res.json({ success: true }); };
export const me = wrap(async (req, res) => {
  res.json({ success: true, user: clean(req.user), pendingPolicies: req.user.role === 'admin' ? [] : await pendingAcceptance(req.user._id) });
});
export const acceptTerms = wrap(async (req, res) => {
  await recordAcceptance(req.user._id, 'reacceptance', req);
  res.json({ success: true, pendingPolicies: [] });
});
export const updateProfile = wrap(async (req, res) => {
  Object.entries(req.body).forEach(([k, v]) => { if (v !== undefined) req.user[k] = v; });
  await req.user.save();
  res.json({ success: true, user: clean(req.user) });
});
export const changePassword = wrap(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash))) throw new AppError('Current password is incorrect', 400);
  user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});
export const forgotPassword = wrap(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && user.active) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    await sendEmail({ to: user.email, subject: 'Reset your password', text: `Reset link (valid 30 minutes): ${env.clientUrl}/reset-password?token=${raw}` });
  }
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
});
export const resetPassword = wrap(async (req, res) => {
  const hash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({ resetTokenHash: hash, resetExpires: { $gt: new Date() } }).select('+resetTokenHash +resetExpires +passwordHash');
  if (!user) throw new AppError('This reset link is invalid or has expired', 400);
  user.passwordHash = await bcrypt.hash(req.body.password, 12);
  user.resetTokenHash = undefined; user.resetExpires = undefined;
  await user.save();
  res.json({ success: true, message: 'Password reset. You can now log in.' });
});
