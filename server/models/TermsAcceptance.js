import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  context: { type: String, enum: ['registration', 'booking', 'mess', 'reacceptance'], required: true },
  items: [{ type: { type: String }, version: Number, _id: false }],
  acceptedAt: { type: Date, default: Date.now },
  ip: String
}, { timestamps: false });
export default mongoose.model('TermsAcceptance', schema);
