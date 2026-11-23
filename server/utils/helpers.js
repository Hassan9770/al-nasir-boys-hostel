import { z } from 'zod';
export class AppError extends Error {
  constructor(message, status = 400, details) { super(message); this.status = status; this.details = details; }
}
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const addMonths = (d, m) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + m); return x; };
export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setUTCHours(0, 0, 0, 0); return x; };
export const paginate = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
export const pageResult = (items, total, { page, limit }) => ({ items, total, page, pages: Math.ceil(total / limit) || 1 });
export const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) {
    const details = r.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(new AppError(details[0]?.message || 'Validation failed', 422, details));
  }
  req.body = r.data; next();
};
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);
export const optStr = (max = 150) => z.string().trim().max(max).optional().or(z.literal(''));
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
