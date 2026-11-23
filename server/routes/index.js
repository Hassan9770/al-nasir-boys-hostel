import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../utils/helpers.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import * as auth from '../controllers/authController.js';
import * as rooms from '../controllers/roomController.js';
import * as bookings from '../controllers/bookingController.js';
import * as pay from '../controllers/paymentController.js';
import * as mess from '../controllers/messController.js';
import * as admin from '../controllers/adminController.js';
import * as pub from '../controllers/publicController.js';

const r = Router();
const strict = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many attempts. Please try again later.' } });
const formLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, message: { success: false, message: 'Too many submissions. Please try again later.' } });

// Auth
r.post('/auth/register', strict, validate(auth.registerSchema), auth.register);
r.post('/auth/login', strict, validate(auth.loginSchema), auth.login);
r.post('/auth/logout', auth.logout);
r.post('/auth/forgot-password', strict, validate(auth.forgotSchema), auth.forgotPassword);
r.post('/auth/reset-password', strict, validate(auth.resetSchema), auth.resetPassword);
r.get('/auth/me', protect, auth.me);
r.post('/auth/accept-terms', protect, auth.acceptTerms);
r.patch('/auth/profile', protect, validate(auth.profileSchema), auth.updateProfile);
r.post('/auth/change-password', protect, strict, validate(auth.changePwSchema), auth.changePassword);

// Public
r.get('/public/settings', pub.settings);
r.get('/public/policies', pub.policies);
r.get('/public/testimonials', pub.testimonials);
r.get('/public/gallery', pub.gallery);
r.post('/public/contact', formLimit, validate(pub.contactSchema), pub.submitContact);
r.get('/rooms', rooms.listRooms);
r.get('/rooms/:id', rooms.getRoom);
r.get('/mess/plans', mess.publicPlans);

// Resident
r.post('/bookings', protect, validate(bookings.bookingSchema), bookings.createBooking);
r.get('/bookings/mine', protect, bookings.myBookings);
r.post('/bookings/:id/cancel', protect, bookings.cancelMine);
r.get('/payments/mine', protect, pay.myPayments);
r.get('/payments/:id', protect, pay.getOne);
r.post('/mess/subscriptions', protect, validate(mess.subscribeSchema), mess.subscribe);
r.get('/mess/subscriptions/mine', protect, mess.mySubs);
r.post('/mess/subscriptions/:id/cancel', protect, mess.cancelMine);

// Admin
const a = Router();
a.use(protect, adminOnly);
a.get('/stats', admin.stats);
a.post('/upload', upload.single('image'), admin.uploadImage);
a.get('/users', admin.listUsers);
a.get('/users/:id', admin.getUser);
a.patch('/users/:id', validate(admin.userSchema), admin.updateUser);
a.get('/rooms', (req, res, next) => { req.query.all = '1'; next(); }, rooms.listRooms);
a.post('/rooms', validate(rooms.roomSchema), rooms.createRoom);
a.put('/rooms/:id', validate(rooms.roomSchema), rooms.updateRoom);
a.delete('/rooms/:id', rooms.deleteRoom);
a.get('/bookings', bookings.adminList);
a.patch('/bookings/:id/status', validate(bookings.statusSchema), bookings.adminUpdateStatus);
a.get('/payments', pay.adminList);
a.post('/payments', validate(pay.recordSchema), pay.record);
a.post('/payments/generate', validate(pay.generateSchema), pay.generate);
a.get('/mess/plans', mess.adminPlans);
a.post('/mess/plans', validate(mess.planSchema), mess.createPlan);
a.put('/mess/plans/:id', validate(mess.planSchema), mess.updatePlan);
a.delete('/mess/plans/:id', mess.deletePlan);
a.get('/mess/subscriptions', mess.adminSubs);
a.patch('/mess/subscriptions/:id/status', validate(mess.subStatusSchema), mess.adminSetStatus);
a.get('/facilities', admin.listFacilities);
a.put('/settings', validate(admin.settingsSchema), admin.updateSettings);
a.get('/policies', admin.listPolicies);
a.post('/policies', validate(admin.policySchema), admin.createPolicy);
a.put('/policies/:id', validate(admin.policySchema), admin.updatePolicy);
a.delete('/policies/:id', admin.deletePolicy);
a.get('/contacts', admin.listContacts);
a.patch('/contacts/:id', validate(admin.contactSchema), admin.updateContact);
a.delete('/contacts/:id', admin.deleteContact);
a.get('/testimonials', admin.listTestimonials);
a.post('/testimonials', validate(admin.testimonialSchema), admin.createTestimonial);
a.put('/testimonials/:id', validate(admin.testimonialSchema), admin.updateTestimonial);
a.delete('/testimonials/:id', admin.deleteTestimonial);
a.get('/gallery', admin.listGalleryAdmin);
a.post('/gallery', validate(admin.gallerySchema), admin.createGallery);
a.put('/gallery/:id', validate(admin.gallerySchema), admin.updateGallery);
a.delete('/gallery/:id', admin.deleteGallery);
r.use('/admin', a);
export default r;
