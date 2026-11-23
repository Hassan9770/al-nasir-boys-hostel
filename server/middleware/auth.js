import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { AppError, wrap } from '../utils/helpers.js';

export const protect = wrap(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError('Please log in to continue', 401);
  let payload;
  try { payload = jwt.verify(token, env.jwtSecret); } catch { throw new AppError('Your session has expired. Please log in again', 401); }
  const user = await User.findById(payload.id);
  if (!user || !user.active) throw new AppError('This account is not available', 401);
  req.user = user; next();
});
export const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : next(new AppError('You do not have permission to do this', 403));

// CSRF defence: auth cookie is SameSite + CORS is locked to CLIENT_URL; additionally every
// state-changing request must carry a custom header that browsers will not send cross-site without CORS approval.
export const csrfGuard = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'XMLHttpRequest') return next(new AppError('Invalid request origin', 403));
  next();
};
