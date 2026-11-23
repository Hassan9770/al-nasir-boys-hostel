import mongoose from 'mongoose';
const tx = new mongoose.Schema({
  amount: { type: Number, required: true, min: [1, 'Amount must be greater than zero'] },
  date: { type: Date, required: true },
  method: { type: String, required: true, trim: true },
  reference: { type: String, trim: true, maxlength: 100 },
  receiptNo: { type: String, required: true },
  note: { type: String, trim: true, maxlength: 300 },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['rent', 'mess'], required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'MessSubscription' },
  billingMonth: { type: String, required: true, match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Billing month must be YYYY-MM'] },
  amountDue: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  transactions: [tx],
  status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' }
}, { timestamps: true });
schema.index({ user: 1, type: 1, billingMonth: 1, booking: 1, subscription: 1 }, { unique: true });
schema.index({ billingMonth: 1, type: 1, status: 1 });
schema.pre('save', function (next) {
  this.amountPaid = this.transactions.reduce((s, t) => s + t.amount, 0);
  this.status = this.amountPaid <= 0 ? 'unpaid' : this.amountPaid >= this.amountDue ? 'paid' : 'partial';
  next();
});
schema.virtual('balance').get(function () { return Math.max(0, this.amountDue - this.amountPaid); });
schema.set('toJSON', { virtuals: true, transform: (d, r) => { delete r.id; delete r.__v; return r; } });
export default mongoose.model('Payment', schema);
