import { env } from '../config/env.js';
export const notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
export const errorHandler = (err, req, res, next) => { // eslint-disable-line
  let status = err.status || 500; let message = err.message; let details = err.details;
  if (err.name === 'ValidationError') { status = 422; details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })); message = details[0]?.message || 'Validation failed'; }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  else if (err.code === 11000) { status = 409; message = 'A record with these details already exists'; }
  else if (err.name === 'MulterError') { status = 400; message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 3 MB or smaller' : 'Upload failed'; }
  if (status >= 500) { console.error(err); message = 'Something went wrong on our side. Please try again.'; details = undefined; }
  res.status(status).json({ success: false, message, ...(details ? { details } : {}), ...(env.nodeEnv !== 'production' && status >= 500 ? { debug: err.message } : {}) });
};
